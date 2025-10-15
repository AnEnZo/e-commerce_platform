// app/shoppingcart/page.tsx
import React from "react";

import SellerDashboard from "@/components/shop/sellerDashboard";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <SellerDashboard />;
}
