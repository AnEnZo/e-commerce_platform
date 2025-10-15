
/* src/components/AddressSection.tsx */
import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';
import addressService from '@/lib/checkout/addressService';
import { Address } from '@/types/checkout';

interface Props {
  userId: string | null;
  onSelectAddress: (address: Address) => void;
}

const AddressSection: React.FC<Props> = ({ userId, onSelectAddress }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    userId: userId || '',
    receiverName: '',
    phoneNumber: '',
    detailAddress: '',
    ward: '',
    district: '',
    province: '',
    isDefault: false,
  });

  useEffect(() => {
    if (userId) loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await addressService.getUserAddresses(userId);
      setAddresses(list);
      const def = list.find(a => a.isDefault) || list[0] || null;
      setSelectedAddress(def);
      if (def) onSelectAddress(def);
    } catch (err) {
      setError('Không thể tải danh sách địa chỉ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!userId) return alert('Vui lòng đăng nhập');
    if (!newAddress.receiverName || !newAddress.phoneNumber || !newAddress.detailAddress) return alert('Vui lòng điền đầy đủ thông tin');
    try {
      const created = await addressService.createAddress({ ...newAddress, userId });
      setAddresses(prev => [...prev, created]);
      setSelectedAddress(created);
      onSelectAddress(created);
      setShowForm(false);
      setShowModal(false);
      setNewAddress({ userId, receiverName: '', phoneNumber: '', detailAddress: '', ward: '', district: '', province: '', isDefault: false });
      alert('Thêm địa chỉ thành công');
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi thêm địa chỉ');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!userId) return;
    try {
      const updated = await addressService.setDefaultAddress(userId, addressId);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addressId })));
      setSelectedAddress(updated);
      onSelectAddress(updated);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi cập nhật địa chỉ mặc định');
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <h3 className="font-medium">Địa Chỉ Nhận Hàng</h3>
        </div>
        <button onClick={() => setShowModal(true)} className="text-blue-600 text-sm hover:underline">Thay Đổi</button>
      </div>

      {selectedAddress ? (
        <div className="ml-7">
          <p className="font-medium">{selectedAddress.receiverName} | {selectedAddress.phoneNumber}</p>
          <p className="text-gray-600 text-sm">{selectedAddress.detailAddress}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}</p>
          {selectedAddress.isDefault && <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded mt-1">Mặc định</span>}
        </div>
      ) : loading ? (
        <div className="ml-7 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-64"></div>
        </div>
      ) : error ? (
        <div className="ml-7">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={loadAddresses} className="text-blue-600 text-sm hover:underline mt-1">Thử lại</button>
        </div>
      ) : (
        <div className="ml-7">
          <p className="text-gray-500 text-sm">Chưa có địa chỉ nào</p>
          <button onClick={() => { setShowModal(true); setShowForm(true); }} className="text-blue-600 text-sm hover:underline">Thêm địa chỉ mới</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">{showForm ? 'Thêm Địa Chỉ Mới' : 'Chọn Địa Chỉ Giao Hàng'}</h3>
              <button onClick={() => { setShowModal(false); setShowForm(false); }} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {showForm ? (
              <div className="p-4 space-y-4">
                <label className="block text-sm font-medium text-gray-700">Họ và tên *</label>
                <input type="text" value={newAddress.receiverName} onChange={e => setNewAddress(prev => ({ ...prev, receiverName: e.target.value }))} className="w-full p-2 border rounded" />

                <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
                <input type="tel" value={newAddress.phoneNumber} onChange={e => setNewAddress(prev => ({ ...prev, phoneNumber: e.target.value }))} className="w-full p-2 border rounded" />

                <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
                <input type="text" value={newAddress.province} onChange={e => setNewAddress(prev => ({ ...prev, province: e.target.value }))} className="w-full p-2 border rounded" />

                <label className="block text-sm font-medium text-gray-700">Quận/Huyện *</label>
                <input type="text" value={newAddress.district} onChange={e => setNewAddress(prev => ({ ...prev, district: e.target.value }))} className="w-full p-2 border rounded" />

                <label className="block text-sm font-medium text-gray-700">Phường/Xã *</label>
                <input type="text" value={newAddress.ward} onChange={e => setNewAddress(prev => ({ ...prev, ward: e.target.value }))} className="w-full p-2 border rounded" />

                <label className="block text-sm font-medium text-gray-700">Địa chỉ cụ thể *</label>
                <input type="text" value={newAddress.detailAddress} onChange={e => setNewAddress(prev => ({ ...prev, detailAddress: e.target.value }))} className="w-full p-2 border rounded" />

                <div className="flex items-center">
                  <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))} className="mr-2" />
                  <label className="text-sm text-gray-600">Đặt làm địa chỉ mặc định</label>
                </div>

                <div className="flex space-x-3">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded">Quay lại</button>
                  <button onClick={handleCreate} className="flex-1 py-2 bg-orange-500 text-white rounded">Lưu địa chỉ</button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse p-3 border rounded"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div></div>
                    ))}
                  </div>
                ) : addresses.length > 0 ? (
                  <>
                    {addresses.map(addr => (
                      <div key={addr.id} className={`p-3 border rounded ${selectedAddress?.id === addr.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 cursor-pointer" onClick={() => { setSelectedAddress(addr); onSelectAddress(addr); setShowModal(false); }}>
                            <p className="font-medium">{addr.receiverName} | {addr.phoneNumber}</p>
                            <p className="text-sm text-gray-600">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                            {addr.isDefault && <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded mt-1">Mặc định</span>}
                          </div>

                          <div className="flex items-center space-x-2 ml-2">
                            {selectedAddress?.id === addr.id && <Check className="w-5 h-5 text-orange-500" />}
                            {!addr.isDefault && <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-blue-600">Đặt mặc định</button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8"><p className="text-gray-500">Chưa có địa chỉ nào</p></div>
                )}

                <button onClick={() => setShowForm(true)} className="w-full p-3 border-2 border-dashed rounded text-center">
                  <Plus className="w-5 h-5 mx-auto mb-1" /> Thêm địa chỉ mới
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;

