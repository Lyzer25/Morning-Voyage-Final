import { getServerSession } from "@/lib/auth";
import { getAllAccounts } from "@/lib/blob-accounts";
import { redirect } from "next/navigation";

// CRITICAL: keep dynamic behavior for admin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    redirect('/account/login');
  }

  try {
    const accounts = await getAllAccounts();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Accounts</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{accounts.length}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Subscribers</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {accounts.filter(a => a.subscriber.is_subscriber).length}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Admin Users</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {accounts.filter(a => a.role === 'admin').length}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">New This Week</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {accounts.filter(a => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(a.profile.created_at) > weekAgo;
              }).length}
            </p>
          </div>
        </div>

        {/* System Health & Dashboard Enhancements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Health */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Authentication System</span>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Blob Storage</span>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Product Catalog</span>
                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
            </div>
          </div>

          {/* Platform Overview */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-sm font-medium text-gray-900">{accounts.filter(a => a.status === 'active').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subscription Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {accounts.length > 0 ? Math.round((accounts.filter(a => a.subscriber?.is_subscriber).length / accounts.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Admin Users</span>
                <span className="text-sm font-medium text-gray-900">{accounts.filter(a => a.role === 'admin').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Accounts (preview) */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Accounts</h3>
            <a href="/admin/accounts" className="text-blue-600 hover:text-blue-700 text-sm">View All →</a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscriber</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {accounts.slice(0, 5).map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{account.profile?.display_name || '—'}</div>
                        <div className="text-xs text-gray-500">{account.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        account.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {account.subscriber?.is_subscriber ? (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {account.subscriber?.tier}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {account.profile?.created_at ? new Date(account.profile.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a 
              href="/admin/accounts"
              className="w-full text-left px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 block transition-colors"
            >
              👥 View All Accounts
            </a>
            <a 
              href="/admin/products"
              className="w-full text-left px-4 py-2 text-sm bg-green-50 hover:bg-green-100 rounded-md text-green-700 block transition-colors"
            >
              📦 Manage Products
            </a>
            <a 
              href="/admin/orders"
              className="w-full text-left px-4 py-2 text-sm bg-orange-50 hover:bg-orange-100 rounded-md text-orange-700 block transition-colors"
            >
              🛍️ View Orders
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Admin page error:', error);
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-red-800 font-bold">Admin Loading Error</h2>
        <p className="text-red-600">Unable to load admin interface. Please refresh the page.</p>
        <p className="text-sm text-red-500 mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
