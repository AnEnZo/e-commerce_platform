// src/components/LoadingErrorViews.tsx
import React, { JSX } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Lang = "vi" | "en";

type CommonProps = {
  lang?: Lang;
  setLang?: (l: Lang) => void;
  openLogin?: () => void;
};

type LoadingProps = CommonProps;

export function Loading({ lang = "vi", setLang, openLogin }: LoadingProps): JSX.Element {
  return (
    <div className="shopee-bg min-h-screen">
      <Header lang={lang} setLang={setLang} openLogin={openLogin} />
      <div className="p-6">Đang tải giỏ hàng...</div>
      <Footer />
    </div>
  );
}

type ErrorViewProps = CommonProps & {
  error?: string | null;
};

export function ErrorView({ error = "Không rõ", lang = "vi", setLang, openLogin }: ErrorViewProps): JSX.Element {
  return (
    <div className="shopee-bg min-h-screen">
      <Header lang={lang} setLang={setLang} openLogin={openLogin} />
      <div className="p-6 text-red-600">Lỗi: {error}</div>
      <Footer />
    </div>
  );
}
