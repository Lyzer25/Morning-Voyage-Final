import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: session ? {
        email: session.email,
        role: session.role,
        isSubscriber: session.isSubscriber
      } : null,
      sessionExists: !!session
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
