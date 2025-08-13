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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Accounts</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Subscriber</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.slice(0, 10).map(account => (
                      <tr key={account.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm">{account.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            account.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {account.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {account.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {account.subscriber.is_subscriber ? (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {account.subscriber.tier}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(account.profile.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {accounts.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Showing 10 of {accounts.length} accounts</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700">
                  View All Accounts
                </button>
                <button className="w-full text-left px-4 py-2 text-sm bg-green-50 hover:bg-green-100 rounded-md text-green-700">
                  Manage Subscriptions
                </button>
                <button className="w-full text-left px-4 py-2 text-sm bg-purple-50 hover:bg-purple-100 rounded-md text-purple-700">
                  View Orders
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account System</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cart System</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blob Storage</span>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>
            </div>
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
