// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE ?? 'http://localhost:8080/auth-service';

export async function GET(req: Request) {
  try {
    const backendRes = await fetch(`${BACKEND_BASE}/api/auth/me`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') ?? ''
      }
    });

    const text = await backendRes.text();

    // Forward status + body (assume JSON)
    return new Response(text, { status: backendRes.status, headers: { 'Content-Type': backendRes.headers.get('content-type') ?? 'application/json' } });
  } catch (err) {
    console.error('Me proxy error', err);
    return NextResponse.json({ message: 'Proxy error' }, { status: 500 });
  }
}
