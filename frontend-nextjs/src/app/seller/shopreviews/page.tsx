// app/shoppingcart/page.tsx
import React from "react";


import SellerShopReviews from "@/components/shop/sellerShopReviews";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <SellerShopReviews />;
}
