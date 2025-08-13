import { put, list } from '@vercel/blob';
import type { UserAccount, PasswordResetToken } from './types';

/**
 * Save a user account JSON to blob storage and update accounts/index.json
 */
export async function saveUserAccount(account: UserAccount): Promise<void> {
  try {
    const key = `accounts/${account.id}.json`;
    // Write account JSON (stringify)
    await put(key, JSON.stringify(account, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });

    // Update index (ensure emails stored in lowercase)
    const index = await getAccountIndex();
    index.emails_to_ids = index.emails_to_ids || {};
    index.emails_to_ids[account.email.toLowerCase()] = account.id;
    index.total_accounts = Object.keys(index.emails_to_ids).length;
    index.last_updated = new Date().toISOString();

    await put('accounts/index.json', JSON.stringify(index, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to save user account', { error: (err as any)?.message || err });
    throw err;
  }
}

/**
 * Get a user account by email using the index file.
 */
export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  try {
    const normalizedEmail = (email || '').toLowerCase();
    const index = await getAccountIndex();
    if (!index || !index.emails_to_ids) return null;
    const userId = index.emails_to_ids[normalizedEmail];
    if (!userId) return null;

    // Use list() to locate the blob and get a usable url (matches admin patterns)
    const blobs = await list({ prefix: `accounts/${userId}.json`, limit: 1 });
    const blobItem = blobs?.blobs?.[0];
    const downloadUrl = blobItem?.url;
    if (!downloadUrl) {
      console.warn('getUserByEmail: blob url not found for', userId);
      return null;
    }

    try {
      const res = await fetch(downloadUrl, { cache: 'no-store' });
      if (!res.ok) {
        console.error('getUserByEmail: fetch failed', { url: downloadUrl, status: res.status });
        return null;
      }
      const account = await res.json();
      return account as UserAccount;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch/parse user account JSON', err);
      return null;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to get user by email', { error: (err as any)?.message || err });
    return null;
  }
}

/**
 * Read accounts/index.json; return a default structure if missing.
 */
async function getAccountIndex(): Promise<{ total_accounts: number; emails_to_ids: Record<string, string>; last_updated: string }> {
  try {
    // Use list() to locate the index blob and fetch via its url (matches admin pattern)
    const blobs = await list({ prefix: 'accounts/index.json', limit: 1 });
    const blobItem = blobs?.blobs?.[0];
    const downloadUrl = blobItem?.url;
    if (!downloadUrl) {
      return { total_accounts: 0, emails_to_ids: {}, last_updated: new Date().toISOString() };
    }
    try {
      const res = await fetch(downloadUrl, { cache: 'no-store' });
      if (!res.ok) {
        console.warn('getAccountIndex: fetch failed', { url: downloadUrl, status: res.status });
        return { total_accounts: 0, emails_to_ids: {}, last_updated: new Date().toISOString() };
      }
      const data = await res.json();
      return {
        total_accounts: data.total_accounts || 0,
        emails_to_ids: data.emails_to_ids || {},
        last_updated: data.last_updated || new Date().toISOString(),
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch/parse accounts/index.json', err);
      return { total_accounts: 0, emails_to_ids: {}, last_updated: new Date().toISOString() };
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('accounts/index.json not found, initializing index', { error: (err as any)?.message || err });
    return { total_accounts: 0, emails_to_ids: {}, last_updated: new Date().toISOString() };
  }
}

/**
 * Get all non-deleted user accounts, sorted by creation date (newest first).
 */
export async function getAllAccounts(): Promise<UserAccount[]> {
  try {
    const index = await getAccountIndex();
    const accounts: UserAccount[] = [];

    const ids = Object.values(index.emails_to_ids || {});
    for (const userId of ids) {
      try {
        // Use list() to locate the account blob and fetch via its url
        const blobs = await list({ prefix: `accounts/${userId}.json`, limit: 1 });
        const blobItem = blobs?.blobs?.[0];
        const downloadUrl = blobItem?.url;
        if (!downloadUrl) continue;

        const res = await fetch(downloadUrl, { cache: 'no-store' });
        if (!res.ok) continue;

        const account = await res.json() as UserAccount;
        if (account && account.status !== 'deleted') {
          accounts.push(account);
        }
      } catch (err) {
        // Skip failed account reads
        // eslint-disable-next-line no-console
        console.warn(`Failed to read account ${userId}`, { error: (err as any)?.message || err });
        continue;
      }
    }

    // Sort by profile.created_at descending (newest first)
    accounts.sort((a, b) => {
      const aTime = new Date(a.profile.created_at).getTime();
      const bTime = new Date(b.profile.created_at).getTime();
      return bTime - aTime;
    });

    return accounts;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get all accounts:', error);
    return [];
  }
}

/**
 * Get a user account by id (reads the individual account JSON blob).
 */
export async function getUserById(userId: string): Promise<UserAccount | null> {
  try {
    if (!userId) return null;
    const blobs = await list({ prefix: `accounts/${userId}.json`, limit: 1 });
    const blobItem = blobs?.blobs?.[0];
    const downloadUrl = blobItem?.url;
    if (!downloadUrl) return null;

    const res = await fetch(downloadUrl, { cache: 'no-store' });
    if (!res.ok) {
      console.warn('getUserById: fetch failed', { url: downloadUrl, status: res.status });
      return null;
    }

    const account = await res.json();
    return account as UserAccount;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getUserById: failed to read account', { userId, error: (err as any)?.message || err });
    return null;
  }
}

/**
 * Password reset token storage (stored in a single JSON blob).
 */
const PASSWORD_RESET_TOKENS_KEY = 'auth/password-reset-tokens.json';

export async function savePasswordResetToken(token: PasswordResetToken): Promise<void> {
  try {
    const existing = await getPasswordResetTokens();
    // Remove any existing tokens for the same user
    const updated = existing.filter(t => t.user_id !== token.user_id);
    updated.push(token);

    await put(PASSWORD_RESET_TOKENS_KEY, JSON.stringify(updated, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to save password reset token', { error: (err as any)?.message || err });
    throw err;
  }
}

export async function getPasswordResetToken(tokenString: string): Promise<PasswordResetToken | null> {
  try {
    const tokens = await getPasswordResetTokens();
    const found = tokens.find(t => t.token === tokenString && !t.used && new Date(t.expires_at) > new Date());
    return found || null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to get password reset token', { error: (err as any)?.message || err });
    return null;
  }
}

export async function markPasswordResetTokenUsed(tokenString: string): Promise<void> {
  try {
    const tokens = await getPasswordResetTokens();
    const idx = tokens.findIndex(t => t.token === tokenString);
    if (idx >= 0) {
      tokens[idx].used = true;
      await put(PASSWORD_RESET_TOKENS_KEY, JSON.stringify(tokens, null, 2), {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true,
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to mark password reset token used', { error: (err as any)?.message || err });
  }
}

async function getPasswordResetTokens(): Promise<PasswordResetToken[]> {
  try {
    // Use list() to locate the password-reset-tokens blob and fetch via its url
    const blobs = await list({ prefix: PASSWORD_RESET_TOKENS_KEY, limit: 1 });
    const blobItem = blobs?.blobs?.[0];
    const downloadUrl = blobItem?.url;
    if (!downloadUrl) return [];
    const res = await fetch(downloadUrl, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data as PasswordResetToken[] : [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('No password reset tokens found or failed to read', { error: (err as any)?.message || err });
    return [];
  }
}

/**
 * Test helper: write & read a debug JSON file to verify blob I/O
 */
export async function testAccountStorage(): Promise<{ ok: boolean; details?: any }> {
  const key = `accounts/debug-test-${Date.now()}.json`;
  const payload = { test: 'account-storage', time: new Date().toISOString() };

  try {
    const writeResult = await put(key, JSON.stringify(payload, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });

    // Prefer the immediate write result URL; fallback to list() if needed
    const url = writeResult?.url || (await (async () => {
      const blobs = await list({ prefix: key, limit: 1 });
      return blobs?.blobs?.[0]?.url;
    })());

    if (!url) {
      return { ok: false, details: { error: 'blob url not found after write', key } };
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return { ok: false, details: { error: 'fetch failed', status: res.status, url } };
    }
    const body = await res.text();
    const snippet = body.substring(0, 1000);

    return { ok: true, details: { key, url, snippet } };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('testAccountStorage error', err);
    return { ok: false, details: { error: (err as any)?.message || String(err) } };
  }
}
