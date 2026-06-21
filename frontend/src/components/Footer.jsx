import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-pine text-cream/90 border-t border-terracotta/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-cream">
            <Sprout className="h-6 w-6 text-terracotta" />
            <span className="font-serif font-bold text-lg tracking-wide">Agri-Allied</span>
          </div>
          <p className="text-xs sm:text-sm text-cream/70 leading-relaxed max-w-sm">
            Empowering field supervisors and organic farmers in the terraced hills of Uttarakhand, India, with intelligent crop insights.
          </p>
        </div>

        {/* Links Column */}
        <div>
          <h3 className="font-serif font-semibold text-cream text-base mb-4 tracking-wide">Navigation</h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <Link to="/" className="text-cream/70 hover:text-terracotta transition-colors duration-200">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-cream/70 hover:text-terracotta transition-colors duration-200">
                About our Collective
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="text-cream/70 hover:text-terracotta transition-colors duration-200">
                AI Advisory Chat
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-cream/70 hover:text-terracotta transition-colors duration-200">
                Supervisor Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact/Regional Column */}
        <div>
          <h3 className="font-serif font-semibold text-cream text-base mb-4 tracking-wide">Regional Office</h3>
          <ul className="space-y-3 text-xs sm:text-sm text-cream/70">
            <li className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-terracotta mt-0.5 shrink-0" />
              <span>Hill-Terrace Collective HQ, Almora, Uttarakhand, 263601, India</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-terracotta shrink-0" />
              <span>advisory@agri-allied.org</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-terracotta shrink-0" />
              <span>+91 5962 234567</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between text-xs text-cream/50 space-y-4 sm:space-y-0">
        <p>&copy; {new Date().getFullYear()} Agri-Allied Collective. All rights reserved.</p>
        <p className="text-center sm:text-right max-w-md">
          Disclaimer: AI advisory is experimental. Please cross-reference suggestions with a licensed agricultural extension officer before application.
        </p>
      </div>
    </footer>
  );
}
