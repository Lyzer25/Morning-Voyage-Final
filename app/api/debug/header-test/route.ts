import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    // Debug log (server)
    // eslint-disable-next-line no-console
    console.log('Header Debug - Session:', session);

    return NextResponse.json({
      hasSession: !!session,
      sessionData: session
        ? {
            email: session.email,
            role: session.role,
            userId: session.userId,
          }
        : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Header debug error:', error);
    return NextResponse.json(
      {
        error: error?.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
