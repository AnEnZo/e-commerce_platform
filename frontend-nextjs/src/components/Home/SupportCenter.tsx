"use client";

import React, { useEffect, useRef, useState } from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import '@/styles/SupportCenter.module.css';

type ChatMessage = { from: 'user' | 'bot'; text: string };


const SupportCenter: React.FC = () => {
  const [faqOpen, setFaqOpen] = useState<number | null>(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { from: 'bot', text: 'Xin chào! Tôi là trợ lý ảo của Shop247. Tôi có thể giúp gì cho bạn?' },
  ]);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type?: string }[]>([]);
  const toastIdRef = useRef(1);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  function toggleFAQ(id: number) {
    setFaqOpen(prev => (prev === id ? null : id));
  }

  function showToast(message: string, type: string = 'info') {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }

  function showCategory(category: string) {
    const categories: Record<string, string> = {
      order: 'Đơn hàng',
      payment: 'Thanh toán',
      account: 'Tài khoản',
      shipping: 'Vận chuyển',
    };
    showToast(`Đang tải danh mục ${categories[category] || category}...`, 'info');
  }

  function submitSupportRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showToast('Yêu cầu hỗ trợ đã được gửi thành công! Chúng tôi sẽ phản hồi trong 24h.', 'success');
    (e.target as HTMLFormElement).reset();
  }

  function openChat() {
    setChatOpen(true);
    setTimeout(() => chatInputRef.current?.focus(), 100);
  }

  function closeChat() {
    setChatOpen(false);
  }

  function sendChatMessage() {
    const text = chatInputRef.current?.value.trim();
    if (!text) return;
    setChatMessages(prev => [...prev, { from: 'user', text }]);
    if (chatInputRef.current) chatInputRef.current.value = '';

    // simulate bot reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: 'bot', text: 'Cảm ơn bạn đã liên hệ! Tôi đang chuyển yêu cầu cho nhân viên hỗ trợ. Vui lòng chờ trong giây lát.' }]);
    }, 800);
  }

  function callHotline() {
    showToast('Đang kết nối đến hotline 1900-1234...', 'info');
  }

  function sendEmail() {
    showToast('Đang mở ứng dụng email...', 'info');
  }

  return (
    <div className="support-page shopee-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="#" className="hover:text-shopee-orange">Trang chủ</a>
          <span className="text-gray-400">/</span>
          <span className="current">Trung tâm hỗ trợ</span>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Trung tâm hỗ trợ Shop247</h1>
            <p className="text-xl mb-6">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Tìm câu trả lời nhanh chóng hoặc liên hệ trực tiếp với đội ngũ hỗ trợ.</p>

            <div className="search-box max-w-md">
              <input type="text" placeholder="Tìm kiếm câu hỏi thường gặp..." className="w-full pl-10 pr-4 py-3 border-0 rounded-lg text-gray-900 focus:ring-2 focus:ring-white" />
              <svg className="search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </section>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh mục hỗ trợ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="support-card bg-white rounded-lg p-6 cursor-pointer" onClick={() => showCategory('order')}>
              <div className="category-icon bg-blue-100 text-blue-600">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Đơn hàng</h3>
              <p className="text-gray-600 text-sm text-center">Theo dõi, hủy, đổi trả đơn hàng</p>
              <div className="mt-4 text-center"><span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">24 bài viết</span></div>
            </div>

            <div className="support-card bg-white rounded-lg p-6 cursor-pointer" onClick={() => showCategory('payment')}>
              <div className="category-icon bg-green-100 text-green-600">💳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Thanh toán</h3>
              <p className="text-gray-600 text-sm text-center">Phương thức thanh toán, hoàn tiền</p>
              <div className="mt-4 text-center"><span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">18 bài viết</span></div>
            </div>

            <div className="support-card bg-white rounded-lg p-6 cursor-pointer" onClick={() => showCategory('account')}>
              <div className="category-icon bg-purple-100 text-purple-600">👤</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Tài khoản</h3>
              <p className="text-gray-600 text-sm text-center">Đăng ký, đăng nhập, bảo mật</p>
              <div className="mt-4 text-center"><span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">15 bài viết</span></div>
            </div>

            <div className="support-card bg-white rounded-lg p-6 cursor-pointer" onClick={() => showCategory('shipping')}>
              <div className="category-icon bg-yellow-100 text-yellow-600">🚚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Vận chuyển</h3>
              <p className="text-gray-600 text-sm text-center">Giao hàng, phí ship, địa chỉ</p>
              <div className="mt-4 text-center"><span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">12 bài viết</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm mb-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
                <p className="text-gray-600 mt-1">Những câu hỏi được khách hàng quan tâm nhất</p>
              </div>

              <div id="faqList">
                {[
                  {
                    id: 1,
                    q: 'Làm thế nào để theo dõi đơn hàng của tôi?',
                    a: (
                      <>
                        Bạn có thể theo dõi đơn hàng bằng cách:
                        <br />1. Vào mục "Đơn mua" trong tài khoản của bạn
                        <br />2. Nhập mã đơn hàng vào ô tìm kiếm
                        <br />3. Nhận thông báo qua SMS/Email về tình trạng đơn hàng
                        <br />4. Sử dụng tính năng "Theo dõi đơn hàng" trên app Shop247
                      </>
                    ),
                  },
                  {
                    id: 2,
                    q: 'Tôi có thể hủy đơn hàng không?',
                    a: (
                      <>
                        Bạn có thể hủy đơn hàng trong các trường hợp sau:
                        <br />• Đơn hàng chưa được shop xác nhận (trong vòng 1 giờ)
                        <br />• Đơn hàng chưa được giao cho đơn vị vận chuyển
                        <br />• Liên hệ hotline 1900-xxxx để được hỗ trợ hủy đơn
                        <br />• Phí hủy đơn (nếu có) sẽ được thông báo trước khi xác nhận
                      </>
                    ),
                  },
                  {
                    id: 3,
                    q: 'Các phương thức thanh toán nào được hỗ trợ?',
                    a: (
                      <>
                        Shop247 hỗ trợ các phương thức thanh toán:
                        <br />• Thanh toán khi nhận hàng (COD)
                        <br />• Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB)
                        <br />• Ví điện tử (MoMo, ZaloPay, VNPay)
                        <br />• Chuyển khoản ngân hàng
                        <br />• Ví Shop247 (tích điểm, hoàn tiền)
                      </>
                    ),
                  },
                  {
                    id: 4,
                    q: 'Chính sách đổi trả như thế nào?',
                    a: (
                      <>
                        Chính sách đổi trả 15 ngày:
                        <br />• Sản phẩm còn nguyên tem, nhãn, bao bì
                        <br />• Chưa qua sử dụng, không có dấu hiệu hư hỏng
                        <br />• Có hóa đơn mua hàng hoặc mã đơn hàng
                        <br />• Miễn phí đổi trả với lỗi từ nhà sản xuất
                        <br />• Khách hàng chịu phí ship đổi trả với lý do cá nhân
                      </>
                    ),
                  },
                  {
                    id: 5,
                    q: 'Làm sao để liên hệ với shop bán hàng?',
                    a: (
                      <>
                        Bạn có thể liên hệ shop qua:
                        <br />• Nhấn "Chat ngay" trên trang sản phẩm
                        <br />• Vào trang shop và chọn "Nhắn tin"
                        <br />• Gọi điện trực tiếp (nếu shop công khai số điện thoại)
                        <br />• Để lại bình luận/câu hỏi trên sản phẩm
                        <br />• Thông qua tính năng "Hỏi đáp" của shop
                      </>
                    ),
                  },
                ].map(item => (
                  <div className="faq-item" key={item.id}>
                    <div className="faq-question" onClick={() => toggleFAQ(item.id)}>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.q}</h3>
                      </div>
                      <svg className={`faq-icon w-5 h-5 text-gray-400 ${faqOpen === item.id ? 'rotate' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className={`faq-answer ${faqOpen === item.id ? 'active' : ''}`}>
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Gửi yêu cầu hỗ trợ</h2>
                <p className="text-gray-600 mt-1">Không tìm thấy câu trả lời? Hãy gửi yêu cầu cho chúng tôi</p>
              </div>

              <form className="p-6 space-y-4" onSubmit={submitSupportRequest}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                    <input name="name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Nhập họ và tên" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Nhập email" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input name="phone" type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Nhập số điện thoại" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục vấn đề *</label>
                    <select name="category" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                      <option value="">Chọn danh mục</option>
                      <option value="order">Đơn hàng</option>
                      <option value="payment">Thanh toán</option>
                      <option value="shipping">Vận chuyển</option>
                      <option value="account">Tài khoản</option>
                      <option value="product">Sản phẩm</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                  <input name="title" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Mô tả ngắn gọn vấn đề" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết *</label>
                  <textarea name="description" required rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đính kèm file (tùy chọn)</label>
                  <input name="files" type="file" multiple className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                  <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG, PNG, PDF. Tối đa 5MB mỗi file.</p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center">
                    <input id="urgent" name="urgent" type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                    <label htmlFor="urgent" className="ml-2 text-sm text-gray-700">Yêu cầu ưu tiên (phí 50.000đ)</label>
                  </div>
                  <button type="submit" className="shopee-orange text-white px-6 py-2 rounded-lg font-medium shopee-orange-hover transition-colors">Gửi yêu cầu</button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Liên hệ nhanh</h3>
              <div className="space-y-3">
                <div className="contact-method" onClick={openChat}>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-blue-600 text-xl">💬</span></div>
                  <h4 className="font-medium text-gray-900">Chat trực tuyến</h4>
                  <p className="text-sm text-gray-600">Phản hồi trong 2-5 phút</p>
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Đang hoạt động</span>
                </div>

                <div className="contact-method" onClick={callHotline}>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-green-600 text-xl">📞</span></div>
                  <h4 className="font-medium text-gray-900">Hotline</h4>
                  <p className="text-sm text-gray-600 font-medium">1900-1234</p>
                  <p className="text-xs text-gray-500">24/7 - Miễn phí</p>
                </div>

                <div className="contact-method" onClick={sendEmail}>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-purple-600 text-xl">📧</span></div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-sm text-gray-600">support@shop247.vn</p>
                  <p className="text-xs text-gray-500">Phản hồi trong 24h</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Yêu cầu của tôi</h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">#SP001234</span>
                    <span className="ticket-status open">Đang xử lý</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Đơn hàng chưa được giao</p>
                  <p className="text-xs text-gray-500">2 giờ trước</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">#SP001230</span>
                    <span className="ticket-status resolved">Đã giải quyết</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Hoàn tiền đơn hàng</p>
                  <p className="text-xs text-gray-500">1 ngày trước</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">#SP001225</span>
                    <span className="ticket-status closed">Đã đóng</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Thay đổi địa chỉ giao hàng</p>
                  <p className="text-xs text-gray-500">3 ngày trước</p>
                </div>
              </div>

              <button className="w-full mt-4 text-shopee-orange border border-orange-300 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">Xem tất cả yêu cầu</button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bài viết phổ biến</h3>
              <div className="space-y-3">
                {[
                  { t: 'Hướng dẫn đặt hàng trên Shop247', v: '👁️ 15.2k lượt xem' },
                  { t: 'Cách sử dụng mã giảm giá', v: '👁️ 12.8k lượt xem' },
                  { t: 'Chính sách bảo hành sản phẩm', v: '👁️ 9.5k lượt xem' },
                  { t: 'Hướng dẫn đổi trả hàng', v: '👁️ 8.1k lượt xem' },
                ].map((a, idx) => (
                  <a key={idx} href="#" className="block hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{a.t}</h4>
                    <p className="text-xs text-gray-500">{a.v}</p>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* Chat widget */}
      {chatOpen && (
        <div id="chatWidget" className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col">
            <div className="bg-orange-500 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center"><span className="text-sm">🤖</span></div>
                <div>
                  <h4 className="font-medium">Hỗ trợ Shop247</h4>
                  <p className="text-xs opacity-90">Đang hoạt động</p>
                </div>
              </div>
              <button onClick={closeChat} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto" id="chatMessages" ref={messagesRef}>
              {chatMessages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.from === 'user' ? 'user' : 'bot'} p-3 rounded-lg mb-2`}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input ref={chatInputRef} onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }} type="text" placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                <button onClick={sendChatMessage} className="shopee-orange text-white px-4 py-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="toasts-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type || 'info'}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
};

export default SupportCenter;

