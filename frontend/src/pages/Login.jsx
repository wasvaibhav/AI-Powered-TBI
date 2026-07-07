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

          {/* Hint */}
          <div className="text-right text-[11px] text-charcoal/50">
            Forgot credentials? Contact regional IT.
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
