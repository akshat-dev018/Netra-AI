import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  const cookie = request.headers.get('cookie') || '';
  const refreshToken = cookie.match(/refreshToken=([^;]+)/)?.[1];

  if (!refreshToken) {
    return NextResponse.json({ success: false, error: { code: 'TOKEN_INVALID', message: 'No refresh token' } }, { status: 401 });
  }

  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, error: { code: 'REFRESH_TOKEN_INVALID', message: 'Invalid refresh token' } }, { status: 401 });
  }
}
