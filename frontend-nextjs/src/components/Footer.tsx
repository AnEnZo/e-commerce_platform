
'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';


export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-orange-50 to-pink-50 mt-12 border-t border-orange-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* CHĂM SÓC KHÁCH HÀNG */}
          <div>
            <h4 className="font-semibold mb-4 text-orange-700">CHĂM SÓC KHÁCH HÀNG</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Trung Tâm Trợ Giúp</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Shop247 Blog</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Hướng Dẫn Mua Hàng</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Chính Sách Bảo Hành</a></li>
            </ul>
          </div>

          {/* VỀ SHOP247 */}
          <div>
            <h4 className="font-semibold mb-4 text-orange-700">VỀ SHOP247</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Giới Thiệu Về Shop247</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Tuyển Dụng</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Điều Khoản Shop247</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Chính Sách Bảo Mật</a></li>
            </ul>
          </div>

          {/* THANH TOÁN & VẬN CHUYỂN */}
          <div>
            <h4 className="font-semibold mb-4 text-orange-700">THANH TOÁN</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white border p-2 rounded shadow-sm text-center text-xs font-medium hover:bg-orange-100 transition-colors">💳 Visa</div>
              <div className="bg-white border p-2 rounded shadow-sm text-center text-xs font-medium hover:bg-orange-100 transition-colors">💳 Master</div>
              <div className="bg-white border p-2 rounded shadow-sm text-center text-xs font-medium hover:bg-orange-100 transition-colors">🏦 ATM</div>
            </div>
            <h4 className="font-semibold mb-2 text-orange-700">ĐƠN VỊ VẬN CHUYỂN</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border p-2 rounded shadow-sm text-center text-xs font-medium hover:bg-orange-100 transition-colors">🚚 SPX</div>
              <div className="bg-white border p-2 rounded shadow-sm text-center text-xs font-medium hover:bg-orange-100 transition-colors">📦 GHN</div>
              <div className="bg-white border p-2 rounded shadow-sm text-center text-xs font-medium hover:bg-orange-100 transition-colors">🎁 GHTK</div>
            </div>
          </div>

          {/* THEO DÕI */}
          <div>
            <h4 className="font-semibold mb-4 text-orange-700">THEO DÕI CHÚNG TÔI</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="#" className="hover:text-orange-500 flex items-center transition-colors"><span className="mr-2">📘</span>Facebook</a></li>
              <li><a href="#" className="hover:text-orange-500 flex items-center transition-colors"><span className="mr-2">📷</span>Instagram</a></li>
              <li><a href="#" className="hover:text-orange-500 flex items-center transition-colors"><span className="mr-2">🐦</span>Twitter</a></li>
              <li><a href="#" className="hover:text-orange-500 flex items-center transition-colors"><span className="mr-2">📺</span>YouTube</a></li>
            </ul>
          </div>

          {/* TẢI ỨNG DỤNG */}
          <div>
            <h4 className="font-semibold mb-4 text-orange-700">TẢI ỨNG DỤNG NGAY</h4>
            <div className="space-y-3">
              <div className="inline-block rounded-lg border-2 border-dashed border-orange-300 shadow-sm">
                <QRCodeCanvas value="Đinh Tuấn An" size={90} />
              </div>

              <div className="space-y-2">
                <button className="w-full bg-black text-white p-2 rounded text-xs font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"><span className="mr-2">📱</span>App Store</button>
                <button className="w-full bg-green-600 text-white p-2 rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center"><span className="mr-2">🤖</span>Google Play</button>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t mt-8 pt-8 text-center text-xs text-gray-500">
          <p>© 2024 Shop247. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
