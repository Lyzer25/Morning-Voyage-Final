import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST() {
  try {
    await clearSession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      redirect: '/account/login'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Logout failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Logout failed'
    }, { status: 500 });
  }
}
