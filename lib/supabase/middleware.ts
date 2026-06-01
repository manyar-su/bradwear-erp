import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiPath = pathname.startsWith('/api');
  const isLoginPage = pathname === '/login';
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === '1';

  if (isApiPath) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  if (!hasSession && !isLoginPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}
