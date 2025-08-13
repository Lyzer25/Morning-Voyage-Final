import { getServerSession } from "@/lib/auth";
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
    const session = await getServerSession();
    // eslint-disable-next-line no-console
    console.log('📡 HeaderServer session:', session ? `✅ ${session.email}` : '❌ No session');

    // Force unique key to avoid any client-side reuse/hydration issues
    const uniqueKey = `header-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Use the fallback-wrapping client so the client can double-check session if needed
    return <HeaderWithFallback initialSession={session} key={uniqueKey} />;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ HeaderServer error:', error);
    return <HeaderWithFallback initialSession={null} key={`header-error-${Date.now()}`} />;
  }
}
