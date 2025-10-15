'use client';

import React, { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE ?? 'http://localhost:8080/auth-service';

export default function ForgotPassword(): JSX.Element {
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  }

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      showError('Vui lòng nhập tên đăng nhập');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/auth/forgot-password-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        showError(text || 'Lỗi khi gửi OTP');
        setLoading(false);
        return;
      }

      const data = await res.json();
      showMessage(data?.message || 'OTP đã được gửi tới email');
      setStep('reset');
    } catch (err) {
      showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) {
      showError('Vui lòng điền đầy đủ OTP và mật khẩu mới');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/api/auth/reset-password-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        showError(text || `Lỗi đặt lại mật khẩu (${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      showMessage(data?.message || 'Đặt lại mật khẩu thành công');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4 relative">
      <div className="floating-shapes absolute inset-0 -z-10">
        <div className="shape" />
        <div className="shape" />
        <div className="shape" />
      </div>

      <div className="glass-effect w-full max-w-md rounded-2xl p-8 relative z-10">
        <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 via-pink-500 to-yellow-400 text-transparent bg-clip-text tracking-wide text-center">
          Shop247
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Quên mật khẩu</p>

        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập hoặc email</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg input-focus focus:outline-none"
              placeholder="Nhập tên đăng nhập hoặc email"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Đang gửi OTP...' : 'Gửi OTP'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="mb-4 text-sm text-gray-600">Nhập mã OTP đã gửi vào email và mật khẩu mới</p>

            <label className="block text-sm font-medium text-gray-700">Mã OTP</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg input-focus focus:outline-none"
              placeholder="Nhập mã OTP"
              disabled={loading}
            />

            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg input-focus focus:outline-none"
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {message && <div className="mt-4 text-green-600 text-center">{message}</div>}
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}

        <div className="mt-6 text-center text-sm text-gray-600 space-x-4">
          <button
            className="text-indigo-600 font-medium"
            onClick={() => router.push('/')}
            disabled={loading}
          >
            quay lại
          </button>
          <button
            className="text-indigo-600 font-medium"
            onClick={() => router.push('/login')}
            disabled={loading}
          >
            đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
