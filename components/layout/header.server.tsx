import { getServerSession } from "@/lib/auth";
import * as nextHeaders from "next/headers";
import HeaderWithFallback from "./header-with-fallback";
import { devLog, buildLog, prodError } from "@/lib/logger";
 
// Force fresh server-side rendering for header so session state is always current
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
 
export default async function HeaderServer() {
  // Build-time guard: during local production builds (no VERCEL_ENV) skip session checks
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    buildLog('HeaderServer: skipping session check during local production build');
    return <HeaderWithFallback initialSession={null} key="build-static" />;
  }

  // Dev-only render log
  devLog('🔄 HeaderServer rendering at:', new Date().toISOString());

  try {
    // Explicitly check for session cookie presence using runtime-compatible access
    const cookieStore: any = await (nextHeaders as any).cookies();
    const sessionCookie = cookieStore.get ? cookieStore.get('mv_session') : cookieStore.get?.('mv_session');
    devLog('🔍 HeaderServer cookie check:', !!sessionCookie?.value);

    const session = await getServerSession();
    devLog('📡 HeaderServer session result:', session ? `✅ ${session.email}` : '❌ No session');

    // Stable key - only changes when session presence changes to avoid hydration churn
    const sessionKey = session ? `logged-in-${session.userId}` : 'logged-out';

    // Use the fallback-wrapping client so the client can double-check session if needed
    return <HeaderWithFallback initialSession={session} key={sessionKey} />;
  } catch (error) {
    prodError('❌ HeaderServer error:', error);
    return <HeaderWithFallback initialSession={null} key="error-state" />;
  }
}
