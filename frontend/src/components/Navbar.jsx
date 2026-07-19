import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamic nav links based on whether user is logged in
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
  ];

  if (user) {
    navLinks.push(
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Advisory Chat', path: '/chat' }
    );
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-pine text-cream border-b border-terracotta/20 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-cream hover:text-terracotta transition-colors duration-200">
              <Sprout className="h-7 w-7 text-terracotta" />
              <span className="font-serif font-bold text-xl tracking-wide">Agri-Allied</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-200 border-b-2 py-1 ${
                    isActive(link.path)
                      ? 'border-terracotta text-terracotta'
                      : 'border-transparent text-cream/90 hover:text-terracotta hover:border-terracotta/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Profile / Login Block */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-cream/70">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-4 py-2 border border-terracotta bg-terracotta/10 text-cream hover:bg-terracotta hover:border-terracotta-dark transition-all duration-200 font-medium text-sm"
                  id="logout-btn"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-4 py-2 border border-terracotta text-cream hover:bg-terracotta/10 hover:border-terracotta-light transition-all duration-200 font-medium text-sm"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 text-cream/90 hover:text-terracotta hover:bg-pine-light focus:outline-none transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-pine-dark border-t border-terracotta/10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-base font-medium rounded-none transition-colors duration-200 ${
                isActive(link.path)
                  ? 'bg-terracotta/20 text-terracotta border-l-4 border-terracotta pl-2'
                  : 'text-cream/95 hover:bg-pine-light hover:text-terracotta'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Profile / Login */}
          {user ? (
            <div className="border-t border-terracotta/10 pt-2 mt-2 space-y-1">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cream/60">
                Hi, {user.name}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 text-cream font-medium text-base hover:text-terracotta transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 text-terracotta" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 mt-2 border-t border-terracotta/10 text-cream font-medium text-base hover:text-terracotta transition-colors duration-200"
            >
              <User className="h-5 w-5 text-terracotta" />
              <span>Supervisor Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
