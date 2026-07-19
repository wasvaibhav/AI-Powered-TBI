import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      // Redirect to Advisory Dashboard page on success
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed", err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Alert */}
      {error && <Toast message={error} onClose={() => setError('')} />}

      <div className="max-w-md w-full border border-pine/15 bg-cream-dark/20 p-8 relative shadow-sm">
        {/* Border accent on top */}
        <div className="absolute left-0 right-0 top-0 h-[4px] bg-terracotta"></div>

        {isLoading && (
          <div className="absolute inset-0 bg-cream/75 z-40 flex items-center justify-center">
            <Loader message="Verifying supervisor credentials..." />
          </div>
        )}

        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 border border-terracotta/20 bg-cream">
              <Sprout className="h-8 w-8 text-terracotta" />
            </div>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-pine tracking-wide">
            Supervisor Login
          </h2>
          <p className="text-xs text-charcoal/70 mt-2 max-w-xs mx-auto">
            Authorized access for Almora Organic Collective field supervisors.
          </p>
        </div>

        <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block font-medium text-charcoal mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
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

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block font-medium text-charcoal mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-pine/20 bg-cream/80 text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta transition-colors duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right text-[11px]">
            <Link to="/forgot-password" className="text-charcoal/50 hover:text-terracotta transition-colors duration-200">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-pine hover:bg-pine-light text-cream font-medium border border-pine transition-all duration-200 flex items-center justify-center space-x-1"
          >
            <span>Access Advisory Panel</span>
          </button>
        </form>

        {/* Google OAuth Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-pine/15" />
          <span className="text-[11px] text-charcoal/40 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-pine/15" />
        </div>

        {/* Google Sign-In Button */}
        <button
          id="google-login-btn"
          type="button"
          onClick={() => { window.location.href = 'http://localhost:5000/api/auth/google'; }}
          className="w-full py-2.5 px-4 border border-pine/20 bg-cream hover:bg-cream-dark/30 text-charcoal text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2.5"
        >
          {/* Google 'G' SVG logo */}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        <div className="mt-6 text-center text-xs text-charcoal/60">
          Not registered yet?{' '}
          <Link to="/signup" className="font-bold text-terracotta hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
