// app/shoppingcart/page.tsx
import React from "react";

import SellerSaleAnalytics from "@/components/shop/sellerSaleAnalytics";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <SellerSaleAnalytics />;
}
