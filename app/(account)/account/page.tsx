import { getServerSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/blob-accounts';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect('/account/login');

  const user = await getUserByEmail(session.email);
  if (!user) redirect('/account/login');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Display Name</label>
              <p className="text-gray-900">{user.profile.display_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Account Type</label>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user.role}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Member Since</label>
              <p className="text-gray-900">{new Date(user.profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
          {user.subscriber.is_subscriber ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-green-700 font-medium">Active Subscriber</span>
              </div>
              <p className="text-sm text-gray-600">Tier: {user.subscriber.tier}</p>
              {user.subscriber.expires_at && (
                <p className="text-sm text-gray-600">
                  Expires: {new Date(user.subscriber.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                <span className="text-gray-700">No Active Subscription</span>
              </div>
              <p className="text-sm text-gray-600">Subscribe to get exclusive discounts and early access to new products.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
