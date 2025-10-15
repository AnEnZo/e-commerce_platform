// src/components/shoppingcart/ShoppingCartClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useShoppingCart } from "@/hooks/shoppingcart/useShoppingCart";
import ShopGroup from "@/components/shoppingcart/ShopGroup";
import StickyCheckout from "@/components/shoppingcart/StickyCheckout";
import EmptyCart from "@/components/shoppingcart/EmptyCart";
import { Loading, ErrorView } from "@/components/shoppingcart/LoadingError";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function ShoppingCartClient({ userId: userIdProp, apiBaseUrl }: { userId?: string; apiBaseUrl?: string } = {}) {
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [loginOpen, setLoginOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState<boolean>(false);
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(userIdProp);
  const router = useRouter();
  function openLogin() {
    setLoginOpen(true);
    alert("Open login modal (implement modal separately)");
  }

  // Resolve user from URL param or backend session (HttpOnly cookie)
  useEffect(() => {
    let mounted = true;
    // 1) URL query param ?userId=
    try {
      const url = new URL(window.location.href);
      const qUid = url.searchParams.get('userId');
      if (qUid) {
        setResolvedUserId(qUid);
        setAuthChecking(false);
        return;
      }
    } catch {}
    // 2) Prop
    if (userIdProp) { setResolvedUserId(userIdProp); return; }
    // 3) Backend validation
    setAuthChecking(true);
    authService
      .validateToken()
      .then((res) => {
        if (!mounted) return;
        if (res.valid && res.userID) {
          setResolvedUserId(res.userID);
        } else {
          setResolvedUserId(undefined);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setResolvedUserId(undefined);
      })
      .finally(() => {
        if (!mounted) return;
        setAuthChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, [userIdProp]);

  const {
    items,
    loading,
    error,
    selected,
    selectAll,
    totals,
    shopGroups,
    increase,
    decrease,
    removeCompletely,
    manualQuantityChange,
    deleteSelectedCompletely,
    toggleItemSelection,
    toggleShopSelection,
    toggleSelectAll,
    getItemPrice,
  } = useShoppingCart({ userId: resolvedUserId ?? undefined, apiBaseUrl });

  function handleCheckout() {
    if (selected.size === 0) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }
    const payload = (items || [])
      .filter((it) => selected.has(it.variantId))
      .map((it) => ({
        id: it.variantId,
        name: it.productName || 'Sản phẩm',
        image: it.productImageUrl || '',
        quantity: it.quantity || 1,
        price: getItemPrice(it),
        shopName: it.shopName || 'Shop',
        shopId: it.shopId || undefined,
      }));
    try {
      sessionStorage.setItem('checkoutItems', JSON.stringify({ items: payload, ts: Date.now() }));
    } catch {}
    router.push('/checkout');
  }

  if (authChecking) return <Loading lang={lang} setLang={setLang} openLogin={openLogin} />;
  if (!resolvedUserId) return <EmptyCart openLogin={openLogin} lang={lang} setLang={setLang} />;
  if (loading) return <Loading lang={lang} setLang={setLang} openLogin={openLogin} />;
  if (error) return <ErrorView error={error} lang={lang} setLang={setLang} openLogin={openLogin} />;
  if (!items || items.length === 0) return <EmptyCart openLogin={openLogin} lang={lang} setLang={setLang} />;

  return (
    <div className="shopee-bg min-h-screen">
      <Header lang={lang} setLang={setLang} />

      <div className="container mx-auto px-4 py-6">
        {/* header controls */}
        <div className="bg-white rounded-sm shadow-sm mb-3">
          <div className="px-5 py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-4 flex-1">
                <input type="checkbox" id="select-all-top" checked={selectAll} onChange={toggleSelectAll} className="checkbox-custom" />
                <label htmlFor="select-all-top" className="text-sm">Sản Phẩm</label>
              </div>
              <div className="hidden md:flex items-center text-sm text-gray-500">
                <span className="w-32 text-center ml-20">Đơn Giá</span>
                <span className="w-32 text-center ml-8">Số Lượng</span>
                <span className="w-32 text-center ml-8">Thành Tiền</span>
                <span className="w-20 text-center ml-8">Thao Tác</span>
              </div>
            </div>
          </div>
        </div>

        {/* shop groups */}
        {Array.from(shopGroups.entries()).map(([shopName, shopItems]) => (
          <ShopGroup
            key={shopName}
            shopName={shopName}
            items={shopItems}
            selectedSet={selected}
            onToggleItem={toggleItemSelection}
            onToggleShop={toggleShopSelection}
            onIncrease={increase}
            onDecrease={decrease}
            onRemove={removeCompletely}
            onManualChange={manualQuantityChange}
            getItemPrice={getItemPrice}
          />
        ))}

        <div className="mb-20" />
      </div>

      <StickyCheckout
        itemsCount={items.length}
        totals={totals}
        selectAll={selectAll}
        onToggleSelectAll={toggleSelectAll}
        onDeleteSelected={deleteSelectedCompletely}
        onCheckout={handleCheckout}
      />

      <Footer />
    </div>
  );
}
