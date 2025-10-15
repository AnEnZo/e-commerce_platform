package com.example.Payment_Service.service.serviceimpl;

import com.example.Payment_Service.dto.RefundDto;
import com.example.Payment_Service.entity.Refund;
import com.example.Payment_Service.repository.RefundRepository;
import com.example.Payment_Service.service.RefundService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;

    public RefundServiceImpl(RefundRepository refundRepository) {
        this.refundRepository = refundRepository;
    }

    @Override
    public Mono<RefundDto> createRefund(RefundDto refundDto) {
        Refund refund = new Refund();
        // map fields
        refund.setPaymentId(refundDto.getPaymentId());
        refund.setAllocationId(refundDto.getAllocationId());
        refund.setAmount(refundDto.getAmount());
        refund.setReason(refundDto.getReason());
        refund.setStatus(refundDto.getStatus());
        refund.setProviderRefundId(refundDto.getProviderRefundId());

        return refundRepository.save(refund)
                .map(saved -> new RefundDto(
                        saved.getId(),
                        saved.getPaymentId(),
                        saved.getAllocationId(),
                        saved.getAmount(),
                        saved.getReason(),
                        saved.getStatus(),
                        saved.getProviderRefundId(),
                        saved.getCreatedAt(),
                        saved.getUpdatedAt()
                ));
    }

    @Override
    public Mono<RefundDto> getRefundById(UUID id) {
        return refundRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Refund not found")))
                .map(saved -> new RefundDto(
                        saved.getId(),
                        saved.getPaymentId(),
                        saved.getAllocationId(),
                        saved.getAmount(),
                        saved.getReason(),
                        saved.getStatus(),
                        saved.getProviderRefundId(),
                        saved.getCreatedAt(),
                        saved.getUpdatedAt()
                ));
    }

    @Override
    public Flux<RefundDto> getAllRefunds() {
        return refundRepository.findAll()
                .map(e -> new RefundDto(
                        e.getId(),
                        e.getPaymentId(),
                        e.getAllocationId(),
                        e.getAmount(),
                        e.getReason(),
                        e.getStatus(),
                        e.getProviderRefundId(),
                        e.getCreatedAt(),
                        e.getUpdatedAt()
                ));
    }

    @Override
    public Mono<Void> deleteRefund(UUID id) {
        return refundRepository.deleteById(id);
    }
}
