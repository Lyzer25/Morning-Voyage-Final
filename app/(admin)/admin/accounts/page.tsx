import { getServerSession } from "@/lib/auth";
import { getAllAccounts } from "@/lib/blob-accounts";
import { redirect } from "next/navigation";
import AccountManagerWithSearch from "./account-manager-with-search";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  const session = await getServerSession();
  if (!session || session.role !== "admin") {
    redirect("/account/login");
  }

  let accounts = [];
  try {
    accounts = await getAllAccounts();
  } catch (err) {
    console.error("Failed to load accounts for admin accounts page", err);
    accounts = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Dashboard
              </a>
              <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
            </div>
            <div className="text-sm text-gray-600">
              {accounts.length} total accounts
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <AccountManagerWithSearch accounts={accounts} />
      </div>
    </div>
  );
}
