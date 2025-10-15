// src/components/EmptyCart.tsx
import React, { JSX } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Lang = "vi" | "en";

type Props = {
  openLogin?: () => void;
  lang?: Lang;
  setLang?: (l: Lang) => void;
};

export default function EmptyCart({ openLogin, lang = "vi", setLang }: Props): JSX.Element {
  return (
    <div className="shopee-bg min-h-screen">
      <Header lang={lang} setLang={setLang} openLogin={openLogin} />
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-sm shadow-sm p-12">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-xl font-medium text-gray-800 mb-3">Giỏ hàng của bạn còn trống</h2>
          <p className="text-gray-600 mb-8">Hãy chọn thêm sản phẩm để mua sắm nhé</p>

          {/* Dùng Link của Next để điều hướng an toàn */}
          <Link href="/" className="inline-block shopee-orange text-white px-8 py-3 rounded-sm font-medium hover:bg-red-600 transition-colors">
            Mua sắm ngay
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
