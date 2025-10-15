// app/shoppingcart/page.tsx
import React from "react";
import OrdersManager from "@/components/shop/ordersManager";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <OrdersManager />;
}
