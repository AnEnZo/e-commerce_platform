// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE ?? 'http://localhost:8080/auth-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Forward client's cookies (if any) and POST body to backend
    const backendRes = await fetch(`${BACKEND_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // forward incoming cookie header so backend can read if needed
        cookie: req.headers.get('cookie') ?? ''
      },
      body: JSON.stringify(body),
      // don't auto-follow redirects (optional)
      redirect: 'manual'
    });

    // Read response body as text (could be JSON). We'll forward as-is.
    const text = await backendRes.text();

    // Prepare headers for client response; forward any Set-Cookie headers from backend
    const headers = new Headers();

    // Fetch API often returns only first 'set-cookie' via .get, but headers may contain multiple.
    // We'll attempt to append any set-cookie we find.
    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      // Append the header exactly as given by backend
      headers.append('Set-Cookie', setCookie);
    }

    // Forward status and body
    return new Response(text, { status: backendRes.status, headers });
  } catch (err) {
    console.error('Login proxy error', err);
    return NextResponse.json({ message: 'Proxy error' }, { status: 500 });
  }
}
