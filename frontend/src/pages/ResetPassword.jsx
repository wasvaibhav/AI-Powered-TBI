import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Sprout, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const API_BASE = 'http://localhost:5000';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Guard: if no token in URL, show error immediately
  const hasToken = Boolean(token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to reset password. Please try again.');
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Strength indicator ── */
  const strength = (() => {
    if (!newPassword) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    const map = [
      { label: 'Weak', color: '#C0392B', width: '25%' },
      { label: 'Fair', color: '#E67E22', width: '50%' },
      { label: 'Good', color: '#F1C40F', width: '75%' },
      { label: 'Strong', color: '#27AE60', width: '100%' },
    ];
    return map[score - 1] || map[0];
  })();

  return (
    <div className="bg-cream min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {error && <Toast message={error} onClose={() => setError('')} />}

      <div className="max-w-md w-full border border-pine/15 bg-cream-dark/20 p-8 relative shadow-sm">
        {/* Top accent bar */}
        <div className="absolute left-0 right-0 top-0 h-[4px] bg-terracotta" />

        {isLoading && (
          <div className="absolute inset-0 bg-cream/75 z-40 flex items-center justify-center">
            <Loader message="Updating password..." />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 border border-terracotta/20 bg-cream">
              <Sprout className="h-8 w-8 text-terracotta" />
            </div>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-pine tracking-wide">
            Reset Password
          </h2>
          <p className="text-xs text-charcoal/70 mt-2 max-w-xs mx-auto">
            Choose a new password for your supervisor account.
          </p>
        </div>

        {/* Invalid token */}
        {!hasToken && (
          <div className="text-center space-y-4">
            <XCircle className="h-10 w-10 text-terracotta mx-auto" />
            <p className="text-sm text-charcoal/70">
              This reset link is invalid or has already been used.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block text-sm font-medium text-terracotta hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        )}

        {/* Success state */}
        {hasToken && success && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-pine mx-auto" />
            <h3 className="font-serif text-lg font-semibold text-pine">Password Updated!</h3>
            <p className="text-sm text-charcoal/70">
              Your password has been reset successfully. Redirecting to login…
            </p>
          </div>
        )}

        {/* Form state */}
        {hasToken && !success && (
          <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block font-medium text-charcoal mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="new-password"
                  name="new_password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-pine/20 bg-cream/80 text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta transition-colors duration-200"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal/40 hover:text-charcoal/70"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-pine/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block font-medium text-charcoal mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-pine/20 bg-cream/80 text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta transition-colors duration-200"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal/40 hover:text-charcoal/70"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] mt-1 text-terracotta">Passwords do not match.</p>
              )}
            </div>

            <button
              id="reset-password-submit"
              type="submit"
              disabled={isLoading || newPassword !== confirmPassword}
              className="w-full py-2.5 px-4 bg-pine hover:bg-pine-light text-cream font-medium border border-pine transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Reset Password
            </button>
          </form>
        )}

        {/* Back to login */}
        {!success && (
          <div className="mt-6 text-center text-xs text-charcoal/60">
            Remembered it?{' '}
            <Link to="/login" className="font-bold text-terracotta hover:underline">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
