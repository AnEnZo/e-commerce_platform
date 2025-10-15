'use client';

import React from 'react';
import type { Product } from '@/types/Home/types';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products = [],
  loading,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onProductClick
}: {
  products?: Product[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onProductClick: (p: Product) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {products.length === 0 && !loading ? (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-4">📦</div>
          <div>Không tìm thấy sản phẩm nào</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} onClick={onProductClick} />)}
        </div>
      )}

      {total > 0 && (
        <Pagination
          total={total}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}



function Pagination({ total, pageSize, currentPage, onPageChange }:
  { total: number; pageSize: number; currentPage: number; onPageChange: (p: number) => void })
{
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-6 space-x-2">
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 border rounded ${p === currentPage ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
