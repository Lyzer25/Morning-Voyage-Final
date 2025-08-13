import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import * as nextHeaders from 'next/headers';

export async function GET() {
  try {
    const session = await getServerSession();

    // Normalize cookie access for different Next versions
    const cookieStore: any = await (nextHeaders as any).cookies();
    const allCookies = (cookieStore.getAll && Array.isArray(cookieStore.getAll()))
      ? cookieStore.getAll()
      : (cookieStore.getAll ? cookieStore.getAll() : []);
    const mv = (cookieStore.get && cookieStore.get('mv_session')) || null;

    return NextResponse.json({
      session,
      sessionCookieExists: !!mv?.value,
      sessionCookieValue: mv?.value ? 'present' : 'missing',
      allCookieNames: Array.isArray(allCookies) ? allCookies.map((c: any) => c.name) : [],
      authSecretExists: !!process.env.AUTH_SECRET
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Debug session route error', error);
    return NextResponse.json({
      error: (error as any)?.message || String(error),
      authSecretExists: !!process.env.AUTH_SECRET
    }, { status: 500 });
  }
}
