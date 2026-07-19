import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Sprout, ArrowLeft, CheckCircle } from 'lucide-react';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const API_BASE = 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong. Please try again.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {error && <Toast message={error} onClose={() => setError('')} />}

      <div className="max-w-md w-full border border-pine/15 bg-cream-dark/20 p-8 relative shadow-sm">
        {/* Top accent bar */}
        <div className="absolute left-0 right-0 top-0 h-[4px] bg-terracotta" />

        {isLoading && (
          <div className="absolute inset-0 bg-cream/75 z-40 flex items-center justify-center">
            <Loader message="Sending reset link..." />
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
            Forgot Password
          </h2>
          <p className="text-xs text-charcoal/70 mt-2 max-w-xs mx-auto">
            Enter your supervisor email and we'll send you a secure reset link.
          </p>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-pine" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-pine">Check your inbox</h3>
            <p className="text-sm text-charcoal/70">
              If <span className="font-medium text-charcoal">{email}</span> is registered, a
              password reset link has been sent. The link expires in{' '}
              <span className="font-medium">30 minutes</span>.
            </p>
            <p className="text-xs text-charcoal/50 mt-1">
              Didn't receive it? Check your spam folder or{' '}
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-terracotta hover:underline font-medium"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          /* ── Form state ── */
          <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="forgot-email" className="block font-medium text-charcoal mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-pine/20 bg-cream/80 text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta transition-colors duration-200"
                  placeholder="supervisor@agriallied.org"
                />
              </div>
            </div>

            <button
              id="forgot-password-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-pine hover:bg-pine-light text-cream font-medium border border-pine transition-all duration-200 flex items-center justify-center"
            >
              Send Reset Link
            </button>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-terracotta transition-colors duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
