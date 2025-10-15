// app/shoppingcart/page.tsx
import React from "react";
import ProductManager from "@/components/shop/productManager";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <ProductManager />;
}
