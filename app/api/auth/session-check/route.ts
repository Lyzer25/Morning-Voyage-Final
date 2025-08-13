import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    return NextResponse.json({
      session: !!session,
      role: session?.role || null
    });
  } catch {
    return NextResponse.json({ session: false, role: null });
  }
}
