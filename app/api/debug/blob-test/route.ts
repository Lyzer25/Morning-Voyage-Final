import { NextResponse } from 'next/server';

/**
 * Debug endpoint removed in cleanup.
 * Returns 410 Gone to indicate this debug route has been intentionally disabled.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Debug endpoint removed' },
    { status: 410 }
  );
}
