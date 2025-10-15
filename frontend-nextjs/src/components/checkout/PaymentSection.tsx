/* src/components/PaymentSection.tsx */
import React from 'react';
import { CreditCard, Check } from 'lucide-react';
import { PaymentMethod } from '../types';

interface Props { methods: PaymentMethod[]; selected: PaymentMethod; onSelect: (m: PaymentMethod) => void; }

const PaymentSection: React.FC<Props> = ({ methods, selected, onSelect }) => {
  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2"><CreditCard className="w-5 h-5 text-green-500" /><h3 className="font-medium">Phương Thức Thanh Toán</h3></div>
      </div>

      <div className="ml-7 space-y-2">
        {methods.map(m => (
          <div key={m.id} onClick={() => onSelect(m)} className={`p-3 border rounded cursor-pointer ${selected.id === m.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-gray-600">{m.description}</p>
                </div>
              </div>
              {selected.id === m.id && <Check className="w-5 h-5 text-orange-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSection;
