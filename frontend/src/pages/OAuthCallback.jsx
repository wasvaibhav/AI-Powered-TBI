import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

/**
 * OAuthCallback — handles the redirect from GET /api/auth/google/callback
 *
 * The backend appends ?token=<jwt> to FRONTEND_URL/oauth-callback.
 * This page saves the token, loads the user profile, and forwards to /dashboard.
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthError || !token) {
      setError('Google sign-in failed. Please try again.');
      const timer = setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 2500);
      return () => clearTimeout(timer);
    }

    // Save token + load user profile, then go to dashboard
    loginWithToken(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => {
        setError('Could not verify your account. Please try again.');
        setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 2500);
      });
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="bg-cream min-h-[80vh] flex items-center justify-center px-4 font-sans">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-terracotta font-semibold text-lg">{error}</p>
            <p className="text-charcoal/60 text-sm">Redirecting you back to login…</p>
          </>
        ) : (
          <Loader message="Completing Google sign-in…" />
        )}
      </div>
    </div>
  );
}
