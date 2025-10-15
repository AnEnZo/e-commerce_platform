// app/shoppingcart/page.tsx
import React from "react";

import SellerShipping from "@/components/shop/sellerShipping";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <SellerShipping />;
}
