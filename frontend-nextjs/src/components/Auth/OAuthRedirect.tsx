'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function OAuthRedirect(): React.JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState('Đang xử lý đăng nhập...');

  useEffect(() => {
    handleOAuthRedirect();
  }, []);

  async function handleOAuthRedirect() {
    try {
      const url = new URL(window.location.href);
      const error = url.searchParams.get('error');
      const code = url.searchParams.get('code');

      function readCookie(name: string) {
        const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return v ? decodeURIComponent(v.pop()!) : null;
      }

      const savedRedirect = readCookie('redirect_uri') || '/';

      if (error) {
        console.error('OAuth error:', error);
        setStatus('Đăng nhập thất bại. Đang chuyển hướng...');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (code) {
        setStatus('Đang xác thực...');
        // OAuth2 authorization code received, backend should handle the exchange
        // and set HttpOnly cookies
        setTimeout(async () => {
          try {
            const response = await authService.validateToken();
            if (response.valid) {
              setStatus('Đăng nhập thành công! Đang chuyển hướng...');
              setTimeout(() => router.push(savedRedirect), 1000);
            } else {
              setStatus('Xác thực thất bại. Đang chuyển hướng...');
              setTimeout(() => router.push('/login'), 2000);
            }
          } catch (error) {
            console.error('Token validation error:', error);
            setStatus('Lỗi xác thực. Đang chuyển hướng...');
            setTimeout(() => router.push('/login'), 2000);
          }
        }, 1000);
        return;
      }

      // No code or error - might be direct redirect after successful OAuth
      setStatus('Đang kiểm tra trạng thái đăng nhập...');
      setTimeout(async () => {
        try {
          const response = await authService.validateToken();
          if (response.valid) {
            setStatus('Đăng nhập thành công! Đang chuyển hướng...');
            setTimeout(() => router.push(savedRedirect), 1000);
          } else {
            setStatus('Chưa đăng nhập. Đang chuyển hướng...');
            setTimeout(() => router.push('/login'), 2000);
          }
        } catch (error) {
          console.error('Token validation error:', error);
          setStatus('Lỗi xác thực. Đang chuyển hướng...');
          setTimeout(() => router.push('/login'), 2000);
        }
      }, 1000);

    } catch (error) {
      console.error('OAuth redirect error:', error);
      setStatus('Lỗi xử lý. Đang chuyển hướng...');
      setTimeout(() => router.push('/login'), 2000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg text-gray-700">{status}</div>
      </div>
    </div>
  );
}
