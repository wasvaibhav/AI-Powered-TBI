import React from 'react';
import { Sprout } from 'lucide-react';

export default function Loader({ message = "Consulting agricultural database..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4" id="loading-state">
      <div className="relative flex items-center justify-center">
        {/* Pulsing background ring */}
        <div className="absolute h-14 w-14 rounded-full border-4 border-terracotta/20 animate-ping"></div>
        {/* Sprout base container */}
        <div className="p-4 bg-cream border border-pine/20 rounded-full text-pine shadow-md relative z-10">
          <Sprout className="h-6 w-6 text-terracotta animate-bounce" />
        </div>
      </div>
      <p className="text-xs font-semibold text-charcoal/60 animate-pulse uppercase tracking-wider">
        {message}
      </p>
    </div>
  );
}
