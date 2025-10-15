import React, { useState, useRef, JSX } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../css/ShopSetting.css';
import Sidebar from '@/components/shop/Sidebar';

export default function ShopSettingsPage(): JSX.Element {
  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: '🏪' },
    { id: 'appearance', label: 'Giao diện', icon: '🎨' },
    { id: 'business', label: 'Thông tin kinh doanh', icon: '📋' },
    { id: 'payment', label: 'Thanh toán', icon: '💳' },
    { id: 'shipping', label: 'Vận chuyển', icon: '🚚' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
    { id: 'security', label: 'Bảo mật', icon: '🔒' },
  ];
  const [activeTab, setActiveTab] = useState<string>('general');

  // General
  const [shopName, setShopName] = useState('TechStore Official');
  const [description, setDescription] = useState(
    'Chuyên cung cấp các sản phẩm công nghệ chính hãng với giá tốt nhất thị trường. Cam kết chất lượng và dịch vụ hậu mãi tốt nhất.'
  );
  const [phone, setPhone] = useState('0901234567');
  const [email, setEmail] = useState('contact@techstore.vn');
  const [address, setAddress] = useState('123 Nguyễn Huệ, Quận 1, TP.HCM');
  const [province, setProvince] = useState('TP. Hồ Chí Minh');
  const [district, setDistrict] = useState('Quận 1');
  const [ward, setWard] = useState('Phường Bến Nghé');
  const [companyAddress, setCompanyAddress] = useState('123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh');

  // Appearance
  const [primaryColor, setPrimaryColor] = useState('#ee4d2d');
  const [secondaryColor, setSecondaryColor] = useState('#f59e0b');

  // Business
  const [companyName, setCompanyName] = useState('Công ty TNHH TechStore Việt Nam');
  const [taxId, setTaxId] = useState('0123456789');
  const [bizLicense, setBizLicense] = useState('0123456789-001');
  const [bizIssueDate, setBizIssueDate] = useState('2020-01-15');

  // Payment
  const [bank, setBank] = useState('Vietcombank');
  const [branch, setBranch] = useState('Chi nhánh Sài Gòn');
  const [accountNumber, setAccountNumber] = useState('1234567890');
  const [accountName, setAccountName] = useState('NGUYEN VAN A');

  // Shipping
  const [shippingZones, setShippingZones] = useState([
    { id: 'hcm', region: 'TP. Hồ Chí Minh', fee: 25000, eta: '1-2 ngày' },
    { id: 'south', region: 'Miền Nam', fee: 35000, eta: '2-3 ngày' },
    { id: 'north_center', region: 'Miền Bắc & Miền Trung', fee: 45000, eta: '3-5 ngày' },
  ]);

  // Notifications
  const [notifyOrderEmail, setNotifyOrderEmail] = useState(true);
  const [notifyOrderSms, setNotifyOrderSms] = useState(true);
  const [notifyOrderPush, setNotifyOrderPush] = useState(true);
  const [stockThreshold, setStockThreshold] = useState(10);

  // Security
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);

  // Avatar UI (preview only, no upload backend logic)
  const [avatarUrl, setAvatarUrl] = useState<string>(''); // nếu rỗng sẽ hiển thị placeholder
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function saveAll() {
    // Here you would call APIs to save. For now we just log and alert.
    const payload = {
      shopName,
      description,
      phone,
      email,
      address,
      province,
      district,
      ward,
      primaryColor,
      secondaryColor,
      companyName,
      taxId,
      bizLicense,
      bizIssueDate,
      bank,
      branch,
      accountNumber,
      accountName,
      shippingZones,
      notifyOrderEmail,
      notifyOrderSms,
      notifyOrderPush,
      stockThreshold,
      twoFAEnabled,
      avatarUrl,
    };
    console.log('Save payload', payload);
    alert('Lưu cấu hình (demo). Kiểm tra console để xem payload.');
  }

  function addShippingZone() {
    const id = `zone_${Date.now()}`;
    setShippingZones((s) => [...s, { id, region: 'Khu vực mới', fee: 0, eta: '1-3 ngày' }]);
  }

  function updateShippingZone(id: string, key: string, value: any) {
    setShippingZones((s) => s.map((z) => (z.id === id ? { ...z, [key]: value } : z)));
  }

  function removeShippingZone(id: string) {
    setShippingZones((s) => s.filter((z) => z.id !== id));
  }

  return (
    <div className="min-h-screen shopee-bg">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeKey="settings" />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Cài đặt Shop</h1>
              <p className="text-gray-600">Quản lý thông tin shop, cài đặt bảo mật và tùy chỉnh trải nghiệm</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">👁️ <span>Xem trước shop</span></button>
              <button onClick={saveAll} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2">💾 <span>Lưu tất cả</span></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex flex-wrap gap-2 p-3">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 py-2 rounded ${activeTab === t.id ? 'bg-gray-100 font-semibold' : 'text-gray-600'}`}
                  >
                    <span className="mr-2">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'general' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">🏪 Thông tin cơ bản</h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên shop *</label>
                      <input value={shopName} onChange={(e) => setShopName(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                      <p className="text-xs text-gray-500 mt-1">Tên shop sẽ hiển thị trên trang shop và trong kết quả tìm kiếm</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mô tả shop</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" rows={4} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email liên hệ *</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Địa chỉ shop *</label>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
                        <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2">
                          <option>TP. Hồ Chí Minh</option>
                          <option>Hà Nội</option>
                          <option>Đà Nẵng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quận/Huyện *</label>
                        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2">
                          <option>Quận 1</option>
                          <option>Quận 2</option>
                          <option>Quận 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phường/Xã *</label>
                        <select value={ward} onChange={(e) => setWard(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2">
                          <option>Phường Bến Nghé</option>
                          <option>Phường Bến Thành</option>
                          <option>Phường Cô Giang</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* --- Avatar shop (UI + preview only) --- */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700">Avatar shop</label>
                      <div className="mt-2 flex items-start gap-6">
                        <div className="avatar-upload relative w-36 h-36">
                          {/* Nếu avatarUrl rỗng sẽ hiển thị placeholder emoji */}
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar shop" className="avatar-img" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-4xl">🏪</div>
                          )}

                          {/* Overlay: hiện khi hover lên avatar-upload */}
                          <div className="avatar-overlay">
                            <div className="flex flex-col items-center gap-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white text-sm px-3 py-1 rounded shadow"
                              >
                                Thay đổi
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAvatarUrl('');
                                }}
                                className="bg-red-500 text-white text-sm px-3 py-1 rounded shadow"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>

                          {/* hidden input để chọn file (preview local) */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // chỉ preview local (no upload)
                                setAvatarUrl(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="text-sm text-gray-600">Kích thước khuyến nghị: 300x300px</div>
                          <div className="text-sm text-gray-500 mt-2">Định dạng: JPG, PNG. Dung lượng tối đa 2MB.</div>
                          <div className="mt-4">
                            <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">Tải lên</button>
                            <button onClick={() => setAvatarUrl('')} className="bg-gray-200 px-3 py-1 rounded-md">Dùng mặc định</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* --- end avatar --- */}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">🎨 Banner shop & Màu sắc</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banner chính</label>
                    <div className="mt-2 border border-dashed rounded p-6 text-center text-gray-500">Tải lên banner shop (Kích thước khuyến nghị: 1200x300px)</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Màu chủ đạo</label>
                      <div className="flex items-center gap-3 mt-2">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded" />
                        <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="form-input flex-1 p-2 border rounded" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Màu phụ</label>
                      <div className="flex items-center gap-3 mt-2">
                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-12 rounded" />
                        <input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="form-input flex-1 p-2 border rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">📱 Tùy chỉnh hiển thị</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Hiển thị số lượng sản phẩm đã bán</div>
                        <div className="text-sm text-gray-600">Khách hàng có thể thấy số lượng sản phẩm đã bán</div>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Hiển thị đánh giá shop</div>
                        <div className="text-sm text-gray-600">Hiển thị điểm đánh giá và nhận xét của khách hàng</div>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">📋 Thông tin doanh nghiệp</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mã số thuế</label>
                    <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giấy phép kinh doanh</label>
                    <input value={bizLicense} onChange={(e) => setBizLicense(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày cấp</label>
                    <input type="date" value={bizIssueDate} onChange={(e) => setBizIssueDate(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Địa chỉ đăng ký kinh doanh</label>
                  <textarea
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2"
                  />
                </div>

              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">💳 Phương thức thanh toán</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked />
                    <div>
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-600">Khách hàng thanh toán khi nhận hàng</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked />
                    <div>
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-600">Khách hàng chuyển khoản trước khi giao hàng</div>
                    </div>
                  </label>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">🏦 Thông tin tài khoản ngân hàng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên ngân hàng</label>
                      <select value={bank} onChange={(e) => setBank(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2">
                        <option>Vietcombank</option>
                        <option>Techcombank</option>
                        <option>BIDV</option>
                        <option>VietinBank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Chi nhánh</label>
                      <input value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Số tài khoản</label>
                      <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên chủ tài khoản</label>
                      <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">🚚 Cài đặt vận chuyển</h3>
                <div className="space-y-4">
                  {shippingZones.map((z) => (
                    <div key={z.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Khu vực</label>
                        <input value={z.region} onChange={(e) => updateShippingZone(z.id, 'region', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phí vận chuyển (₫)</label>
                        <input type="number" value={z.fee} onChange={(e) => updateShippingZone(z.id, 'fee', Number(e.target.value))} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Thời gian giao hàng</label>
                        <input value={z.eta} onChange={(e) => updateShippingZone(z.id, 'eta', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm p-2" />
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => removeShippingZone(z.id)} className="bg-red-600 text-white px-3 py-2 rounded">Xóa</button>
                      </div>
                    </div>
                  ))}

                  <div>
                    <button onClick={addShippingZone} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Thêm khu vực giao hàng</button>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">📦 Cài đặt đóng gói</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thời gian chuẩn bị hàng (ngày)</label>
                      <input type="number" defaultValue={1} className="mt-1 block w-32 rounded border-gray-200 shadow-sm p-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Tự động in nhãn vận chuyển</div>
                        <div className="text-sm text-gray-600">Tự động in nhãn khi đơn hàng được xác nhận</div>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">🔔 Thông báo</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Đơn hàng mới</div>
                      <div className="text-sm text-gray-600">Thông báo khi có đơn hàng mới</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={notifyOrderEmail} onChange={(e) => setNotifyOrderEmail(e.target.checked)} /> Email</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={notifyOrderSms} onChange={(e) => setNotifyOrderSms(e.target.checked)} /> SMS</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={notifyOrderPush} onChange={(e) => setNotifyOrderPush(e.target.checked)} /> Push</label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Ngưỡng cảnh báo tồn kho</label>
                    <input type="number" value={stockThreshold} onChange={(e) => setStockThreshold(Number(e.target.value))} className="mt-1 block w-32 rounded border-gray-200 shadow-sm p-2" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">🔒 Bảo mật tài khoản</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">Xác thực 2 bước (2FA)</div>
                      <div className="text-sm text-gray-600">Bảo vệ tài khoản bằng mã xác thực từ điện thoại</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${twoFAEnabled ? 'text-green-600' : 'text-red-600'}`}>{twoFAEnabled ? '✅ Đã bật' : '❌ Chưa bật'}</span>
                      <button onClick={() => setTwoFAEnabled((s) => !s)} className="text-blue-600">Quản lý</button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">🔑 Đổi mật khẩu</h4>
                    <div className="max-w-md space-y-3">
                      <input type="password" placeholder="Mật khẩu hiện tại" className="block w-full rounded border-gray-200 shadow-sm p-2" />
                      <input type="password" placeholder="Mật khẩu mới" className="block w-full rounded border-gray-200 shadow-sm p-2" />
                      <input type="password" placeholder="Xác nhận mật khẩu mới" className="block w-full rounded border-gray-200 shadow-sm p-2" />
                      <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">Đổi mật khẩu</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-8">
            <button onClick={() => {}} className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700">Khôi phục mặc định</button>
            <button onClick={saveAll} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600">Lưu tất cả thay đổi</button>
          </div>
        </main>
      </div>

      <Footer />

      {/* --- Inline CSS additions (you can move these to your CSS file) --- */}
      <style>{`
        /* avatar specific */
        .avatar-upload { position: relative; overflow: hidden; border-radius: 9999px; border: 4px solid #f3f4f6; }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 9999px; }
        .avatar-overlay { position: absolute; inset: 0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.45); opacity: 0; transition: opacity .18s ease; }
        .avatar-upload:hover .avatar-overlay { opacity: 1; }
        .avatar-overlay button { min-width: 88px; }
      `}</style>
    </div>
  );
}

