import * as vercelBlob from '@vercel/blob';
import type { UserAccount, PasswordResetToken } from './types';

/**
 * Save a user account JSON to blob storage and update accounts/index.json
 */
export async function saveUserAccount(account: UserAccount): Promise<void> {
  try {
    const key = `accounts/${account.id}.json`;
    await vercelBlob.put(key, JSON.stringify(account, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    });

    const index = await getAccountIndex();
    index.emails_to_ids = index.emails_to_ids || {};
    index.emails_to_ids[account.email] = account.id;
    index.total_accounts = Object.keys(index.emails_to_ids).length;
    index.last_updated = new Date().toISOString();

    await vercelBlob.put('accounts/index.json', JSON.stringify(index, null, 2), {
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
    const index = await getAccountIndex();
    if (!index || !index.emails_to_ids) return null;
    const userId = index.emails_to_ids[email];
    if (!userId) return null;

    const downloadUrl = await vercelBlob.getDownloadUrl(`accounts/${userId}.json`);
    if (!downloadUrl) return null;

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) return null;
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
    const downloadUrl = await vercelBlob.getDownloadUrl('accounts/index.json');
    if (!downloadUrl) {
      return { total_accounts: 0, emails_to_ids: {}, last_updated: new Date().toISOString() };
    }
    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) return { total_accounts: 0, emails_to_ids: {}, last_updated: new Date().toISOString() };
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
        const downloadUrl = await vercelBlob.getDownloadUrl(`accounts/${userId}.json`);
        if (!downloadUrl) continue;

        const res = await fetch(downloadUrl);
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
 * Password reset token storage (stored in a single JSON blob).
 */
const PASSWORD_RESET_TOKENS_KEY = 'auth/password-reset-tokens.json';

export async function savePasswordResetToken(token: PasswordResetToken): Promise<void> {
  try {
    const existing = await getPasswordResetTokens();
    // Remove any existing tokens for the same user
    const updated = existing.filter(t => t.user_id !== token.user_id);
    updated.push(token);

    await vercelBlob.put(PASSWORD_RESET_TOKENS_KEY, JSON.stringify(updated, null, 2), {
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
      await vercelBlob.put(PASSWORD_RESET_TOKENS_KEY, JSON.stringify(tokens, null, 2), {
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
    const downloadUrl = await vercelBlob.getDownloadUrl(PASSWORD_RESET_TOKENS_KEY);
    if (!downloadUrl) return [];
    const res = await fetch(downloadUrl);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data as PasswordResetToken[] : [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('No password reset tokens found or failed to read', { error: (err as any)?.message || err });
    return [];
  }
}
