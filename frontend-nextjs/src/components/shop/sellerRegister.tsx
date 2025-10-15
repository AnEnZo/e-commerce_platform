'use client';

import React, { JSX, useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { getCookie, getUserIdFromToken } from '@/utils/jwt';

type SellerType = 'INDIVIDUAL' | 'BUSINESS';

type ShopForm = {
  name: string;
  ownerId: string;
  address: string;
  imageFile?: FileList | null;

  sellerType: SellerType;

  // individual
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  warehouseAddress?: string;
  idFrontFile?: FileList | null;
  idBackFile?: FileList | null;

  // business
  businessName?: string;
  taxId?: string;
  businessLicenseFile?: FileList | null;
  legalRepresentative?: string;
  companyAddress?: string;

  // bank
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankName?: string;
};

export default function ShopRegistration(): JSX.Element {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShopForm>({
    defaultValues: {
      sellerType: 'INDIVIDUAL',
      ownerId: '',
    },
  });

  const sellerType = watch('sellerType');
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lấy token từ cookie (client-side). getCookie đọc document.cookie.
  const getTokenFromCookie = (): string | null => {
    try {
      return getCookie('access_token');
    } catch {
      return null;
    }
  };

  // Build auth header đọc từ cookie mỗi lần gọi (không cache)
  const buildAuthHeaders = (extra?: Record<string, string>): Record<string, string> => {
    const token = getTokenFromCookie();
    const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    return { ...(extra ?? {}), ...authHeader };
  };

  // Safe JSON parse helper (local)
  const safeJsonParse = (s: string): unknown | null => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  // Upload file with signing endpoint (Cloudinary)
  async function uploadFile(
    fileList: FileList | null | undefined,
    ownerId?: string,
    folderOverride?: string,
    fieldLabel?: string
  ): Promise<string | null> {
    const label = fieldLabel ?? 'Tệp';
    if (!fileList || fileList.length === 0) return null;
    const file = fileList[0];

    const folder = folderOverride ?? (ownerId ? `shops/${ownerId}` : undefined);
    const signUrl =
      'http://localhost:8080/product-service/api/media/sign' +
      (folder ? `?folder=${encodeURIComponent(folder)}` : '');

    // Lấy chữ ký, truyền token từ cookie
    const signRes = await fetch(signUrl, {
      method: 'GET',
      headers: buildAuthHeaders(),
    });

    if (!signRes.ok) {
      const txt = await signRes.text().catch(() => '(no body)');
      throw new Error(`${label} - Lấy chữ ký thất bại: ${signRes.status} ${txt}`);
    }

    const signJsonRaw = await signRes.json().catch(() => null);
    if (!signJsonRaw || typeof signJsonRaw !== 'object') {
      throw new Error(`${label} - Sign response không hợp lệ hoặc không phải JSON.`);
    }
    const signJson = signJsonRaw as Record<string, unknown>;

    const api_key = signJson.api_key ? String(signJson.api_key) : '';
    const cloud_name = signJson.cloud_name ? String(signJson.cloud_name) : '';
    const timestamp = signJson.timestamp ? String(signJson.timestamp) : '';
    const signature = signJson.signature ? String(signJson.signature) : '';

    if (!api_key || !cloud_name || !timestamp || !signature) {
      throw new Error(`${label} - Sign response thiếu trường cần thiết.`);
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', api_key);
    fd.append('timestamp', timestamp);
    fd.append('signature', signature);
    if (folder) fd.append('folder', folder);

    const uploadRes = await fetch(cloudinaryUrl, { method: 'POST', body: fd });
    if (!uploadRes.ok) {
      const txt = await uploadRes.text().catch(() => '(no body)');
      throw new Error(`${label} - Upload lên Cloudinary thất bại: ${uploadRes.status} ${txt}`);
    }

    const uploadJsonRaw = await uploadRes.json().catch(() => null);
    if (!uploadJsonRaw || typeof uploadJsonRaw !== 'object') {
      throw new Error(`${label} - Cloudinary trả về dữ liệu không hợp lệ.`);
    }

    const uploadJson = uploadJsonRaw as Record<string, unknown>;
    const url = uploadJson.secure_url ?? uploadJson.url ?? null;
    if (!url || typeof url !== 'string') {
      throw new Error(`${label} - Cloudinary trả về URL không hợp lệ.`);
    }
    return url;
  }

  // Trên mount: lấy ownerId từ cookie (JWT) bằng helper của bạn
  useEffect(() => {
    try {
      const token = getTokenFromCookie();
      if (!token) return;
      const userId = getUserIdFromToken(token);
      if (userId) {
        setValue('ownerId', userId);
      } else {
        // không có claim userId trong token — xử lý tuỳ bạn (ở đây chỉ warn)
        // eslint-disable-next-line no-console
        console.warn('Không tìm thấy userId trong token cookie');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Lỗi khi đọc token từ cookie', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit: SubmitHandler<ShopForm> = async (values) => {
    setServerError(null);
    setSuccessMessage(null);

    if (!values.ownerId) {
      setServerError('Owner ID không có. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      const folder = `shops/${values.ownerId}`;

      const [imageUrl, idFrontUrl, idBackUrl, businessLicenseUrl] = await Promise.all([
        uploadFile(values.imageFile, values.ownerId, folder, 'Ảnh đại diện'),
        uploadFile(values.idFrontFile, values.ownerId, folder, 'CMND/CCCD - Mặt trước'),
        uploadFile(values.idBackFile, values.ownerId, folder, 'CMND/CCCD - Mặt sau'),
        uploadFile(values.businessLicenseFile, values.ownerId, folder, 'Giấy phép kinh doanh'),
      ]);

      const payload: Record<string, unknown> = {
        name: values.name,
        ownerId: values.ownerId,
        address: values.address,
        sellerType: values.sellerType,
      };

      if (values.fullName) payload.fullName = values.fullName;
      if (values.dateOfBirth) payload.dateOfBirth = values.dateOfBirth;
      if (values.phone) payload.phone = values.phone;
      if (values.email) payload.email = values.email;
      if (values.warehouseAddress) payload.warehouseAddress = values.warehouseAddress;
      if (idFrontUrl) payload.idFrontImageUrl = idFrontUrl;
      if (idBackUrl) payload.idBackImageUrl = idBackUrl;

      if (values.businessName) payload.businessName = values.businessName;
      if (values.taxId) payload.taxId = values.taxId;
      if (businessLicenseUrl) payload.businessLicenseUrl = businessLicenseUrl;
      if (values.legalRepresentative) payload.legalRepresentative = values.legalRepresentative;
      if (values.companyAddress) payload.companyAddress = values.companyAddress;

      if (values.bankAccountHolder) payload.bankAccountHolder = values.bankAccountHolder;
      if (values.bankAccountNumber) payload.bankAccountNumber = values.bankAccountNumber;
      if (values.bankName) payload.bankName = values.bankName;

      if (imageUrl) payload.imageUrl = imageUrl;

      const res = await fetch('http://localhost:8080/product-service/api/shops', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '(no body)');
        if (res.status === 401 || res.status === 403) {
          setServerError(`Không được phép (status ${res.status}). Vui lòng đăng nhập lại.`);
          return;
        }
        setServerError(`Tạo cửa hàng thất bại: ${res.status} ${txt}`);
        return;
      }

      const createdRaw = await res.json().catch(() => null);
      const created = createdRaw && typeof createdRaw === 'object' ? (createdRaw as Record<string, unknown>) : null;
      const createdId = created && 'id' in created ? String(created.id) : null;
      setSuccessMessage(createdId ? `Tạo shop thành công. ID: ${createdId}` : 'Tạo shop thành công.');
      // tuỳ bạn có muốn chuyển hướng: router.push('/seller/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('onSubmit error', err);
      setServerError(message || 'Có lỗi xảy ra khi tải tệp. Vui lòng thử lại.');
    }
  };

  const inputClasses =
    'w-full bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/80';
  const labelClasses = 'block text-sm font-semibold mb-2 text-gray-700';
  const sectionClasses =
    'bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-lg space-y-5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">✨ Đăng ký cửa hàng</h1>
          <p className="text-white/90 text-lg">Tạo cửa hàng của bạn với giao diện hiện đại và thân thiện</p>
        </div>

        <div className="bg-gradient-to-br from-white/30 to-white/20 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8">
              <input type="hidden" {...register('ownerId', { required: true })} />

              <div className={sectionClasses}>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🏪 Thông tin cơ bản</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Tên cửa hàng *</label>
                    <input
                      {...register('name', { required: 'Tên cửa hàng bắt buộc', maxLength: 100 })}
                      className={inputClasses}
                      placeholder="Nhập tên cửa hàng của bạn"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1 font-medium">{errors.name.message}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Địa chỉ *</label>
                  <input
                    {...register('address', { required: 'Địa chỉ bắt buộc', maxLength: 255 })}
                    className={inputClasses}
                    placeholder="Nhập địa chỉ cửa hàng"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1 font-medium">{errors.address.message}</p>}
                </div>

                <div>
                  <label className={labelClasses}>🖼️ Ảnh đại diện</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        {...register('imageFile')}
                        type="file"
                        accept="image/*"
                        className="w-full file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-purple-500 file:to-blue-500 file:text-white file:font-semibold hover:file:from-purple-600 hover:file:to-blue-600 file:transition-all file:duration-300 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>👤 Loại người bán</label>
                  <Controller
                    control={control}
                    name="sellerType"
                    render={({ field }) => (
                      <select {...field} className={inputClasses + ' cursor-pointer'}>
                        <option value="INDIVIDUAL">🧑‍💼 Cá nhân</option>
                        <option value="BUSINESS">🏢 Doanh nghiệp</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              {sellerType === 'INDIVIDUAL' && (
                <div className={sectionClasses + ' transform transition-all duration-500 animate-in slide-in-from-right'}>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🧑‍💼 Thông tin cá nhân</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Họ và tên</label>
                      <input {...register('fullName')} className={inputClasses} placeholder="Nguyễn Văn A" />
                    </div>

                    <div>
                      <label className={labelClasses}>Ngày sinh</label>
                      <input type="date" {...register('dateOfBirth')} className={inputClasses} />
                    </div>

                    <div>
                      <label className={labelClasses}>📞 Số điện thoại</label>
                      <input {...register('phone')} className={inputClasses} placeholder="0123456789" />
                    </div>

                    <div>
                      <label className={labelClasses}>📧 Email</label>
                      <input type="email" {...register('email')} className={inputClasses} placeholder="example@email.com" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>📦 Địa chỉ kho</label>
                    <input {...register('warehouseAddress')} className={inputClasses} placeholder="Địa chỉ kho hàng" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>🆔 CMND/CCCD - Mặt trước</label>
                      <input
                        {...register('idFrontFile')}
                        type="file"
                        accept="image/*"
                        className="w-full file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-green-500 file:to-teal-500 file:text-white file:font-semibold hover:file:from-green-600 hover:file:to-teal-600 file:transition-all file:duration-300 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4"
                      />
                    </div>

                    <div>
                      <label className={labelClasses}>🆔 CMND/CCCD - Mặt sau</label>
                      <input
                        {...register('idBackFile')}
                        type="file"
                        accept="image/*"
                        className="w-full file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-green-500 file:to-teal-500 file:text-white file:font-semibold hover:file:from-green-600 hover:file:to-teal-600 file:transition-all file:duration-300 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4"
                      />
                    </div>
                  </div>
                </div>
              )}

              {sellerType === 'BUSINESS' && (
                <div className={sectionClasses + ' transform transition-all duration-500 animate-in slide-in-from-left'}>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🏢 Thông tin doanh nghiệp</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>Tên doanh nghiệp</label>
                      <input {...register('businessName')} className={inputClasses} placeholder="Công ty TNHH ABC" />
                    </div>

                    <div>
                      <label className={labelClasses}>🏷️ Mã số thuế</label>
                      <input {...register('taxId')} className={inputClasses} placeholder="0123456789" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>📄 Giấy phép kinh doanh</label>
                    <input
                      {...register('businessLicenseFile')}
                      type="file"
                      accept="image/*,application/pdf"
                      className="w-full file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white file:font-semibold hover:file:from-orange-600 hover:file:to-red-600 file:transition-all file:duration-300 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClasses}>👨‍💼 Người đại diện pháp luật</label>
                      <input {...register('legalRepresentative')} className={inputClasses} placeholder="Nguyễn Văn B" />
                    </div>

                    <div>
                      <label className={labelClasses}>🏢 Địa chỉ công ty</label>
                      <input {...register('companyAddress')} className={inputClasses} placeholder="Địa chỉ trụ sở chính" />
                    </div>
                  </div>
                </div>
              )}

              <div className={sectionClasses}>
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🏦 Thông tin ngân hàng</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>👤 Chủ tài khoản</label>
                    <input {...register('bankAccountHolder')} className={inputClasses} placeholder="Nguyễn Văn A" />
                  </div>

                  <div>
                    <label className={labelClasses}>💳 Số tài khoản</label>
                    <input {...register('bankAccountNumber')} className={inputClasses} placeholder="1234567890" />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>🏛️ Ngân hàng</label>
                  <input {...register('bankName')} className={inputClasses} placeholder="Vietcombank, BIDV, Techcombank..." />
                </div>
              </div>

              {serverError && (
                <div className="bg-red-100/90 backdrop-blur-sm border border-red-300 text-red-700 px-6 py-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">❌</span>
                    <p className="font-medium">{serverError}</p>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="bg-green-100/90 backdrop-blur-sm border border-green-300 text-green-700 px-6 py-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <p className="font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Đang gửi...
                    </>
                  ) : (
                    <>✨ Tạo cửa hàng</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  🔄 Reset
                </button>
              </div>

              <div className="mt-8 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <p className="text-sm text-gray-700 text-center">💡 Lưu ý: hình ảnh sẽ được upload lên Cloudinary qua API signing của bạn.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
