import { NextResponse } from 'next/server';
import { testAccountStorage } from '@/lib/blob-accounts';

export async function GET() {
  try {
    const result = await testAccountStorage();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Debug blob-test route error', err);
    return NextResponse.json({ success: false, error: (err as any)?.message || String(err) }, { status: 500 });
  }
}
