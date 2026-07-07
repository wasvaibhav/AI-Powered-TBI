import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, ShieldAlert, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Phone number must have at least 10 digits.');
      return;
    }

    setIsLoading(true);
    try {
      await signup(name, email, phone, password);
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error("Signup error", err);
      setErrorMsg(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Error Alert */}
      {errorMsg && <Toast message={errorMsg} onClose={() => setErrorMsg('')} />}

      <div className="max-w-md w-full border border-pine/15 bg-cream-dark/20 p-8 relative shadow-sm">
        {/* Border accent on top */}
        <div className="absolute left-0 right-0 top-0 h-[4px] bg-terracotta"></div>

        {isLoading && (
          <div className="absolute inset-0 bg-cream/75 z-40 flex items-center justify-center">
            <Loader message="Creating supervisor account..." />
          </div>
        )}

        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 border border-terracotta/20 bg-cream">
              <Sprout className="h-8 w-8 text-terracotta" />
            </div>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-pine tracking-wide">
            Supervisor Register
          </h2>
          <p className="text-xs text-charcoal/70 mt-2 max-w-xs mx-auto">
            Create an authorized account for Almora Organic Collective field operations.
          </p>
        </div>

        <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block font-medium text-charcoal mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                <User className="h-4 w-4" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-pine/20 bg-cream/80 text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta transition-colors duration-200"
                placeholder="Supervisor Name"
              />
            </div>
          </div>

          {/* Email Address */}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-pine/20 bg-cream/80 text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta transition-colors duration-200"
                placeholder="supervisor@agri-allied.org"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block font-medium text-charcoal mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-pine/20 bg-cream/80 text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta transition-colors duration-200"
                placeholder="e.g. 9876543210"
              />
            </div>
          </div>

          {/* Password */}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-pine/20 bg-cream/80 text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-terracotta transition-colors duration-200"
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-pine hover:bg-pine-light text-cream font-medium border border-pine transition-all duration-200 flex items-center justify-center space-x-1"
            >
              <span>Register Supervisor Account</span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-charcoal/60">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-terracotta hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
