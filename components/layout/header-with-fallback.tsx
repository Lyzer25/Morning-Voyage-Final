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
        const res = await fetch('/api/debug/header-test', { cache: 'no-store' });
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.warn('HeaderWithFallback: debug endpoint returned', res.status);
          return;
        }
        const data = await res.json();
        if (mounted && data?.hasSession) {
          setSession(data.sessionData);
          // eslint-disable-next-line no-console
          console.log('HeaderWithFallback: client detected session', data.sessionData);
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
