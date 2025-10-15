"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/styles/login.module.css';

// NOTE:
// - If register.css is a global stylesheet, import it from app/layout.tsx (or src/app/layout.tsx) instead.
// - If you want per-component styles, convert register.css to a CSS module (register.module.css)
//   and import it as `import styles from './register.module.css'`.
// - Make sure to set NEXT_PUBLIC_BACKEND_BASE in your environment when running the client.

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE ?? 'http://localhost:8080/auth-service';

export default function Register(): JSX.Element {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordsMatch = confirmPassword === '' || password === confirmPassword;

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!displayName || !username || !email || !phoneNumber || !password) {
      showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      showError('Mật khẩu và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, username, email, phoneNumber, password }),
        credentials: 'include' // keep this if your backend relies on cookies
      });

      const txt = await res.text();

      if (!res.ok) {
        showError(txt || `Đăng ký thất bại (${res.status})`);
        return;
      }

      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      console.error(err);
      showError('Lỗi khi kết nối tới server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.glass}>
        <h1 className={styles.title}>Shop247</h1>
        <p className={styles.subtitle}>Tạo tài khoản mới</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Tên hiển thị</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className={styles.input}
              placeholder="Nhập tên hiển thị"
            />
          </div>

          <div>
            <label className={styles.label}>Tên đăng nhập</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          <div>
            <label className={styles.label}>Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              className={styles.input}
              placeholder="Nhập email"
            />
          </div>

          <div>
            <label className={styles.label}>Số điện thoại</label>
            <input
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className={styles.input}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div>
            <label className={styles.label}>Mật khẩu</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              className={styles.input}
              placeholder="Nhập mật khẩu"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className={styles.label}>Xác nhận mật khẩu</label>
            <input
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              type="password"
              className={styles.input}
              placeholder="Nhập lại mật khẩu"
            />
            {!passwordsMatch && <div className={styles.error}>Mật khẩu không khớp</div>}
          </div>

          <div>
            <button
              disabled={loading}
              type="submit"
              className={styles.submit}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </div>
        </form>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.footerText}>
          Đã có tài khoản? <Link href="/auth/login" className={styles.register}>Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}
