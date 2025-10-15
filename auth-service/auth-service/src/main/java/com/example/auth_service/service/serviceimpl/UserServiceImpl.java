package com.example.auth_service.service.serviceimpl;

import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UserDTO;
import com.example.auth_service.ennum.AuthProvider;
import com.example.auth_service.entity.Roles;

import com.example.auth_service.entity.User;
import com.example.auth_service.entity.UserRole;
import com.example.auth_service.mapper.UserMapper;
import com.example.auth_service.repository.RolesRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.repository.UserRoleRepository;
import com.example.auth_service.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RolesRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRoleRepository userRoleRepository;

    // helper: load role names for a user and return UserDTO
    private Mono<UserDTO> toDtoWithRoles(User user) {
        return userRoleRepository.findAllByUserId(user.getId()) // Flux<UserRole>
                .flatMap(ur -> roleRepository.findById(ur.getRoleId())) // Flux<Roles>
                .map(Roles::getName)
                .collect(Collectors.toSet()) // Mono<Set<String>>
                .map(roleNames -> UserMapper.toDTO(user, roleNames));
    }

    @Override
    public Flux<UserDTO> getAllUsers(Pageable pageable) {
        int skip = pageable.getPageNumber() * pageable.getPageSize();
        return userRepository.findAll()
                .skip(skip)
                .take(pageable.getPageSize())
                .flatMap(this::toDtoWithRoles);
    }

    @Override
    public Mono<UserDTO> getUserById(UUID id) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found id: " + id)))
                .flatMap(this::toDtoWithRoles);
    }

    @Override
    public Mono<UserDTO> createUser(UserDTO userDTO) {
        String username = userDTO.getUsername();
        String email = userDTO.getEmail();

        return Mono.zip(userRepository.findByUsername(username).hasElement(),
                        userRepository.findByEmail(email).hasElement())
                .flatMap(tuple -> {
                    boolean userExists = tuple.getT1();
                    boolean emailExists = tuple.getT2();
                    if (userExists) {
                        return Mono.error(new IllegalArgumentException("Username đã có người sử dụng"));
                    }
                    if (emailExists) {
                        return Mono.error(new IllegalArgumentException("Email đã có người sử dụng"));
                    }

                    return roleRepository.findByName("ROLE_USER")
                            .switchIfEmpty(Mono.error(new RuntimeException("Error: Role USER không tồn tại")))
                            .flatMap(role ->
                                    // build User (blocking encode) on boundedElastic
                                    Mono.fromCallable(() -> {
                                                User u = UserMapper.toEntity(userDTO);
                                                u.setRewardPoints(0);
                                                u.setProvider(AuthProvider.LOCAL);
                                                u.setPassword(passwordEncoder.encode(userDTO.getPassword()));
                                                return u;
                                            }).subscribeOn(Schedulers.boundedElastic())
                                            .flatMap(user -> userRepository.save(user)
                                                    .retryWhen(
                                                            Retry.fixedDelay(3, Duration.ofMillis(100))
                                                                    .filter(this::isDuplicateKeyException)
                                                                    .doBeforeRetry(sig -> System.err.println("⚠️ UUID collision, retry " + sig.totalRetriesInARow()))
                                                    )
                                            )
                                            // create user_role link and return DTO with role name
                                            .flatMap(savedUser -> {
                                                UserRole ur = UserRole.builder()
                                                        .userId(savedUser.getId())
                                                        .roleId(role.getId())
                                                        .build();
                                                return userRoleRepository.save(ur)
                                                        .thenReturn(savedUser);
                                            })
                                            .flatMap(this::toDtoWithRoles)
                            );
                });
    }

    @Override
    public Mono<UserDTO> createStaff(UserDTO userDTO) {
        String username = userDTO.getUsername();
        String email = userDTO.getEmail();

        return Mono.zip(userRepository.findByUsername(username).hasElement(),
                        userRepository.findByEmail(email).hasElement())
                .flatMap(tuple -> {
                    if (tuple.getT1()) return Mono.error(new IllegalArgumentException("Username đã có người sử dụng"));
                    if (tuple.getT2()) return Mono.error(new IllegalArgumentException("Email đã có người sử dụng"));

                    return roleRepository.findByName("ROLE_STAFF")
                            .switchIfEmpty(Mono.error(new RuntimeException("Error: Role STAFF không tồn tại")))
                            .flatMap(role ->
                                    Mono.fromCallable(() -> {
                                                User u = UserMapper.toEntity(userDTO);
                                                u.setProvider(AuthProvider.LOCAL);
                                                u.setPassword(passwordEncoder.encode(userDTO.getPassword()));
                                                return u;
                                            }).subscribeOn(Schedulers.boundedElastic())
                                            .flatMap(user -> userRepository.save(user)
                                                    .retryWhen(
                                                            Retry.fixedDelay(3, Duration.ofMillis(100))
                                                                    .filter(this::isDuplicateKeyException)
                                                                    .doBeforeRetry(sig -> System.err.println("⚠️ UUID collision, retry " + sig.totalRetriesInARow()))
                                                    )
                                            )
                                            .flatMap(savedUser -> {
                                                UserRole ur = UserRole.builder()
                                                        .userId(savedUser.getId())
                                                        .roleId(role.getId())
                                                        .build();
                                                return userRoleRepository.save(ur).thenReturn(savedUser);
                                            })
                                            .flatMap(this::toDtoWithRoles)
                            );
                });
    }

    @Override
    public Mono<UserDTO> updateUser(UUID id, UserDTO userDTO) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found: " + id)))
                .flatMap(user -> Mono.fromCallable(() -> {
                    user.setUsername(userDTO.getUsername());
                    user.setEmail(userDTO.getEmail());
                    user.setPhoneNumber(userDTO.getPhoneNumber());
                    // only update password if provided
                    if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank()) {
                        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
                    }
                    return user;
                }).subscribeOn(Schedulers.boundedElastic()))
                .flatMap(userRepository::save)
                .flatMap(this::toDtoWithRoles);
    }

    @Override
    public Mono<Boolean> deleteUser(UUID id) {
        return userRepository.existsById(id)
                .flatMap(exists -> {
                    if (!exists) return Mono.just(false);
                    // remove user_roles links first (optional but recommended)
                    return userRoleRepository.findAllByUserId(id)
                            .flatMap(userRoleRepository::delete)
                            .then(userRepository.deleteById(id))
                            .thenReturn(true);
                });
    }

    @Override
    public Flux<UserDTO> searchUser(String keyword) {
        return userRepository.findByUsernameContainingIgnoreCase(keyword)
                .flatMap(this::toDtoWithRoles);
    }

    @Override
    public Mono<Boolean> existsByUsername(String username) {
        return userRepository.findByUsername(username).hasElement();
    }

    @Override
    public Mono<Boolean> existsByEmail(String email) {
        return userRepository.findByEmail(email).hasElement();
    }

    @Override
    public Mono<UserDTO> registerNewUser(RegisterRequest registerRequest) {
        String username = registerRequest.getUsername();
        String email = registerRequest.getEmail();

        return Mono.zip(userRepository.findByUsername(username).hasElement(),
                        userRepository.findByEmail(email).hasElement())
                .flatMap(tuple -> {
                    if (tuple.getT1()) return Mono.error(new RuntimeException("Username đã có người sử dụng"));
                    if (tuple.getT2()) return Mono.error(new RuntimeException("Email đã có người sử dụng"));

                    return roleRepository.findByName("ROLE_USER")
                            .switchIfEmpty(Mono.error(new RuntimeException("Error: Role USER không tồn tại")))
                            .flatMap(role -> Mono.fromCallable(() -> {
                                                User user = User.builder()
                                                        .username(registerRequest.getUsername())
                                                        .password(passwordEncoder.encode(registerRequest.getPassword()))
                                                        .email(registerRequest.getEmail())
                                                        .phoneNumber(registerRequest.getPhoneNumber())
                                                        .rewardPoints(0)
                                                        .provider(AuthProvider.LOCAL)
                                                        .build();
                                                return user;
                                            }).subscribeOn(Schedulers.boundedElastic())
                                            .flatMap(user -> userRepository.save(user)
                                                    .retryWhen(
                                                            Retry.fixedDelay(3, Duration.ofMillis(100))
                                                                    .filter(this::isDuplicateKeyException)
                                                                    .doBeforeRetry(sig -> System.err.println("⚠️ UUID collision, retry " + sig.totalRetriesInARow()))
                                                    )
                                            )
                                            .flatMap(savedUser -> {
                                                UserRole ur = UserRole.builder()
                                                        .userId(savedUser.getId())
                                                        .roleId(role.getId())
                                                        .build();
                                                return userRoleRepository.save(ur).thenReturn(savedUser);
                                            })
                                            .flatMap(this::toDtoWithRoles)
                            );
                });
    }

    @Override
    public Mono<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Mono<Void> updatePassword(User user, String rawPassword) {
        return Mono.fromCallable(() -> {
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    return user;
                })
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(userRepository::save)
                .then();
    }

    @Override
    public Mono<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Mono<User> processOAuthUser(String provider, String providerId, String email, String username, String displayname) {
        return userRepository.findByEmail(email)
                .flatMap(existing -> {
                    if (!existing.getProvider().equals(AuthProvider.valueOf(provider.toUpperCase()))) {
                        return Mono.error(new IllegalArgumentException("Looks like you're signed up with " + existing.getProvider()));
                    }
                    // update if needed (skip for now)
                    return Mono.just(existing);
                })
                .switchIfEmpty(
                        roleRepository.findByName("ROLE_USER")
                                .switchIfEmpty(Mono.error(new RuntimeException("Error: Role USER không tồn tại")))
                                .flatMap(role -> {
                                    User u = User.builder()
                                            .email(email)
                                            .displayName(displayname)
                                            .username(username)
                                            .provider(AuthProvider.valueOf(provider.toUpperCase()))
                                            .providerId(providerId)
                                            .rewardPoints(0)
                                            .build();
                                    return userRepository.save(u)
                                            .retryWhen(
                                                    Retry.fixedDelay(3, Duration.ofMillis(100))
                                                            .filter(this::isDuplicateKeyException)
                                                            .doBeforeRetry(sig ->
                                                                    System.err.println("⚠️ UUID collision, retry " + sig.totalRetriesInARow())
                                                            )
                                            )
                                            .flatMap(savedUser -> {
                                                UserRole ur = UserRole.builder()
                                                        .userId(savedUser.getId())
                                                        .roleId(role.getId())
                                                        .build();
                                                return userRoleRepository.save(ur).thenReturn(savedUser);
                                            });
                                })
                );
    }

    @Override
    public Mono<UserDTO> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found: " + username)))
                .flatMap(this::toDtoWithRoles);
    }

    @Override
    public Mono<UserDTO> updateCurrentUser(String username, java.util.Map<String, Object> updates) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")))
                .flatMap(user -> {
                    if (updates.containsKey("displayName")) {
                        String dn = (String) updates.get("displayName");
                        if (dn == null || dn.isBlank()) return Mono.error(new IllegalArgumentException("displayName không được để trống"));
                        user.setDisplayName(dn);
                    }
                    if (updates.containsKey("email")) {
                        String newEmail = (String) updates.get("email");
                        if (!newEmail.matches("^[\\w-.]+@[\\w-]+(\\.[\\w-]+)+$"))
                            return Mono.error(new IllegalArgumentException("Email không hợp lệ"));
                        return userRepository.findByEmail(newEmail)
                                .flatMap(found -> {
                                    if (!found.getId().equals(user.getId())) return Mono.error(new IllegalArgumentException("Email đã được sử dụng"));
                                    user.setEmail(newEmail);
                                    return Mono.just(user);
                                })
                                .defaultIfEmpty(user);
                    }
                    if (updates.containsKey("phoneNumber")) {
                        String phone = (String) updates.get("phoneNumber");
                        if (!phone.matches("^[0-9]{10,11}$"))
                            return Mono.error(new IllegalArgumentException("SĐT không hợp lệ"));
                        user.setPhoneNumber(phone);
                    }
                    return Mono.just(user);
                })
                .flatMap(userRepository::save)
                .flatMap(this::toDtoWithRoles);
    }

    private boolean isDuplicateKeyException(Throwable e) {
        return e != null && e.getMessage() != null && e.getMessage().contains("duplicate key");
    }
}
