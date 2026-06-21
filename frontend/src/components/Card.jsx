import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Card({ title, description, icon: Icon, actionText, onAction }) {
  return (
    <div className="bg-cream-dark/30 border border-pine/15 relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 hover:border-pine/30 transition-all duration-300 group">
      {/* Asymmetric solid accent edge on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-terracotta transition-all duration-300 group-hover:w-[6px]"></div>
      
      <div>
        {/* Icon container */}
        {Icon && (
          <div className="text-terracotta mb-4 flex items-center justify-start">
            <div className="p-2 border border-terracotta/20 bg-cream/50">
              <Icon className="h-6 w-6 stroke-[1.5]" />
            </div>
          </div>
        )}
        
        {/* Content */}
        <h3 className="font-serif font-bold text-xl text-charcoal tracking-wide mb-2">
          {title}
        </h3>
        <p className="font-sans text-charcoal/80 text-sm leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Optional action */}
      {actionText && (
        <div className="mt-auto pt-2">
          <button
            onClick={onAction}
            className="flex items-center space-x-2 text-sm font-semibold text-pine hover:text-terracotta transition-colors duration-200"
          >
            <span>{actionText}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  );
}
