import { getServerSession } from "@/lib/auth";
import HeaderClient from "./header";
 
// Force fresh server-side rendering for header so session state is always current
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
 
export default async function HeaderServer() {
  try {
    const session = await getServerSession();
    // Debug logging for troubleshooting session propagation (remove in production)
    // eslint-disable-next-line no-console
    console.log('HeaderServer render:', session ? `Logged in: ${session.email}` : 'Not logged in');
    return <HeaderClient session={session} key={`header-${Date.now()}-${Math.random()}`} />;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('HeaderServer error:', error);
    return <HeaderClient session={null} key={`header-error-${Date.now()}`} />;
  }
}
