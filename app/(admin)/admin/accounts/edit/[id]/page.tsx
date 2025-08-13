import { getServerSession } from "@/lib/auth";
import { getUserById } from "@/lib/blob-accounts";
import { redirect, notFound } from "next/navigation";
import AccountEditForm from "./account-edit-form";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function EditAccountPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    redirect('/account/login');
  }

  const account = await getUserById(params.id);
  if (!account) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <a href="/admin/accounts" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Accounts
            </a>
            <h1 className="text-2xl font-bold text-gray-900">Edit Account</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* @ts-ignore server -> client prop passing */}
        <AccountEditForm account={account} />
      </div>
    </div>
  );
}
