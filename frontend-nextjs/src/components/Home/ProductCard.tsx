'use client';

import React from 'react';
import type { Product } from '@/types/Home/types';

export default function ProductCard({ product, onClick }: { product: Product; onClick: (p: Product) => void }) {
  const formatMoney = (n: number) => `₫${Math.round(n).toLocaleString()}`;

  function priceInfo() {
    const variants = product.productVariants || [];
    if (variants.length === 0) return { displaySale: 'Chưa có option', displayOriginal: null, isSale: false };

    const basePrices = variants
      .map(v => v.price ?? (v as any).basePrice ?? 0)
      .filter(v => typeof v === 'number' && !isNaN(v));

    const finalPrices = variants
      .map(v => (v.salePrice ?? v.price ?? (v as any).basePrice ?? 0))
      .filter(v => typeof v === 'number' && !isNaN(v));

    const salePrices = variants
      .map(v => v.salePrice)
      .filter(s => s !== undefined && s !== null && !isNaN(s));

    if (finalPrices.length === 0 || basePrices.length === 0) return { displaySale: 'Liên hệ', displayOriginal: null, isSale: false };

    const minBase = Math.min(...basePrices);
    const maxBase = Math.max(...basePrices);
    const minFinal = Math.min(...finalPrices);
    const maxFinal = Math.max(...finalPrices);

    const isSale = salePrices.length > 0;

    const displaySale =
      minFinal === maxFinal ? formatMoney(minFinal) : `${formatMoney(minFinal)} - ${formatMoney(maxFinal)}`;

    const displayOriginal = isSale
      ? (minBase === maxBase ? formatMoney(minBase) : `${formatMoney(minBase)} - ${formatMoney(maxBase)}`)
      : null;

    return { displaySale, displayOriginal, isSale };
  }

  const { displaySale, displayOriginal, isSale } = priceInfo();

  const img = (product.imageUrls && product.imageUrls.length > 0)
    ? product.imageUrls[0]
    : (product as any).images?.[0] ?? '';

  const hasSaleBadge = (product.productVariants || []).some(v => {
    const base = v.price ?? (v as any).basePrice ?? 0;
    const sale = v.salePrice ?? null;
    return sale !== null && sale < base;
  });

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white" onClick={() => onClick(product)}>
      <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        {img ? <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" /> : <div className="text-3xl">📦</div>}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-orange-500 text-white p-1 rounded-full text-xs">❤️</button>
        </div>
        {hasSaleBadge && (<div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">SALE</div>)}
      </div>

      <div className="p-3">
        <h4 className="text-xs font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">{product.name}</h4>

        <div className="mb-2">
          {/* Giá sale (dòng trên, nổi bật) */}
          <div className="text-orange-500 font-bold text-sm">
            {displaySale}
          </div>

          {/* Giá gốc (dòng dưới, gạch ngang, chỉ hiện khi có sale) */}
          {displayOriginal && (
            <div className="text-xs text-gray-400 line-through mt-1" aria-hidden>
              {displayOriginal}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <span>{product.averageRating ? `⭐ ${product.averageRating.toFixed(1)}` : '⭐ --'}</span>
            {product.reviewCount ? <span>({product.reviewCount})</span> : null}
          </div>
          {product.salesCount ? <span>Đã bán {product.salesCount}</span> : null}
        </div>
      </div>
    </div>
  );
}
