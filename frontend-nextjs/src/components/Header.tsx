'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { authService, User } from '@/services/authService';

type HeaderProps = {
  lang?: 'vi' | 'en';
  setLang?: (l: 'vi' | 'en') => void;
  openLogin?: () => void;
};

export default function Header({ lang = 'vi', setLang }: HeaderProps) {
  const router = useRouter();
  const [langDropdown, setLangDropdown] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [localLang, setLocalLang] = useState<'vi' | 'en'>(lang);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load user information on component mount
  useEffect(() => {
    loadUserInfo();
  }, []);

  async function loadUserInfo() {
    try {
      setLoading(true);
      const response = await authService.validateToken();
      if (response.valid) {
        setUser(authService.getCurrentUser());
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  function changeLang(l: 'vi' | 'en') {
    setLocalLang(l);
    if (setLang) setLang(l);
  }
const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const result = await authService.logout(); // <-- gọi hàm mới (gọi backend + clear local)
      if (!result.success) {
        // fallback: show console (thêm toast nếu bạn muốn)
        console.error('Logout result:', result.message);
      }
      // đảm bảo UI local cũng được cập nhật
      setUser(null);
      router.push('/');
    } catch (e) {
      console.error('Logout unexpected error:', e);
      setUser(null);
      router.push('/');
    } finally {
      setLoggingOut(false);
    }
  };


  // --- Sửa ở đây: baseBtnClass giờ dùng viền trắng mờ và hiệu ứng giống nút đăng nhập/đăng ký ---
  const baseBtnClass =
    'border-2 border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 transition-all duration-200 ease-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 active:scale-95 rounded-lg';

  // Primary button - màu cam chính (vẫn giữ gradient nhưng viền & hiệu ứng từ base)
  const PrimaryBtn = ({
    children,
    onClick,
    className = '',
    ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseBtnClass} relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium px-4 py-2 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500 pointer-events-none"></div>
    </button>
  );

  // Secondary button - nền mờ trắng (dùng để Đăng ký)
  const SecondaryBtn = ({
    children,
    onClick,
    className = '',
    ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseBtnClass} relative overflow-hidden bg-white/10 text-white font-medium px-4 py-2 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-black/5 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500 pointer-events-none"></div>
    </button>
  );

  // Ghost button cho top bar (transparent nhưng vẫn có viền trắng mờ & hiệu ứng)
  const GhostBtn = ({
    children,
    onClick,
    className = '',
    ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseBtnClass} relative text-white px-3 py-1.5 rounded-md bg-transparent ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-black/0 rounded-md hover:bg-black/5 transition-colors duration-200 pointer-events-none"></div>
    </button>
  );

  // Icon button với hiệu ứng đẹp (dùng viền trắng mờ)
  const IconBtn = ({
    children,
    onClick,
    className = '',
    ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseBtnClass} group relative inline-flex items-center justify-center gap-2 p-3 rounded-full bg-white/10 text-white ${className}`}
    >
      <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">{children}</span>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </button>
  );

  // Danger button cho logout (giữ màu đỏ nhưng viền & hiệu ứng giống login)
  const DangerBtn = ({
    children,
    onClick,
    className = '',
    ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseBtnClass} relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 text-white font-medium px-4 py-2 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500 pointer-events-none"></div>
    </button>
  );

  return (
    <header className="bg-white shadow-sm">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center text-sm">
          <div className="flex gap-3">
            <GhostBtn onClick={() => router.push('/seller/sellerdashboard')}>
              <span className="mr-1">🏪</span>Kênh Người Bán
            </GhostBtn>
          </div>

          <div className="flex items-center gap-3">
            <GhostBtn onClick={() => router.push('/notifications')}>
              <span className="mr-1">🔔</span>Thông báo
            </GhostBtn>
            <GhostBtn onClick={() => router.push('/support')}>
              <span className="mr-1">❓</span>Hỗ trợ
            </GhostBtn>

            <div className="relative">
              <button
                onClick={() => setLangDropdown(s => !s)}
                className="relative text-white font-medium px-3 py-1.5 rounded-md flex items-center gap-2 hover:backdrop-blur-sm"
              >
                <span className="relative z-10 flex items-center gap-1">
                  <span>🌐</span>
                  {localLang === 'vi' ? 'Tiếng Việt' : 'English'}
                  <svg className={`w-3 h-3 transition-transform duration-200 ${langDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {langDropdown && (
                <ul className="absolute right-0 mt-2 w-44 bg-white text-gray-700 rounded-lg shadow-xl border border-gray-100 z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <li>
                    <button
                      className={`w-full text-left px-4 py-3 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 ${localLang === 'vi' ? 'bg-orange-50 text-orange-600 font-semibold' : ''}`}
                      onClick={() => { changeLang('vi'); setLangDropdown(false); }}
                    >
                      🇻🇳 Tiếng Việt
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-3 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 ${localLang === 'en' ? 'bg-orange-50 text-orange-600 font-semibold' : ''}`}
                      onClick={() => { changeLang('en'); setLangDropdown(false); }}
                    >
                      🇺🇸 English
                    </button>
                  </li>
                </ul>
              )}
            </div>

            <GhostBtn onClick={() => router.push('/orders')}>
              <span className="mr-1">📦</span>Đơn hàng của tôi
            </GhostBtn>

            <div className="flex gap-3 items-center ml-2">
              {loading ? (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Đang tải...</span>
                </div>
              ) : user ? (
                <>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
                    <span className="text-orange-200">👤</span>
                    <span className="truncate max-w-[120px] font-medium">
                      {user.displayName || user.username}
                    </span>
                  </div>
                  <DangerBtn onClick={handleLogout}>Đăng xuất</DangerBtn>
                </>
              ) : (
                <>
                  <SecondaryBtn onClick={() => router.push('/register')} className="hover:bg-white hover:text-orange-600">
                    Đăng ký
                  </SecondaryBtn>
                  <GhostBtn
                    onClick={() => router.push('/auth/login')}
                    className="border border-white/30"
                  >
                    Đăng nhập
                  </GhostBtn>

                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logo + Giỏ hàng, Chat toggle */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.push('/')} 
          className="group flex items-center gap-3 text-lg font-semibold focus:outline-none hover:scale-105 transform transition-all duration-200"
        >
          <span className="text-4xl group-hover:rotate-12 transition-transform duration-300">🛍️</span>
          <span className="text-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-pink-500 bg-clip-text text-transparent font-bold tracking-wide">
            Shop247
          </span>
        </button>

        <div className="flex items-center gap-4">
          <IconBtn
            onClick={() => {
              const uid = user?.userID;
              const url = uid ? `/cart?userId=${encodeURIComponent(uid)}` : '/cart';
              router.push(url);
            }}
            ariaLabel="Giỏ hàng"
            className="bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600"
          >
            <span className="text-xl">🛒</span>
          </IconBtn>

          <IconBtn
            onClick={() => setChatOpen(s => !s)}
            ariaLabel="Chat"
            className="bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Chat</span>
          </IconBtn>

        </div>
      </div>

      {/* ChatPanel (simple) với cải thiện UI */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white/95 backdrop-blur-md border border-orange-200/50 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white p-4 flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat Hỗ Trợ
            </span>
            <button 
              onClick={() => setChatOpen(false)} 
              className="hover:bg-white/20 rounded-xl p-2 transition-all duration-200 transform hover:scale-110"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto bg-gradient-to-b from-orange-50/50 to-pink-50/30">
            <div className="text-slate-500 text-sm text-center mt-8">
              Tin nhắn sẽ hiển thị ở đây...
            </div>
          </div>
          <div className="p-4 border-t border-orange-100 bg-white/80 backdrop-blur-sm">
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 border-2 border-orange-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-3 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 bg-white/90" 
                placeholder="Nhập tin nhắn..." 
              />
              <button className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white px-4 py-2.5 rounded-xl hover:from-orange-500 hover:via-orange-600 hover:to-red-600 hover:shadow-lg hover:shadow-orange-300/50 transition-all duration-200 transform hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
