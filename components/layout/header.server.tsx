import { getServerSession } from "@/lib/auth";
import * as nextHeaders from "next/headers";
import HeaderWithFallback from "./header-with-fallback";
 
// Force fresh server-side rendering for header so session state is always current
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
 
export default async function HeaderServer() {
  // Log render attempts with timestamp for debugging
  // eslint-disable-next-line no-console
  console.log('🔄 HeaderServer rendering at:', new Date().toISOString());

  try {
    // Explicitly check for session cookie presence using runtime-compatible access
    const cookieStore: any = await (nextHeaders as any).cookies();
    const sessionCookie = cookieStore.get ? cookieStore.get('mv_session') : cookieStore.get?.('mv_session');
    // eslint-disable-next-line no-console
    console.log('🔍 HeaderServer cookie check:', !!sessionCookie?.value);

    const session = await getServerSession();
    // eslint-disable-next-line no-console
    console.log('📡 HeaderServer session result:', session ? `✅ ${session.email}` : '❌ No session');

    // Stable key - only changes when session presence changes to avoid hydation churn
    const sessionKey = session ? `logged-in-${session.userId}` : 'logged-out';

    // Use the fallback-wrapping client so the client can double-check session if needed
    return <HeaderWithFallback initialSession={session} key={sessionKey} />;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ HeaderServer error:', error);
    return <HeaderWithFallback initialSession={null} key="error-state" />;
  }
}
