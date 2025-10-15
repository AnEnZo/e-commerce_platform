// app/shoppingcart/page.tsx
import React from "react";

import Marketing from "@/components/shop/marketing";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <Marketing />;
}
