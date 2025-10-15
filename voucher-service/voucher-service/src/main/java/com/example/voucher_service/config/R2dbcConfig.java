package com.example.voucher_service.config;

import com.example.voucher_service.ennum.DiscountType;
import com.example.voucher_service.ennum.Eligibility;
import com.example.voucher_service.ennum.PlatformScope;
import com.example.voucher_service.ennum.VoucherStatus;
import io.r2dbc.postgresql.codec.EnumCodec;
import io.r2dbc.postgresql.extension.CodecRegistrar;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class R2dbcConfig {

}
