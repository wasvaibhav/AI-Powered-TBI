import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, HelpCircle } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-pine text-cream overflow-hidden py-16 sm:py-24">
      {/* Subtle topographic mountain-contour lines SVG */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]">
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
        >
          {/* Contour Line 1 */}
          <path
            d="M -100 200 C 300 150, 450 350, 800 280 C 1100 220, 1200 450, 1600 350"
            fill="none"
            stroke="#FAF6EF"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {/* Contour Line 2 */}
          <path
            d="M -100 280 C 200 220, 500 430, 900 340 C 1150 280, 1300 500, 1600 420"
            fill="none"
            stroke="#FAF6EF"
            strokeWidth="1.5"
          />
          {/* Contour Line 3 */}
          <path
            d="M -100 380 C 100 300, 550 490, 1000 410 C 1200 350, 1400 550, 1600 500"
            fill="none"
            stroke="#FAF6EF"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />
          {/* Contour Line 4 (Inner mountain ridges) */}
          <path
            d="M -100 480 C 150 400, 600 550, 1100 470 C 1300 420, 1450 590, 1600 550"
            fill="none"
            stroke="#FAF6EF"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Region Tag */}
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest text-terracotta border border-terracotta/40 bg-terracotta/5 mb-6 uppercase">
          Uttarakhand Organic Produce Collective
        </span>

        {/* Headline */}
        <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-cream tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Scientific crop guidance for mountain terraces
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-cream/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          Empowering Uttarakhand field supervisors with prompt advisory for Rajma, Apple Orchards, Mandua, and off-season organic vegetables. Ask questions in plain language, receive practical mountain solutions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-8 py-3 bg-terracotta text-cream font-medium text-sm border border-terracotta hover:bg-terracotta-dark hover:border-terracotta-dark transition-all duration-200 shadow-sm"
          >
            Start Advisory Chat
          </Link>
          <Link
            to="/about"
            className="w-full sm:w-auto px-8 py-3 bg-transparent text-cream border border-cream/35 hover:bg-cream/5 hover:border-cream/60 transition-all duration-200 text-sm font-medium"
          >
            Learn Our Mission
          </Link>
        </div>
      </div>

      {/* Hand-drawn-feeling mountain jagged divider at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
        <svg
          className="relative block w-full h-[30px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {/* Hand-drawn style jagged mountain path */}
          <path
            d="M0,80 L80,105 L160,75 L260,110 L340,85 L440,115 L520,95 L610,118 L700,90 L810,112 L920,80 L1020,110 L1110,88 L1200,105 L1200,120 L0,120 Z"
            fill="#FAF6EF"
          />
        </svg>
      </div>
    </div>
  );
}
