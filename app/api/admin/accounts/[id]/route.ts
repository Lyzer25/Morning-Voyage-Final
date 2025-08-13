import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getUserById, saveUserAccount } from '@/lib/blob-accounts';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const accountId = params.id;
    const updates = await request.json();

    // Get existing account
    const account = await getUserById(accountId);
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Build updated subscriber object
    const updatedSubscriber = {
      is_subscriber: !!updates.isSubscriber,
      tier: updates.isSubscriber ? (updates.subscriptionTier || null) : null,
      expires_at: updates.isSubscriber ? (updates.subscriptionExpires || null) : null
    };

    // Update account fields (preserve any fields not provided)
    const updatedAccount = {
      ...account,
      email: updates.email || account.email,
      role: updates.role || account.role,
      status: updates.status || account.status,
      profile: {
        ...account.profile,
        display_name: updates.displayName || account.profile.display_name
      },
      subscriber: {
        ...account.subscriber,
        ...updatedSubscriber
      }
    };

    // Persist updated account to blob storage
    await saveUserAccount(updatedAccount);

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Account update failed:', error);
    return NextResponse.json({
      error: 'Failed to update account'
    }, { status: 500 });
  }
}
