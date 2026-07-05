import React, { useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function Toast({ message, onClose, duration = 6000 }) {
  useEffect(() => {
    if (duration > 0 && onClose && message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-cream border-l-4 border-terracotta shadow-xl p-4 flex items-start space-x-3 transition-all duration-300 transform translate-y-0"
      id="error-state"
    >
      <div className="p-1 bg-terracotta/10 text-terracotta shrink-0">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <div className="flex-grow">
        <h4 className="font-serif font-bold text-sm text-pine">Operation Failed</h4>
        <p className="text-xs text-charcoal/80 mt-1 leading-relaxed">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-charcoal/40 hover:text-terracotta transition-colors duration-200 shrink-0"
        aria-label="Close error toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
