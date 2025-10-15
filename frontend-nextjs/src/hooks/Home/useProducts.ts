// hooks/useProducts.ts
'use client';

import { useState, useCallback } from 'react';
import type {
  Product,
  ProductVariant as UIProductVariant,
  ProductVideo,
  ApiProduct,
  ApiResponseWrapper,
  SearchCriteria
} from '@/types/Home/types';
import * as api from '@/lib/home/api';

type HeadersRecord = Record<string, string>;
type PageableParams = { page?: number; size?: number; sortBy?: string; sortDir?: string };
type Filters = Record<string, unknown>;

// helper: đọc cookie client-side
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({});

  type HeadersRecord = Record<string, string>;


const getAuthHeaders = useCallback((overrides?: HeadersRecord): HeadersRecord => {
  const xsrf = readCookie('XSRF-TOKEN') || readCookie('XSRF_TOKEN') || null;

  const base: HeadersRecord = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (xsrf) {
    base['X-XSRF-TOKEN'] = xsrf;
  }

  return {
    ...base,
    ...(overrides ?? {}),
  };
}, []);


  function normalizeProduct(p: ApiProduct): Product {
    const rawVariants = p.productVariants ?? p.variants ?? [];
    const productVariants: UIProductVariant[] = (Array.isArray(rawVariants) ? rawVariants : []).map((v) => ({
      id: (v.id ?? v.sku ?? `${p.id}-${Math.random().toString(36).slice(2, 7)}`) as string,
      price: Number(v.price ?? v.basePrice ?? v.unitPrice ?? 0),
      salePrice:
        typeof v.salePrice !== 'undefined' && v.salePrice !== null
          ? Number(v.salePrice)
          : typeof v.discountPrice !== 'undefined' && v.discountPrice !== null
          ? Number(v.discountPrice)
          : undefined,
      color: (v.color ?? undefined) as string | undefined,
      size: (v.size ?? v.capacity ?? undefined) as string | undefined,
      stockQuantity: Number(v.stockQuantity ?? v.quantityOnHand ?? v.quantity ?? 0),
    }));

    // ApiProduct.videos is defined as string[] in your types — map to ProductVideo[]
    const videos: ProductVideo[] =
      Array.isArray(p.videos) && p.videos.every((x) => typeof x === 'string')
        ? (p.videos as string[]).map((url, i) => ({
            id: `${p.id}-vid-${i}`,
            url,
            position: i,
            caption: undefined,
            isPrimary: i === 0,
          }))
        : (p.videos as unknown as ProductVideo[]) ?? [];

    return {
      id: p.id,
      name: p.name ?? '',
      barcode: p.barcode ?? undefined,
      description: p.description ?? '',
      imageUrls: p.imageUrls ?? p.images ?? [],
      videos,
      status: p.status ?? undefined,
      salesCount: Number(p.salesCount ?? 0),
      averageRating: Number(p.averageRating ?? 0),
      reviewCount: Number(p.reviewCount ?? 0),
      productVariants,
      categoryId: p.categoryId ?? undefined,
      shopId: p.shopId ?? undefined,
      createdAt: p.createdAt ?? undefined,
      updatedAt: p.updatedAt ?? undefined,
    };
  }

  const loadFilters = useCallback(async () => {
    try {
      
      const data = await api.getFilters?.(getAuthHeaders());
      setFilters((data ?? {}) as Filters);
    } catch (e) {
      
      console.warn('loadFilters error', e);
    }
  }, [getAuthHeaders]);

  async function handleApiResponse(raw: ApiResponseWrapper | undefined, append = false, pageNumber = 0) {
    const arr = raw?.content ?? raw?.products ?? raw?.data ?? [];
    const totalCount = raw?.totalElements ?? raw?.total ?? (Array.isArray(arr) ? arr.length : 0);
    const normalized = (Array.isArray(arr) ? arr : []).map((item) => normalizeProduct(item as ApiProduct));
    if (append) setProducts((prev) => [...prev, ...normalized]);
    else setProducts(normalized);
    setTotal(Number(totalCount ?? 0));
    setPage(pageNumber);
  }

  const loadAllProducts = useCallback(
    async (pageNumber = 0, size = 12, sortBy = 'salesCount', sortDir = 'desc') => {
      setLoading(true);
      try {
        const data = await api.getProducts({ page: pageNumber, size, sortBy, sortDir } as PageableParams, getAuthHeaders());
        await handleApiResponse(data ?? undefined, pageNumber > 0, pageNumber);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('loadAllProducts error', err);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const loadByCategory = useCallback(
    async (categoryName: string, pageNumber = 0, size = 18, sortBy = 'salesCount', sortDir = 'desc') => {
      setLoading(true);
      try {
        const data = await api.getProductsByCategory(categoryName, { page: pageNumber, size, sortBy, sortDir } as PageableParams, getAuthHeaders());
        await handleApiResponse(data ?? undefined, pageNumber > 0, pageNumber);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('loadByCategory error', err);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const search = useCallback(
    async (criteria: SearchCriteria, pageNumber = 0, size = 12, sortBy = 'salesCount', sortDir = 'desc') => {
      setLoading(true);
      try {
        const data = await api.advancedSearch(criteria, { page: pageNumber, size, sortBy, sortDir } as PageableParams, getAuthHeaders());
        await handleApiResponse(data ?? undefined, pageNumber > 0, pageNumber);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('search error', err);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  return {
    products,
    total,
    page,
    loading,
    filters,
    loadFilters,
    loadAllProducts,
    loadByCategory,
    search,
  };
}
