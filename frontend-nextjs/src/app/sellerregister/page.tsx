// app/shoppingcart/page.tsx
import React from "react";
import SellerRegister from "@/components/shop/sellerRegister";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <SellerRegister />;
}
