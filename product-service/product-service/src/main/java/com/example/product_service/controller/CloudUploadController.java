package com.example.product_service.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.product_service.config.CloudinaryConfigProperties;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@AllArgsConstructor
@Slf4j
public class CloudUploadController {

    private final Cloudinary cloudinary;
    private final CloudinaryConfigProperties props;

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<String>> uploadImage(@RequestPart("file") FilePart filePart) {
        log.debug("Received upload-image request, filename={}", filePart.filename());

        Mono<Path> createTemp = Mono.fromCallable(() -> {
            String filename = filePart.filename() != null ? filePart.filename() : "file";
            String ext = "";
            int idx = filename.lastIndexOf('.');
            if (idx >= 0 && idx < filename.length() - 1) ext = filename.substring(idx);
            return Files.createTempFile("upload-", ext.isEmpty() ? null : ext);
        }).subscribeOn(Schedulers.boundedElastic());

        return Mono.usingWhen(
                        createTemp,
                        tempPath ->
                                filePart.transferTo(tempPath)
                                        .doOnSubscribe(s -> log.debug("Start transferring FilePart -> temp file: {}", tempPath))
                                        .doOnSuccess(v -> log.debug("Transfer completed to temp file: {}", tempPath))
                                        .then(Mono.fromCallable(() -> {
                                            log.debug("Uploading image file to Cloudinary: {}", tempPath);
                                            @SuppressWarnings("unchecked")
                                            Map<String, Object> uploadResult = cloudinary.uploader().upload(tempPath.toFile(), ObjectUtils.emptyMap());
                                            String url = (String) uploadResult.get("secure_url");
                                            log.info("Cloudinary upload succeeded, url={}", url);
                                            return url;
                                        }).subscribeOn(Schedulers.boundedElastic())),
                        tempPath -> Mono.fromRunnable(() -> {
                            try { Files.deleteIfExists(tempPath); log.debug("Deleted temp file: {}", tempPath); }
                            catch (Exception e) { log.warn("Failed delete temp file {}: {}", tempPath, e.getMessage()); }
                        }).subscribeOn(Schedulers.boundedElastic()),
                        (tempPath, ex) -> Mono.fromRunnable(() -> { try { Files.deleteIfExists(tempPath); } catch (Exception ignored) {} })
                                .subscribeOn(Schedulers.boundedElastic()),
                        tempPath -> Mono.fromRunnable(() -> { try { Files.deleteIfExists(tempPath); } catch (Exception ignored) {} })
                                .subscribeOn(Schedulers.boundedElastic())
                )
                .map(url -> ResponseEntity.ok(url))
                .doOnError(ex -> log.error("Upload image thất bại", ex))
                .onErrorResume(ex -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Upload image thất bại: " + ex.getMessage())));
    }

    @PostMapping(value = "/upload-video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<String>> uploadVideo(@RequestPart("file") FilePart filePart) {
        log.debug("Received upload-video request, filename={}", filePart.filename());

        Mono<Path> createTemp = Mono.fromCallable(() -> {
            String filename = filePart.filename() != null ? filePart.filename() : "file";
            String ext = "";
            int idx = filename.lastIndexOf('.');
            if (idx >= 0 && idx < filename.length() - 1) ext = filename.substring(idx);
            return Files.createTempFile("upload-", ext.isEmpty() ? null : ext);
        }).subscribeOn(Schedulers.boundedElastic());

        return Mono.usingWhen(
                        createTemp,
                        tempPath ->
                                filePart.transferTo(tempPath)
                                        .doOnSubscribe(s -> log.debug("Start transferring FilePart -> temp file: {}", tempPath))
                                        .doOnSuccess(v -> log.debug("Transfer completed to temp file: {}", tempPath))
                                        .then(Mono.fromCallable(() -> {
                                            log.debug("Uploading video file to Cloudinary: {}", tempPath);
                                            Map<String, Object> opts = ObjectUtils.asMap("resource_type", "video");
                                            @SuppressWarnings("unchecked")
                                            Map<String, Object> uploadResult = cloudinary.uploader().upload(tempPath.toFile(), opts);
                                            String url = (String) uploadResult.get("secure_url");
                                            log.info("Cloudinary video upload succeeded, url={}", url);
                                            return url;
                                        }).subscribeOn(Schedulers.boundedElastic())),
                        tempPath -> Mono.fromRunnable(() -> {
                            try { Files.deleteIfExists(tempPath); log.debug("Deleted temp file: {}", tempPath); }
                            catch (Exception e) { log.warn("Failed delete temp file {}: {}", tempPath, e.getMessage()); }
                        }).subscribeOn(Schedulers.boundedElastic()),
                        (tempPath, ex) -> Mono.fromRunnable(() -> { try { Files.deleteIfExists(tempPath); } catch (Exception ignored) {} })
                                .subscribeOn(Schedulers.boundedElastic()),
                        tempPath -> Mono.fromRunnable(() -> { try { Files.deleteIfExists(tempPath); } catch (Exception ignored) {} })
                                .subscribeOn(Schedulers.boundedElastic())
                )
                .map(url -> ResponseEntity.ok(url))
                .doOnError(ex -> log.error("Upload video thất bại", ex))
                .onErrorResume(ex -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Upload video thất bại: " + ex.getMessage())));
    }



    // sign giữ nguyên
    @GetMapping("/sign")
    public ResponseEntity<Map<String, Object>> sign(@RequestParam(required = false) String folder) {
        long timestamp = java.time.Instant.now().getEpochSecond();
        Map<String, Object> paramsToSign = new java.util.HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        if (folder != null && !folder.isBlank()) paramsToSign.put("folder", folder);
        String signature = cloudinary.apiSignRequest(paramsToSign, props.getApiSecret());
        Map<String, Object> resp = Map.of(
                "api_key", props.getApiKey(),
                "cloud_name", props.getCloudName(),
                "timestamp", timestamp,
                "signature", signature
        );
        return ResponseEntity.ok(resp);
    }
}
