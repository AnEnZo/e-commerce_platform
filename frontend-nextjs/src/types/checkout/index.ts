export interface CartItem {
id: string;
name: string;
image: string;
price: number;
quantity: number;
shopName: string;
shopId?: string;
selected: boolean;
}


export interface Address {
id: string;
userId: string;
receiverName: string;
phoneNumber: string;
detailAddress: string;
ward: string;
district: string;
province: string;
isDefault: boolean;
}


export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'PLATFORM' | 'SHOP';
  minOrderAmount: number;
  maxDiscount?: number;
  discountValue: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface VoucherPreview {
  success: boolean;
  message?: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedVouchers: {
    platformVoucher?: Voucher;
    shopVoucher?: Voucher;
  };
}

export interface UserVoucher {
  id: string;
  voucherId: string;
  userId: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED';
  voucher: Voucher;
}


export interface PaymentMethod {
id: string;
name: string;
icon: string;
description: string;
type: 'MOMO' | 'BANK_TRANSFER' | 'COD';
}

export type UUID = string;
export type DecimalString = string; // e.g. "12345.67"
export type IsoDateTime = string; // ISO 8601

export type DiscountType = 'PERCENT' | 'FIXED';
export type VoucherStatus = 'UNUSED' | 'USED' | 'EXPIRED';

// PlatformVoucherDTO (frontend mirror)
export interface PlatformVoucherDTO {
  id: UUID;
  code: string;
  discountValue: DecimalString;
  discountType: DiscountType;
  minOrderAmount?: DecimalString;
  startAt?: IsoDateTime;
  endAt?: IsoDateTime;
  usageLimit?: number;
  usedCount?: number;
  scope?: string; // PlatformScope -> keep string or specific union if known
  categoryId?: UUID | null;
}

// ShopVoucherDTO
export interface ShopVoucherDTO {
  id: UUID;
  shopId: UUID;
  code: string;
  discountValue: DecimalString;
  discountType: DiscountType;
  minOrderAmount?: DecimalString;
  startAt?: IsoDateTime;
  endAt?: IsoDateTime;
  usageLimit?: number;
  usedCount?: number;
  eligibility?: string;
}

// UserVoucherDTO (mirror)
export interface UserVoucherDTO {
  id: UUID;
  platformVoucherId?: UUID | null;
  shopVoucherId?: UUID | null;
  userId: UUID;
  status: VoucherStatus;
  issuedAt?: IsoDateTime;
  expireAt?: IsoDateTime;
  usedAt?: IsoDateTime;
  voucherCode?: string;
  discountValue?: DecimalString;
  discountType?: DiscountType;
}