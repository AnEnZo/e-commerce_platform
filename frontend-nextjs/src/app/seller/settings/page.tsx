// app/shoppingcart/page.tsx
import React from "react";

import ShopSetting from "@/components/shop/shopSetting";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <ShopSetting />;
}
