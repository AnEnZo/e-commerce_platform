// app/login/page.tsx
import LoginForm from '@/components/Auth/LoginForm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // NOTE: cookies() trả Promise trong một số cấu hình => cần await
  const cookieStore = await cookies(); // <-- sửa: await ở đây
  const token = cookieStore.get('ACCESS-TOKEN')?.value;

  if (token) {
    // Build cookie header string from cookie store (include any cookies Next received)
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.length > 0
      ? allCookies.map(c => `${c.name}=${c.value}`).join('; ')
      : '';

    const base = process.env.NEXT_PUBLIC_BACKEND_BASE || '';
    try {
      // Gửi trực tiếp tới backend để verify (gửi cookie header tự build)
      const meRes = await fetch(`${base}/api/auth/me`, {
        method: 'GET',
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
        // đảm bảo không cache để kiểm tra thực tế
        cache: 'no-store'
      });

      if (meRes.ok) {
        // Nếu đã auth -> server-side redirect
        redirect('/home');
      }
      // else: fall through để render login
    } catch (err) {
      console.error('Verify session error', err);
      // Nếu backend unreachable, bạn có thể vẫn render login hoặc show lỗi tuỳ UX
    }
  }

  return <LoginForm />;
}
