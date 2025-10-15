// app/shoppingcart/page.tsx
import React from "react";
import SupportCenter from "@/components/Home/SupportCenter";

export default function Page() {
  // wrapper server component — chỉ mount client component
  return <SupportCenter />;
}
