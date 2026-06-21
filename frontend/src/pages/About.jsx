import React from 'react';
import { Sprout, Compass, ShieldAlert, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-cream min-h-screen text-charcoal font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-terracotta uppercase">Our Vision</span>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl text-pine tracking-wide mt-2">
            About Agri-Allied
          </h1>
          <div className="h-1 w-16 bg-terracotta mx-auto mt-4"></div>
        </div>

        {/* Narrative Section */}
        <div className="space-y-8 text-charcoal/90 leading-relaxed text-sm sm:text-base">
          <p className="font-serif text-lg text-pine/90 italic border-l-4 border-terracotta pl-4 py-1">
            "Agri-Allied is designed to bridge the gap between traditional organic knowledge and modern agronomic science for the terraced hills of Uttarakhand."
          </p>

          <p>
            The **Uttarakhand Organic Produce Collective** operates in high-altitude environments, encompassing Almora, Mukteshwar, and Munsyari. Our supervisors monitor crop health across hundreds of small-scale terraced farms. Growing premium organic goods like <strong>Munsyari Rajma (Kidney Beans)</strong>, <strong>Mandua (Finger Millet)</strong>, and <strong>mountain apples</strong> requires precise care due to steep slopes, unpredictable weather, and strict organic certification standards.
          </p>

          <p>
            With the rapid onset of climate fluctuations, supervisors face new pests and crop infections. Sending agricultural extension officers to remote mountain ridges takes days. **Agri-Allied** provides an instant, AI-powered advisory helper available directly in the field.
          </p>
        </div>

        {/* Highlight Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
          <div className="border border-pine/15 p-6 bg-cream-dark/20 relative">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-terracotta"></div>
            <div className="flex items-center space-x-3 mb-3">
              <Sprout className="h-5 w-5 text-terracotta" />
              <h3 className="font-serif font-bold text-lg text-pine">100% Organic Directives</h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal/80">
              Every advisory recommendation is geared toward natural solutions, bio-pesticides (like Dashaparni Ark), and organic compost systems to protect organic certifications.
            </p>
          </div>

          <div className="border border-pine/15 p-6 bg-cream-dark/20 relative">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-terracotta"></div>
            <div className="flex items-center space-x-3 mb-3">
              <Compass className="h-5 w-5 text-terracotta" />
              <h3 className="font-serif font-bold text-lg text-pine">Terraced Topography</h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal/80">
              Unlike flat-land recommendations, our advice accounts for drainage issues, altitude variances, and low-tillage practices suitable for hilly fields.
            </p>
          </div>

          <div className="border border-pine/15 p-6 bg-cream-dark/20 relative">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-terracotta"></div>
            <div className="flex items-center space-x-3 mb-3">
              <ShieldAlert className="h-5 w-5 text-terracotta" />
              <h3 className="font-serif font-bold text-lg text-pine">Supervisor Tooling</h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal/80">
              Built for practical field supervisors. Input symptoms in plain language to generate step-by-step checklists to share with local farm hands.
            </p>
          </div>

          <div className="border border-pine/15 p-6 bg-cream-dark/20 relative">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-terracotta"></div>
            <div className="flex items-center space-x-3 mb-3">
              <Award className="h-5 w-5 text-terracotta" />
              <h3 className="font-serif font-bold text-lg text-pine">Officer Verification</h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal/80">
              AI advice is the first line of defense. The platform reinforces scientific verification by urging users to consult official extension officers before applying critical solutions.
            </p>
          </div>
        </div>

        <div className="text-center border-t border-pine/10 pt-8 mt-8">
          <p className="text-xs text-charcoal/60">
            Agri-Allied is powered by the Google Gemini API with custom system constraints. For administrative inquiries, please contact our Almora main office.
          </p>
        </div>
      </main>
    </div>
  );
}
