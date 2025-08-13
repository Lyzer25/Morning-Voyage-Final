'use client';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Check if already logged in on page load
  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session-check');
        if (response.ok) {
          const data = await response.json();
          if (data.session) {
            // Already logged in, redirect based on role
            const redirectPath = data.role === 'admin' ? '/admin' : '/account';
            // Use full navigation so server components pick up cookie/server session
            window.location.href = redirectPath;
            return;
          }
        }
      } catch {
        // Ignore errors, show login page
      } finally {
        if (mounted) setCheckingSession(false);
      }
    };
    
    checkSession();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      if (showResetPassword) {
        // Password reset request
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        setMessage(data.message);
        
        // For testing - show reset link
        if (data.resetLink) {
          setMessage(`${data.message}\n\nReset link (for testing): ${data.resetLink}`);
        }
        
      } else {
        // Login or Signup
        const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
        const body = isSignup 
          ? { email, password, displayName }
          : { email, password };
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setMessage(data.message);

          // Redirect based on role (use session-check endpoint)
          try {
            const checkResponse = await fetch('/api/auth/session-check');
            if (checkResponse.ok) {
              const sessionData = await checkResponse.json();
              const redirectPath = sessionData.role === 'admin' ? '/admin' : '/account';
              // Use full navigation so server components pick up cookie/server session
              window.location.href = redirectPath;
              return;
            }
          } catch {
            // fallback
          }

          // Fallback if session-check fails
          window.location.href = '/account';
        } else {
          setError(data.error);
        }
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setMessage('');
    setShowResetPassword(false);
    setIsSignup(false);
  };
  
  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {showResetPassword ? 'Reset Password' : (isSignup ? 'Create Account' : 'Sign In')}
          </h2>
          <p className="mt-2 text-gray-600">Welcome to Morning Voyage</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignup && !showResetPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {!showResetPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? "Create a strong password (8+ chars, uppercase, lowercase, number)" : "Enter your password"}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {isSignup && (
                <p className="mt-1 text-xs text-gray-600">
                  Password must contain: 8+ characters, uppercase, lowercase, and a number
                </p>
              )}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition duration-200"
          >
            {isLoading ? 'Please wait...' : (
              showResetPassword ? 'Send Reset Link' : (isSignup ? 'Create Account' : 'Sign In')
            )}
          </button>
        </form>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md whitespace-pre-line">
            {message}
          </div>
        )}
        
        <div className="text-center space-y-2">
          {!showResetPassword ? (
            <>
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
              
              {!isSignup && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-blue-600 hover:text-blue-500 text-sm"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={resetForm}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
