package com.example.Payment_Service.config;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@ConfigurationProperties(prefix = "momo")
@Validated
@Data
public class MomoProperties {

    @NotNull
    private String baseUrl;

    @NotNull
    private String subscriptionKey;

    @NotNull
    private String apiuserId;

    @NotNull
    private String apiuserApikey;

    @NotNull
    private String targetEnvironment;

    // NEW: required for create payment link / signature
    @NotNull
    private String partnerCode;

    @NotNull
    private String accessKey;

    @NotNull
    private String secretKey;

    @NotNull
    private String callbackUrl; // dùng cho ipnUrl / redirectUrl

    // optional
    private String partnerName = "Tiem Banh 247";
    private String requestType = "captureWallet";

    private String webhookSecret;
    private String currency = "VND";

    // Getters / Setters (bỏ comment nếu dùng Lombok)
    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getSubscriptionKey() { return subscriptionKey; }
    public void setSubscriptionKey(String subscriptionKey) { this.subscriptionKey = subscriptionKey; }

    public String getApiuserId() { return apiuserId; }
    public void setApiuserId(String apiuserId) { this.apiuserId = apiuserId; }

    public String getApiuserApikey() { return apiuserApikey; }
    public void setApiuserApikey(String apiuserApikey) { this.apiuserApikey = apiuserApikey; }

    public String getTargetEnvironment() { return targetEnvironment; }
    public void setTargetEnvironment(String targetEnvironment) { this.targetEnvironment = targetEnvironment; }

    public String getPartnerCode() { return partnerCode; }
    public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }

    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }

    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

    public String getCallbackUrl() { return callbackUrl; }
    public void setCallbackUrl(String callbackUrl) { this.callbackUrl = callbackUrl; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public String getWebhookSecret() { return webhookSecret; }
    public void setWebhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }

}
