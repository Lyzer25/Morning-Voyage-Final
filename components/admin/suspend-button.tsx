'use client';
import { useState } from 'react';

export default function SuspendButton({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const newStatus = status === 'suspended' ? 'active' : 'suspended';
    if (!confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this account?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Failed to update account: ${data.error || res.statusText}`);
        setLoading(false);
        return;
      }

      // Refresh the page to reflect changes
      window.location.reload();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Suspend toggle failed', err);
      alert('Failed to update account status');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-sm ${status === 'suspended' ? 'text-green-700' : 'text-red-600'} hover:underline`}
    >
      {loading ? (status === 'suspended' ? 'Activating...' : 'Suspending...') : (status === 'suspended' ? 'Activate' : 'Suspend')}
    </button>
  );
}
