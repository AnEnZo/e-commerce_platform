/* src/components/VoucherSection.tsx */
import React from 'react';
import { Ticket, Check, XCircle } from 'lucide-react';
import { Voucher } from '../types';

interface Props {
  vouchers: Voucher[];
  selected: Voucher[];
  onToggle: (v: Voucher) => void;
  subtotal: number;
  failureReasons: Record<string, string>; // Added to display failure reasons
}

const VoucherSection: React.FC<Props> = ({ vouchers, selected, onToggle, subtotal, failureReasons }) => {
  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Ticket className="w-5 h-5 text-orange-500" />
          <h3 className="font-medium">Voucher</h3>
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="space-y-2">
          {selected.map(v => (
            <div key={v.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
              <div>
                <p className="font-medium text-sm">{v.title}</p>
                <p className="text-xs text-gray-600">{v.description}</p>
                {failureReasons[v.id] && (
                  <p className="text-xs text-red-500 flex items-center mt-1">
                    <XCircle className="w-4 h-4 mr-1" />
                    {failureReasons[v.id]}
                  </p>
                )}
              </div>
              <span className="text-orange-600 text-sm font-medium">
                -{v.type === 'PERCENTAGE' ? `${v.discount}%` : `${v.discount.toLocaleString()}₫`}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm ml-7">Chưa chọn voucher nào</p>
      )}
    </div>
  );
};

export default VoucherSection;
