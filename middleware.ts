import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth-edge';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/forgot-password', '/api/auth', '/verify'];
const DASHBOARD_PREFIX = '/dashboard';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and API auth routes
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    // If user is already logged in and verified, don't let them go to login/signup/verify
    const token = req.cookies.get('vexta_token')?.value;
    if (token) {
      try {
        const payload = await verifyTokenEdge(token);
        if (payload.isVerified && (pathname === '/login' || pathname === '/signup' || pathname === '/verify')) {
          if (payload.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', req.url));
          }
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      } catch {}
    }
    return NextResponse.next();
  }

  // Protect admin routes and API admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // CLI/Cron simulate route fallback
    if (pathname === '/api/admin/simulate') {
      const adminKey = req.headers.get('x-admin-key');
      if (adminKey === (process.env.ADMIN_KEY ?? 'vexta-admin-dev')) {
        return NextResponse.next();
      }
    }

    // Cron job bypass for run-daily-roi
    if (pathname === '/api/admin/run-daily-roi') {
      const cronSecret = process.env.CRON_SECRET;
      const cronHeader = req.headers.get('x-cron-key');
      const authHeader = req.headers.get('authorization');
      const querySecret = req.nextUrl.searchParams.get('secret');

      const isCronCall =
        (cronSecret && cronHeader === cronSecret) ||
        (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
        (cronSecret && querySecret === cronSecret);

      if (isCronCall) {
        return NextResponse.next();
      }
    }

    const token = req.cookies.get('vexta_token')?.value;
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const payload = await verifyTokenEdge(token);
      if (payload.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    } catch (err) {
      console.error('[middleware-admin-error]', err);
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('vexta_token');
      return response;
    }
  }

  // Protect dashboard and private API routes
  if (pathname.startsWith(DASHBOARD_PREFIX) || (pathname.startsWith('/api/') && !pathname.startsWith('/api/plisio'))) {
    const token = req.cookies.get('vexta_token')?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const payload = await verifyTokenEdge(token);
      
      // If user is not verified, they must verify
      if (!payload.isVerified) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Verification required' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/verify', req.url));
      }

      return NextResponse.next();
    } catch (err) {
      console.error('[middleware-dashboard-error]', err);
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('vexta_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/admin',
    '/admin/:path*',
    '/api/((?!auth).)*', // all /api/* except /api/auth/*
    '/login',
    '/signup',
    '/verify',
    '/forgot-password',
  ],
};
