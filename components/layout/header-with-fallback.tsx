'use client';
import React, { useEffect, useState } from 'react';
import type { SessionData } from '@/lib/types';
import HeaderClient from './header.client';

interface HeaderWithFallbackProps {
  initialSession?: SessionData | null;
}

export default function HeaderWithFallback({ initialSession }: HeaderWithFallbackProps) {
  const [session, setSession] = useState<SessionData | null | undefined>(initialSession);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session-check', { cache: 'no-store' });
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.warn('HeaderWithFallback: session-check endpoint returned', res.status);
          if (mounted) setSession(null);
          return;
        }
        const data = await res.json();
        if (mounted && data?.session) {
          // Build minimal session data from the session check response
          // Note: session-check only returns { session: boolean, role: string }
          // For full session data, we'd need the server component to provide it
          const sessionData: SessionData = {
            userId: 'client-detected', // Placeholder - real data comes from server
            email: 'client-detected@unknown.com', // Placeholder
            role: data.role || 'customer',
            isSubscriber: false
          };
          setSession(sessionData);
          // eslint-disable-next-line no-console
          console.log('HeaderWithFallback: client detected session with role', data.role);
        } else {
          // eslint-disable-next-line no-console
          console.log('HeaderWithFallback: no session on client check');
          if (mounted) setSession(null);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('HeaderWithFallback: client session check failed', err);
        if (mounted) setSession(null);
      }
    }

    // Only call client-side check when we didn't receive a server session
    if (session === undefined || session === null) {
      checkSession();
    }

    return () => {
      mounted = false;
    };
  }, [session]);

  // While undefined (not yet determined), render header with null to avoid hydration mismatch
  const resolved = session === undefined ? null : session;

  return <HeaderClient session={resolved} />;
}
