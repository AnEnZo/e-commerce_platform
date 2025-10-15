'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import styles from '@/styles/login.module.css';

type AuthResponse = { message: string };

const BACKEND_BASE = 'http://localhost:8080/auth-service';
const FRONTEND_BASE = process.env.NEXT_PUBLIC_FRONTEND_BASE ?? 'http://localhost:3000';

export default function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated by validating token
    checkAuthStatus();
  }, [router]);

  async function checkAuthStatus() {
    try {
      const response = await authService.validateToken();
      if (response.valid) {
        router.push('/');
      }
    } catch (error) {
      console.log('User not authenticated');
    }
  }

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) { 
      showError('Vui lòng điền username và password'); 
      return; 
    }
    setLoading(true);
    
    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
        console.log('Login successful:', result.message);
        // Redirect to home page or specified redirect URL
        const redirect = new URL(window.location.href).searchParams.get('redirect') || '/';
        router.push(redirect);
      } else {
        showError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Login error:', err);
      showError('Lỗi khi kết nối tới server');
    } finally { 
      setLoading(false); 
    }
  }


  function setCookie(name: string, value: string, minutes = 30) {
    const d = new Date();
    d.setTime(d.getTime() + minutes * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${d.toUTCString()}`;
  }

  function oauthLogin() {
    const redirectUri = `${FRONTEND_BASE}/oauth2-redirect`;
    setCookie('redirect_uri', redirectUri, 30);
    // Redirect to OAuth2 authorization endpoint
    window.location.href = `${BACKEND_BASE}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  return (
    <div className={styles.wrapper /* dùng class từ login.module.css */}>
      <div className={styles.glass}>
        <h1 className={styles.title}>Shop247</h1>
        <p className={styles.subtitle}>Đăng nhập vào tài khoản của bạn</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Tên đăng nhập</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Nhập tên đăng nhập" />
          </div>

          <div className={styles.relative}>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className={styles.input}
              placeholder="Nhập mật khẩu"
            />

            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className={styles.toggle}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <div className={styles.row}>
            <label className={styles.remember}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <button type="button" onClick={() => router.push('/forgot-password')} className={styles.link}>Quên mật khẩu?</button>
          </div>

          <div>
            <button disabled={loading} type="submit" className={styles.submit}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </div>

          <div className={styles.or}><span>Hoặc đăng nhập với</span></div>

          <div className={styles.oauthWrap}>
            <button type="button" onClick={oauthLogin} className={styles.oauthBtn}>
              <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Đăng nhập với Google</span>
            </button>
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.footerText}>
          Chưa có tài khoản? <button onClick={() => router.push('/register')} className={styles.register}>Đăng ký ngay</button>
        </div>
      </div>
    </div>
  );
}
