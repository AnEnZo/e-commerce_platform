package com.example.auth_service.config;

import com.example.auth_service.entity.Roles;
import com.example.auth_service.entity.User;
import com.example.auth_service.entity.UserRole;
import com.example.auth_service.ennum.AuthProvider;
import com.example.auth_service.repository.RolesRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RolesRepository roleRepo;
    private final UserRepository userRepo;
    private final UserRoleRepository userRoleRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        System.out.println("🔧 DataInitializer is running...");

        Flux.fromArray(new String[]{"ROLE_ADMIN", "ROLE_STAFF", "ROLE_USER"})
                .concatMap(roleName ->
                        roleRepo.findByName(roleName)
                                .switchIfEmpty(
                                        roleRepo.save(Roles.builder().name(roleName).build())
                                                .doOnNext(r -> System.out.println("✅ Created role: " + r.getName()))
                                )
                )
                .then(
                        userRepo.findByUsername("admin")
                                .doOnNext(u -> System.out.println("⚠️ Found existing admin: " + u.getUsername()))
                                .switchIfEmpty(
                                        Mono.defer(() -> {
                                            System.out.println("🚀 Creating new admin user...");
                                            User admin = User.builder()
                                                    .username("admin")
                                                    .displayName("AnEnZo")
                                                    .password(passwordEncoder.encode("123456"))
                                                    .email("dinhtuanan2802@gmail.com")
                                                    .phoneNumber("84564870803")
                                                    .rewardPoints(200)
                                                    .provider(AuthProvider.LOCAL)
                                                    .build();
                                            return userRepo.save(admin)
                                                    .doOnNext(u -> System.out.println("✅ Created admin user: " + u.getUsername()));
                                        })
                                )

                                .flatMap(adminUser ->
                                        roleRepo.findByName("ROLE_ADMIN")
                                                .flatMap(adminRole -> {
                                                    UserRole mapping = UserRole.builder()
                                                            .userId(adminUser.getId())
                                                            .roleId(adminRole.getId())
                                                            .build();
                                                    return userRoleRepo.save(mapping)
                                                            .doOnNext(m -> System.out.println("✅ Assigned ROLE_ADMIN to admin"));
                                                })
                                )
                )
                .subscribe(); // <- bắt buộc để chạy
    }

}
