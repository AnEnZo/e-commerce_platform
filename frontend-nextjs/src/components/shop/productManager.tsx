// ProductManager.tsx
import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../css/ProductManager.css';
import Sidebar from '@/components/shop/Sidebar';

export type ProductStatus = 'active' | 'inactive' | 'out-of-stock';

export interface Product {
  id: number;
  name: string;
  desc?: string;
  sku?: string;
  price: string;
  originalPrice?: string;
  stock: number;
  sold: number;
  status: ProductStatus;
  emoji?: string;
  images?: string[]; // data URLs or remote urls
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    desc: 'Titan Tự Nhiên, Chính hãng VN/A',
    sku: 'IP15PM-256-TN',
    price: '₫25.990.000',
    originalPrice: '₫32.990.000',
    stock: 45,
    sold: 128,
    status: 'active',
    emoji: '📱',
  },
  {
    id: 2,
    name: 'Laptop Gaming ASUS ROG Strix G15',
    desc: 'RTX 4060, 16GB RAM, 512GB SSD',
    sku: 'ASUS-G15-4060',
    price: '₫22.990.000',
    originalPrice: '₫29.990.000',
    stock: 12,
    sold: 89,
    status: 'active',
    emoji: '💻',
  },
  {
    id: 3,
    name: 'AirPods Pro (2nd generation)',
    desc: 'USB-C, Chống ồn chủ động',
    sku: 'APP-2ND-USBC',
    price: '₫5.990.000',
    originalPrice: '₫6.990.000',
    stock: 0,
    sold: 156,
    status: 'out-of-stock',
    emoji: '🎧',
  },
  {
    id: 4,
    name: 'Apple Watch Series 9',
    desc: 'GPS, 45mm, Midnight Aluminum',
    sku: 'AW9-45-MID',
    price: '₫8.990.000',
    originalPrice: '₫10.990.000',
    stock: 28,
    sold: 67,
    status: 'inactive',
    emoji: '⌚',
  },
  {
    id: 5,
    name: 'iPad Pro M2 11 inch',
    desc: 'WiFi, 256GB, Space Gray',
    sku: 'IPP-M2-11-256',
    price: '₫18.990.000',
    originalPrice: '₫22.990.000',
    stock: 35,
    sold: 43,
    status: 'active',
    emoji: '📱',
  },
];

const formatVND = (n: number) => {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  } catch (e) {
    return `₫${n.toLocaleString('vi-VN')}`;
  }
};

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filter, setFilter] = useState<'all' | ProductStatus>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('Thêm sản phẩm mới');

  // modal size: small for add, large for edit
  const [modalSize, setModalSize] = useState<'small' | 'large'>('small');

  // Form state (controlled)
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(0);
  const [weight, setWeight] = useState<number | ''>('');
  const [size, setSize] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [emoji, setEmoji] = useState('📦');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  function filteredProducts() {
    const base = filter === 'all' ? products : products.filter((p) => p.status === filter);
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
  }

  function toggleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    if (checked) {
      const ids = filteredProducts().map((p) => p.id);
      setSelected(new Set(ids));
    } else {
      setSelected(new Set());
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const clone = new Set(prev);
      if (clone.has(id)) clone.delete(id);
      else clone.add(id);
      return clone;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function openAddProductModal() {
    setModalTitle('Thêm sản phẩm mới');
    setModalSize('small'); // small window for adding
    resetForm();
    setShowModal(true);
  }

  function editProduct(id: number) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setModalTitle('Chỉnh sửa sản phẩm');
    setModalSize('large'); // larger modal for editing
    // load into form
    setName(p.name);
    setSku(p.sku || '');
    setDesc(p.desc || '');
    setPrice(Number((p.price || '').replace(/[^0-9]/g, '')) || '');
    setOriginalPrice(Number((p.originalPrice || '').replace(/[^0-9]/g, '')) || '');
    setStock(p.stock || 0);
    setStatus(p.status);
    setEmoji(p.emoji || '📦');
    setImages(p.images || []);
    setShowModal(true);
  }

  function duplicateProduct(id: number) {
    if (!confirm('Bạn có muốn sao chép sản phẩm này?')) return;
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const nextId = products.length ? Math.max(...products.map((x) => x.id)) + 1 : 1;
    const copy: Product = { ...p, id: nextId, name: p.name + ' (Sao chép)' };
    setProducts((prev) => [copy, ...prev]);
    setSuccessMessage('Sao chép sản phẩm thành công');
  }

  function deleteProduct(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => {
      const clone = new Set(prev);
      clone.delete(id);
      return clone;
    });
    setSuccessMessage('Đã xóa sản phẩm (demo)');
  }

  function resetForm() {
    setName('');
    setSku('');
    setDesc('');
    setCategory('');
    setBrand('');
    setPrice('');
    setOriginalPrice('');
    setStock(0);
    setWeight('');
    setSize('');
    setStatus('active');
    setEmoji('📦');
    images.forEach((u) => { /* revoke if needed */ });
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function onImageAreaClick() {
    fileInputRef.current?.click();
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const arr: string[] = [];
    for (let i = 0; i < files.length && i < 9; i++) {
      const f = files[i];
      const url = URL.createObjectURL(f);
      arr.push(url);
    }
    images.forEach((u) => URL.revokeObjectURL(u));
    setImages(arr);
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    // basic validation
    if (!name.trim()) return alert('Vui lòng nhập tên sản phẩm');
    if (price === '' || price === null) return alert('Vui lòng nhập giá bán');
    if (stock === '' || stock === null) return alert('Vui lòng nhập số lượng');

    const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: nextId,
      name: name.trim(),
      desc: desc.trim(),
      sku: sku.trim() || `SKU-${nextId}`,
      price: typeof price === 'number' ? formatVND(price) : String(price),
      originalPrice: originalPrice ? formatVND(Number(originalPrice)) : undefined,
      stock: Number(stock) || 0,
      sold: 0,
      status,
      emoji,
      images: images.slice(0, 9),
    };

    // if editing existing (modalSize === 'large' and an id existed), try to detect editing by matching sku/name
    if (modalTitle.includes('Chỉnh sửa')) {
      setProducts((prev) => prev.map((p) => (p.sku === sku || p.id === newProduct.id ? { ...p, ...newProduct } : p)));
      setSuccessMessage('Cập nhật sản phẩm thành công');
    } else {
      setProducts((prev) => [newProduct, ...prev]);
      setSuccessMessage('Sản phẩm đã được thêm thành công');
    }

    setShowModal(false);
    resetForm();
  }

  const visible = filteredProducts();

  return (
    <div className="product-manager-root">
      <Header />

      <div className="shopee-bg min-h-screen">
        <div className="flex">
         <Sidebar activeKey="products" />
          <div className="container mx-auto px-4 lg:px-8 py-6">
            <main className="flex-1">

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý sản phẩm</h1>
                  <p className="text-gray-600">Quản lý tất cả sản phẩm trong shop của bạn</p>
                </div>
                <button onClick={openAddProductModal} className="shopee-orange text-black px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2">
                  <span>➕</span>
                  <span>Thêm sản phẩm mới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg card-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Tổng sản phẩm</p>
                      <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                    </div>
                    <div className="text-3xl">📦</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg card-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Đang bán</p>
                      <p className="text-2xl font-bold text-green-600">{products.filter((p) => p.status === 'active').length}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg card-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Hết hàng</p>
                      <p className="text-2xl font-bold text-red-600">{products.filter((p) => p.status === 'out-of-stock').length}</p>
                    </div>
                    <div className="text-3xl">❌</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg card-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Tạm ẩn</p>
                      <p className="text-2xl font-bold text-yellow-600">{products.filter((p) => p.status === 'inactive').length}</p>
                    </div>
                    <div className="text-3xl">👁️‍🗨️</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg card-shadow mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tất cả</button>
                      <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Đang bán</button>
                      <button className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`} onClick={() => setFilter('inactive')}>Tạm ẩn</button>
                      <button className={`filter-btn ${filter === 'out-of-stock' ? 'active' : ''}`} onClick={() => setFilter('out-of-stock')}>Hết hàng</button>
                    </div>

                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Sắp xếp theo</option>
                      <option>Tên A-Z</option>
                      <option>Tên Z-A</option>
                    </select>
                  </div>
                </div>
              </div>

              <div id="bulk-actions" className={`bulk-actions ${selected.size > 0 ? 'show' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">Đã chọn <span id="selected-count">{selected.size}</span> sản phẩm</span>
                    <button className="text-shopee-orange hover:text-red-600 font-medium">Bật bán</button>
                    <button className="text-gray-600 hover:text-gray-800 font-medium">Tạm ẩn</button>
                    <button onClick={() => {
                      if (confirm('Xóa các sản phẩm đã chọn?')) {
                        setProducts((prev) => prev.filter((p) => !selected.has(p.id)));
                        setSelected(new Set());
                        setSuccessMessage('Đã xóa các sản phẩm đã chọn (demo)');
                      }
                    }} className="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                  </div>
                  <button onClick={clearSelection} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg card-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="table-header">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input type="checkbox" id="select-all" className="rounded" onChange={toggleSelectAll} checked={selected.size === visible.length && visible.length > 0} />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kho</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã bán</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visible.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input type="checkbox" className="product-checkbox rounded" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              <div className="product-image bg-gray-100 rounded flex items-center justify-center text-2xl">
                                {p.images && p.images.length ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded" /> : <span>{p.emoji}</span>}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{p.name}</div>
                                <div className="text-sm text-gray-500">{p.desc}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{p.sku}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{p.price}</div>
                            {p.originalPrice && <div className="text-sm text-gray-500 line-through">{p.originalPrice}</div>}
                          </td>
                          <td className={`px-6 py-4 text-sm text-gray-900 ${p.stock === 0 ? 'text-red-600' : ''}`}>{p.stock}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{p.sold}</td>
                          <td className="px-6 py-4">
                            {p.status === 'active' && <span className="status-active px-2 py-1 text-xs font-medium rounded-full">Đang bán</span>}
                            {p.status === 'inactive' && <span className="status-inactive px-2 py-1 text-xs font-medium rounded-full">Tạm ẩn</span>}
                            {p.status === 'out-of-stock' && <span className="status-out-of-stock px-2 py-1 text-xs font-medium rounded-full">Hết hàng</span>}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <button onClick={() => editProduct(p.id)} className="text-blue-600 hover:text-blue-800">Sửa</button>
                              <button onClick={() => duplicateProduct(p.id)} className="text-green-600 hover:text-green-800">Sao chép</button>
                              <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-800">Xóa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{products.length}</span> trong tổng số <span className="font-medium">{products.length}</span> sản phẩm
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Trước</button>
                      <button className="px-3 py-2 text-sm bg-shopee-orange text-white rounded-lg">1</button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                      <span className="px-2">...</span>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">32</button>
                      <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Sau</button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal */}
      <div className={`modal ${showModal ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
        <div className={`modal-content w-full ${modalSize === 'small' ? 'max-w-md' : 'max-w-3xl'}`}>
          <div className="p-6 border-b border-gray-200 flex items-start justify-between space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900" id="modal-title">{modalTitle}</h2>
              <p className="text-sm text-gray-500">Điền thông tin sản phẩm và nhấn "Lưu sản phẩm" để thêm vào danh sách.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <form id="product-form" onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                  <div className="image-upload-area p-3 rounded border border-dashed border-gray-300 cursor-pointer" onClick={onImageAreaClick}>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={onFilesChange} />
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm text-gray-500">Kéo thả hoặc click để tải ảnh lên (tối đa 9 ảnh)</p>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {images.map((u, i) => (
                        <div key={u} className="relative">
                          <img src={u} alt={`preview-${i}`} className="w-20 h-20 object-cover rounded" />
                          <button type="button" onClick={() => {
                            setImages((prev) => prev.filter((x) => x !== u));
                            URL.revokeObjectURL(u);
                          }} className="absolute top-0 right-0 bg-white p-1 rounded-full shadow">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} name="name" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Nhập tên sản phẩm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <input value={sku} onChange={(e) => setSku(e.target.value)} name="sku" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Mã sản phẩm" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} name="description" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Nhập mô tả chi tiết về sản phẩm" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán *</label>
                  <input value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} name="price" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giá gốc</label>
                  <input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))} name="originalPrice" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng *</label>
                  <input value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} name="stock" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cân nặng (gram)</label>
                  <input value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} name="weight" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước (cm)</label>
                  <input value={size} onChange={(e) => setSize(e.target.value)} name="size" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="D x R x C" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} name="status" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="active">Đang bán</option>
                    <option value="inactive">Tạm ẩn</option>
                    <option value="out-of-stock">Hết hàng</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="shopee-orange text-black px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* small success toast */}
      {successMessage && (
        <div className="fixed right-6 bottom-6 bg-green-600 text-white px-4 py-2 rounded shadow">{successMessage}</div>
      )}
    </div>
  );
};

export default ProductManager;
