/* src/components/ProductList.tsx */
import React from 'react';
import { CartItem } from '../types';

interface Props { items: CartItem[]; }
const ProductList: React.FC<Props> = ({ items }) => {
  const groupedByShop = items.reduce((acc, item) => {
    if (!acc[item.shopName]) {
      acc[item.shopName] = [];
    }
    acc[item.shopName].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b"><h3 className="font-medium">Sản Phẩm Đã Chọn</h3></div>
      <div className="divide-y">
        {Object.entries(groupedByShop).map(([shopName, shopItems]) => (
          <div key={shopName} className="p-4">
            <h4 className="font-medium text-sm mb-2">Cửa hàng: {shopName}</h4>
            {shopItems.map(item => (
              <div key={item.id} className="flex items-center space-x-3 mb-2">
                <img
                  src={item.image || "/Box.jpg"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded border"
                />

                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-orange-500 font-medium">
                      ₫{item.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-medium mt-2">
              <span>Tổng cộng:</span>
              <span className="text-orange-600">
                ₫{shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
