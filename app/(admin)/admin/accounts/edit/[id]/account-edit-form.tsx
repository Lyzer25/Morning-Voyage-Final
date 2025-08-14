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

  // Password management UI state
  const [showPasswordActions, setShowPasswordActions] = useState(false);
  const [resetLinkResult, setResetLinkResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [manualOverrideResult, setManualOverrideResult] = useState<{
    success: boolean;
    temporaryPassword?: string;
    message: string;
  } | null>(null);

  // Function to send reset password link
  const handleSendResetLink = async () => {
    if (!confirm("Send a password reset link to this user's email?")) {
      return;
    }

    setIsLoading(true);
    setResetLinkResult(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email })
      });

      const data = await response.json();

      if (response.ok) {
        setResetLinkResult({
          success: true,
          message: "Password reset link sent to user's email successfully."
        });
      } else {
        setResetLinkResult({
          success: false,
          message: data.error || 'Failed to send reset link'
        });
      }
    } catch (err) {
      setResetLinkResult({
        success: false,
        message: 'Failed to send reset link'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function for manual password override
  const handleManualOverride = async () => {
    const customPassword = prompt("Enter new password for user (leave empty to generate secure password):");

    if (customPassword === null) return; // User cancelled

    if (!confirm("Are you sure you want to manually override this user's password? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setManualOverrideResult(null);

    try {
      const response = await fetch(`/api/admin/accounts/${account.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPassword: customPassword || undefined,
          sendEmail: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setManualOverrideResult({
          success: true,
          temporaryPassword: data.temporaryPassword,
          message: 'Password manually overridden successfully. User has been notified by email.'
        });
      } else {
        setManualOverrideResult({
          success: false,
          message: data.error || 'Failed to override password'
        });
      }
    } catch (err) {
      setManualOverrideResult({
        success: false,
        message: 'Failed to override password'
      });
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Password Management */}
          <div className="border-t pt-6">
  <h3 className="text-lg font-medium text-gray-900 mb-4">Password Management</h3>
  
  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h4 className="text-sm font-medium text-blue-800">
          Admin Password Management
        </h4>
        <p className="mt-1 text-sm text-blue-700">
          <strong>Reset Link:</strong> Sends user an email to reset their own password.<br/>
          <strong>Manual Override:</strong> Immediately sets a new password and notifies user.
        </p>
      </div>
    </div>
  </div>
  
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700">Last Password Change</p>
        <p className="text-sm text-gray-500">
          {account.profile.password_changed_at ? new Date(account.profile.password_changed_at).toLocaleString() : '—'}
        </p>
      </div>
      
      {/* Two action buttons side by side */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handleSendResetLink}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        
        <button
          type="button"
          onClick={handleManualOverride}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Overriding...' : 'Manual Override'}
        </button>
      </div>
    </div>
    
    {/* Reset Link Result */}
    {resetLinkResult && (
      <div className={`p-4 rounded-md ${
        resetLinkResult.success 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {resetLinkResult.success ? (
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h4 className={`text-sm font-medium ${
              resetLinkResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {resetLinkResult.success ? 'Reset Link Sent' : 'Failed to Send Link'}
            </h4>
            <p className={`mt-1 text-sm ${
              resetLinkResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {resetLinkResult.message}
            </p>
          </div>
        </div>
      </div>
    )}
    
    {/* Manual Override Result */}
    {manualOverrideResult && (
      <div className={`p-4 rounded-md ${
        manualOverrideResult.success 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {manualOverrideResult.success ? (
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h4 className={`text-sm font-medium ${
              manualOverrideResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {manualOverrideResult.success ? 'Password Override Successful' : 'Password Override Failed'}
            </h4>
            <p className={`mt-1 text-sm ${
              manualOverrideResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {manualOverrideResult.message}
            </p>
            {manualOverrideResult.temporaryPassword && (
              <div className="mt-2">
                <p className="text-sm font-medium text-green-800">New Password:</p>
                <div className="bg-green-100 px-3 py-2 rounded text-sm font-mono border border-green-300 flex items-center justify-between">
                  <code>{manualOverrideResult.temporaryPassword}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(manualOverrideResult.temporaryPassword!)}
                    className="text-green-700 hover:text-green-900 ml-2"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  User has been notified by email. You can share this password for immediate access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
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
