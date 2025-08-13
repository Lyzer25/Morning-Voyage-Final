'use client';
import { useState } from 'react';
import type { UserAccount } from '@/lib/types';

interface AccountEditFormProps {
  account: UserAccount;
}

export default function AccountEditForm({ account }: AccountEditFormProps) {
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: account.email,
    displayName: account.profile?.display_name || '',
    role: account.role || 'customer',
    status: account.status || 'active',
    isSubscriber: !!account.subscriber?.is_subscriber,
    subscriptionTier: account.subscriber?.tier || '',
    subscriptionExpires: account.subscriber?.expires_at || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/admin/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

        if (response.ok) {
        setMessage('Account updated successfully');
        setTimeout(() => { window.location.href = '/admin/accounts'; }, 1200);
      } else {
        setError(data.error || 'Failed to update account');
      }
    } catch (err) {
      setError('Failed to update account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Account Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'customer'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'suspended' | 'deleted'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Management</h3>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSubscriber"
                  checked={formData.isSubscriber}
                  onChange={(e) => setFormData({...formData, isSubscriber: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isSubscriber" className="ml-2 block text-sm text-gray-700">
                  Active Subscriber
                </label>
              </div>

              {formData.isSubscriber && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Tier
                    </label>
                    <select
                      value={formData.subscriptionTier}
                      onChange={(e) => setFormData({...formData, subscriptionTier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select tier</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expires On
                    </label>
                    <input
                      type="date"
                      value={formData.subscriptionExpires ? new Date(formData.subscriptionExpires).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({...formData, subscriptionExpires: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Metadata (Read-only) */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Account Created:</span>
                <span className="ml-2 text-gray-600">
                  {account.profile?.created_at ? new Date(account.profile.created_at).toLocaleString() : '—'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Login:</span>
                <span className="ml-2 text-gray-600">
                  {account.profile?.last_login ? new Date(account.profile.last_login).toLocaleString() : '—'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Password Changed:</span>
                <span className="ml-2 text-gray-600">
                  {account.profile?.password_changed_at ? new Date(account.profile.password_changed_at).toLocaleString() : '—'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Account ID:</span>
                <span className="ml-2 text-gray-600 font-mono text-xs">{account.id}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={() => { window.location.href = '/admin/accounts'; }}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>

            <div className="space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
              >
                Reset Password
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

        {/* Messages */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
