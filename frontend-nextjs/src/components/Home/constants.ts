// src/components/constants.ts
export const BASE_URL =
  process.env.NEXT_PUBLIC_PRODUCT_BASE_URL ??
  'http://localhost:8080/product-service/api/menu-items';

export type SlideImage = { id: number; image: string; alt: string; title: string };

export const SLIDE_IMAGES: SlideImage[] = [
  {
    id: 1,
    image:
      'https://salework.net/wp-content/uploads/2022/09/kich-thuoc-anh-shopee-2.jpg',
    alt: 'Flash Sale 12.12',
    title: 'FLASH SALE 12.12 - GIẢM ĐẾN 50%',
  },
  {
    id: 2,
    image:
      'https://ben.com.vn/tin-tuc/wp-content/uploads/2021/09/cach-san-sale-0d-tren-shopee-5-750x503.png',
    alt: 'Freeship 0đ',
    title: 'FREESHIP 0Đ - ĐƠN TỪ 0Đ',
  },
  {
    id: 3,
    image:
      'https://media-cdn-v2.laodong.vn/storage/newsportal/2021/12/13/984362/Shopee-2.jpg',
    alt: 'Siêu thị 9.9',
    title: 'SIÊU THỊ 9.9 - HÀNG HIỆU GIÁ TỐT',
  },
];

export type Category = { name: string; icon: string; color: string };

export const ALL_CATEGORIES: Category[] = [
  { name: 'Tất cả', icon: '📦', color: 'bg-gray-200' },
  { name: 'Thời Trang Nam', icon: '👔', color: 'bg-blue-100' },
  { name: 'Thời Trang Nữ', icon: '👗', color: 'bg-pink-100' },
  { name: 'Điện Thoại & Phụ Kiện', icon: '📱', color: 'bg-green-100' },
  { name: 'Máy Tính & Laptop', icon: '💻', color: 'bg-purple-100' },
  { name: 'Máy Ảnh & Máy Quay Phim', icon: '📷', color: 'bg-yellow-100' },
  { name: 'Đồng Hồ', icon: '⌚', color: 'bg-red-100' },
  { name: 'Giày Dép Nam', icon: '👞', color: 'bg-indigo-100' },
  { name: 'Giày Dép Nữ', icon: '👠', color: 'bg-pink-100' },
  { name: 'Túi Ví Nam', icon: '🎒', color: 'bg-gray-100' },
  { name: 'Túi Ví Nữ', icon: '👜', color: 'bg-rose-100' },
  { name: 'Thiết Bị Điện Tử', icon: '🔌', color: 'bg-cyan-100' },
  { name: 'Phụ Kiện & Trang Sức', icon: '💍', color: 'bg-amber-100' },
  { name: 'Thể Thao & Du Lịch', icon: '🏃‍♂️', color: 'bg-orange-100' },
  { name: 'Ô Tô & Xe Máy & Xe Đạp', icon: '🚗', color: 'bg-teal-100' },
  { name: 'Balo & Túi Ví', icon: '🎒', color: 'bg-lime-100' },
  { name: 'Mẹ & Bé', icon: '🍼', color: 'bg-emerald-100' },
  { name: 'Nhà Cửa & Đời Sống', icon: '🏠', color: 'bg-sky-100' },
  { name: 'Sắc Đẹp', icon: '💄', color: 'bg-fuchsia-100' },
  { name: 'Sức Khỏe', icon: '💊', color: 'bg-green-100' },
  { name: 'Giặt Giũ & Chăm Sóc Nhà Cửa', icon: '🧽', color: 'bg-blue-100' },
];
