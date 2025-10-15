// app/products/[id]/page.tsx
'use client';

import React, { JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Product, ProductVariant } from '@/types/Home/types'; // -> đổi đường dẫn nếu bạn không dùng alias
import { getProductById } from '@/lib/home/api'; // -> đổi đường dẫn nếu cần
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProductDetailPage(): JSX.Element {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [mainImage, setMainImage] = React.useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);

    getProductById(id)
      .then((data) => {
        if (!mounted) return;
        setProduct(data);
        const img = data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls[0] : null;
        setMainImage(img);
        if (data.productVariants && data.productVariants.length > 0) {
          setSelectedVariant(data.productVariants[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        // nếu muốn, điều hướng về trang khác:
        // router.push('/');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [id, router]);

  function formatPriceForVariant(variant?: ProductVariant | null) {
    if (!variant) return 'Liên hệ';
    const price = variant.salePrice ?? variant.price;
    return `₫${price.toLocaleString()}`;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">Không tìm thấy sản phẩm.</div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header lang="vi" setLang={() => {}} openLogin={() => router.push('/login')} />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left: gallery */}
            <div className="w-full lg:w-1/2">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="h-96 flex items-center justify-center border rounded overflow-hidden">
                  {mainImage ? (
                    (product.videos ?? []).find(v => v.isPrimary)?.url === mainImage ? (
                      <video
                        src={mainImage}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted
                        loop
                        controls={false}
                      />
                    ) : (
                      <img src={mainImage} alt={product.name} className="max-h-full object-contain" />
                    )
                  ) : (
                    <div className="text-6xl">📦</div>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {/* Video thumbnails nếu có */}
                  {(product.videos ?? []).length > 0 && (product.videos ?? []).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setMainImage(v.url)}
                      className={`flex-none w-20 h-20 border rounded overflow-hidden ${mainImage === v.url ? 'ring-2 ring-orange-500' : ''}`}
                    >
                      <video src={v.url} className="w-full h-full object-cover" muted />
                    </button>
                  ))}

                  {/* Image thumbnails */}
                  {product.imageUrls?.map((u, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(u)}
                      className={`flex-none w-20 h-20 border rounded overflow-hidden ${mainImage === u ? 'ring-2 ring-orange-500' : ''}`}
                    >
                      <img src={u} alt={`${product.name}-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: info */}
            <div className="w-full lg:w-1/2">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h1>

              <div className="flex items-center gap-4 mb-3">
                <div className="text-2xl font-bold text-orange-500">{selectedVariant ? formatPriceForVariant(selectedVariant) : 'Liên hệ'}</div>
                <div className="text-sm text-gray-500">{product.salesCount ? `Đã bán ${product.salesCount}` : ''}</div>
                <div className="text-sm text-gray-600 ml-auto">{product.averageRating ? `⭐ ${product.averageRating.toFixed(1)} (${product.reviewCount ?? 0})` : '⭐ --'}</div>
              </div>

              {/* Variants */}
              {product.productVariants && product.productVariants.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Chọn biến thể</div>
                  <div className="flex flex-wrap gap-2">
                    {product.productVariants.map((v) => {
                      const key = `${v.id}-${v.color ?? ''}-${v.size ?? ''}`;
                      const display = [v.color, v.size].filter(Boolean).join(' / ') || (v.salePrice ?? v.price).toLocaleString();
                      const outOfStock = v.stockQuantity === 0;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-2 border rounded text-sm ${selectedVariant?.id === v.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'} ${outOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={outOfStock}
                        >
                          {display}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock & status */}
              <div className="mb-4 text-sm text-gray-600">
                {selectedVariant ? (
                  selectedVariant.stockQuantity > 0 ? `Còn ${selectedVariant.stockQuantity} sản phẩm` : 'Hết hàng'
                ) : ''}
              </div>

              {/* Add to cart (tạm) */}
              <div className="flex gap-3 items-center mb-6">
                <button
                  className="px-5 py-3 bg-orange-500 text-white rounded-md font-medium shadow hover:shadow-md"
                  onClick={() => alert('Nút "Thêm vào giỏ hàng" tạm thời chưa có logic.')}
                >
                  Thêm vào giỏ hàng
                </button>

                <button
                  className="px-4 py-2 border rounded text-sm"
                  onClick={() => window.print()}
                >
                  In thông tin
                </button>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <h3 className="text-base font-semibold mb-2">Mô tả sản phẩm</h3>
                <div className="text-sm text-gray-700">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <div>Chưa có mô tả chi tiết.</div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom: additional meta */}
          <div className="mt-6 border-t pt-4 text-sm text-gray-600">
            <div>SKU / Barcode: {product.barcode ?? '—'}</div>
            <div>Trạng thái: {product.status ?? '—'}</div>
            <div>Ngày tạo: {product.createdAt ? new Date(product.createdAt).toLocaleString() : '—'}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
