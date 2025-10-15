'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/home.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SidebarCategories from '@/components/Home/SidebarCategories';
import Slideshow from '@/components/Home/Slideshow';
import FlashSale from '@/components/Home/FlashSale';
import ProductGrid from '@/components/Home/ProductGrid';
import FiltersPanel from '@/components/Home/FiltersPanel';
import { useProducts } from '@/hooks/Home/useProducts';
import { useAuthFromUrl } from '@/hooks/Home/useAuth';
import { ALL_CATEGORIES } from '@/components/Home/constants';
import type { SearchCriteria } from '@/types/Home/types';


export default function Home() {
  useAuthFromUrl();
  const router = useRouter();
  const [lang, setLang] = React.useState<'vi'|'en'>('vi');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [criteria, setCriteria] = React.useState<SearchCriteria>({ inStockOnly: false, status: 'ACTIVE' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 18; // số sản phẩm mỗi trang
  const { products, total, loading, loadFilters, loadAllProducts, loadByCategory, search } = useProducts();
  const [currentView, setCurrentView] = React.useState<'all'|'category'|'search'>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  React.useEffect(() => {
    loadFilters();
    loadAllProducts(0);
  }, [loadFilters, loadAllProducts]);

  function onCategoryClick(name: string) {
    setCurrentPage(1); // reset page
    if (name === 'Tất cả') {
      setCurrentView('all');
      setSelectedCategory('');
      loadAllProducts(0, pageSize);
    } else {
      setCurrentView('category');
      setSelectedCategory(name);
      loadByCategory(name, 0, pageSize);
    }
  }

  function onSearch() {
    const term = searchTerm.trim();
    if (!term) { alert('Vui lòng nhập từ khóa tìm kiếm!'); return; }
    const c = { ...criteria, keyword: term };
    setCriteria(c);
    setCurrentView('search');
    setCurrentPage(1);
    search(c, 0);
  }

  function onProductClick(p: { id: string }) { router.push(`/product/${p.id}`); }

  function onApplyFilters() { search(criteria, 0); }

  function goToPage(page: number, categoryName?: string) {
    setCurrentPage(page);
    if (currentView === 'all') loadAllProducts(page-1, pageSize);
    else if (currentView === 'category') loadByCategory(categoryName || selectedCategory, page-1, pageSize);
    else search(criteria, page-1, pageSize);
  }

  function resetFilters() { const base = { inStockOnly: false, status: 'ACTIVE' }; setCriteria(base); setSearchTerm(''); loadAllProducts(0); }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-orange-500 text-white text-center py-2 text-sm">🎉 SIÊU SALE 12.12 - GIẢM ĐẾN 50% + FREESHIP 0Đ 🎉</div>

      <Header lang={lang} setLang={setLang} />

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <SidebarCategories onClick={onCategoryClick} />

          <section className="flex-1">
            <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden"><Slideshow /></div>
            <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden p-4"><FlashSale /></div>

            <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">DANH MỤC</h3>
              <div className="grid grid-cols-5 lg:grid-cols-10 gap-4">
                {ALL_CATEGORIES.slice(0,20).map((cat, i) => (
                  <button key={i} onClick={() => onCategoryClick(cat.name)} className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                    <div className={`w-12 h-12 rounded-full ${cat.color} flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                    <span className="text-xs text-gray-700 text-center leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {currentView === 'all' ? 'GỢI Ý HÔM NAY' : currentView === 'category' ? `Danh mục: ${selectedCategory}` : 'Kết quả tìm kiếm' }
                    {total>0 && <span className="text-gray-500"> ({total} sản phẩm)</span>}
                  </h3>
                </div>
                {loading && <div className="text-sm text-gray-600">Đang tải...</div>}
              </div>
            </div>

            <ProductGrid
              products={products}
              loading={loading}
              total={total}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={goToPage}
              onProductClick={onProductClick}
            />

          </section>

          <aside className="w-72">
            <FiltersPanel criteria={criteria} setCriteria={setCriteria} onApply={onApplyFilters} onReset={resetFilters} categories={ALL_CATEGORIES.map(c => c.name)} />

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-3">SẮP XẾP THEO</h4>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[{ value: 'salesCount', label: 'Bán Chạy', icon: '🔥' },{ value: 'createdAt', label: 'Mới Nhất', icon: '🆕' },{ value: 'averageRating', label: 'Đánh Giá', icon: '⭐' },{ value: 'name', label: 'Tên A-Z', icon: '📝' }].map(o=> (
                    <button key={o.value} className="px-3 py-2 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-orange-100">{o.icon} {o.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
