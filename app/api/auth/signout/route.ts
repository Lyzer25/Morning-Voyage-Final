import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear session', err);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
