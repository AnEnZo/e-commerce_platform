export type ProductVariant = {
  id: string;
  price: number;
  salePrice?: number;
  color?: string;
  size?: string;
  stockQuantity: number;
};

export type ProductVideo = {
  id: string;
  url: string;
  position?: number;
  caption?: string;
  isPrimary?: boolean;
};

export type Product = {
  id: string;
  name: string;
  barcode?: string;
  description?: string;
  imageUrls?: string[];
  videos?: ProductVideo[];
  status?: string;
  salesCount?: number;
  averageRating?: number;
  reviewCount?: number;
  productVariants?: ProductVariant[];
  categoryId?: string;
  shopId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SearchCriteria = {
  keyword?: string;
  categoryName?: string;
  shopId?: string;
  shopName?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  inStockOnly?: boolean;
  status?: string;
  color?: string | null;
  size?: string | null;
};

export type SearchFilters = {
  categories?: string[];
  shops?: string[];
  colors?: string[];
  sizes?: string[];
  priceRange?: { min?: number; max?: number };
  ratingRange?: { min?: number; max?: number };
};

export type ApiResponse = {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};


export type ApiVariant = {
  id?: string;
  sku?: string;
  price?: number;
  basePrice?: number;
  unitPrice?: number;
  salePrice?: number | null;
  discountPrice?: number | null;
  color?: string;
  size?: string | null;
  capacity?: string | null;
  stockQuantity?: number;
  quantityOnHand?: number;
  quantity?: number;
};

export type ApiProduct = {
  id: string;
  name?: string;
  barcode?: string;
  description?: string;
  imageUrls?: string[];
  images?: string[];
  videos?: string[];
  status?: string;
  salesCount?: number;
  averageRating?: number;
  reviewCount?: number;
  productVariants?: ApiVariant[];
  variants?: ApiVariant[];
  categoryId?: string;
  shopId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiResponseWrapper = {
  content?: ApiProduct[];
  products?: ApiProduct[];
  data?: ApiProduct[];
  totalElements?: number;
  total?: number;
};

export type CartItemDTO = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};