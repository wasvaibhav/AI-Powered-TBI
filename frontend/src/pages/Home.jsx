import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Card from '../components/Card';
import { ShieldAlert, Bug, Leaf, CloudSun, PackageOpen, Sprout } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const handleCardAction = () => {
    navigate('/dashboard');
  };

  // Grid 1: Diagnostic & Advisory Categories
  const services = [
    {
      title: 'Pest & Insect Management',
      description: 'Identify and combat persistent mountain pests like Codling Moth in apple orchards or aphids on off-season cabbage using organic neem solutions and bio-pesticides.',
      icon: Bug,
      actionText: 'Get Pest Advice',
    },
    {
      title: 'Crop Disease Diagnostics',
      description: 'Find organic control measures for early blight in tomatoes, root rot in kidney beans (Rajma), and apple scab, tailored for wet high-altitude climates.',
      icon: ShieldAlert,
      actionText: 'Diagnose Disease',
    },
    {
      title: 'Organic Soil Health',
      description: 'Enhance terraced soil fertility with native composting, Jeevamrutham application, and green manuring suitable for steep mountain slopes.',
      icon: Leaf,
      actionText: 'Explore Soil Tips',
    },
  ];

  // Grid 2: Uttarakhand Focus Crop Advisories
  const cropFocus = [
    {
      title: 'Munsyari Rajma (Kidney Beans)',
      description: 'Guidance on crop spacing, climbing support, and handling heavy mountain rains to optimize local Rajma harvest quality.',
      icon: Sprout,
      actionText: 'Ask about Rajma',
    },
    {
      title: 'Apple Orchard Care',
      description: 'Pruning schedules, winter chilling calculations, and organic sprays to maintain healthy trees in Ramgarh and Mukteshwar regions.',
      icon: CloudSun,
      actionText: 'Query Orchard Care',
    },
    {
      title: 'Post-Harvest Handling & Storage',
      description: 'Techniques for grain drying, sorting, and moisture-controlled packaging of Mandua (Finger Millet) to prevent storage molds.',
      icon: PackageOpen,
      actionText: 'See Storage Guide',
    },
  ];

  return (
    <div className="bg-cream min-h-screen text-charcoal flex flex-col font-sans">
      <main className="flex-grow">
        {/* Hero Banner */}
        <Hero />

        {/* Section 1: Core Advisory Services */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-pine tracking-wide mb-4">
              Real-time Advisory Categories
            </h2>
            <div className="h-1 w-20 bg-terracotta mx-auto mb-6"></div>
            <p className="text-sm sm:text-base text-charcoal/80">
              Select an option below to enter the advisor interface. Our chatbot provides detailed steps using natural crop inputs and traditional organic remedies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
                actionText={service.actionText}
                onAction={handleCardAction}
              />
            ))}
          </div>
        </section>

        {/* Mid-Page Highlight Callout */}
        <section className="bg-pine-dark text-cream py-12 px-6 border-y border-terracotta/20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <p className="font-serif text-lg sm:text-xl italic leading-relaxed">
              "Traditional wisdom meets crop science. Our goal is to maintain the purity of Uttarakhand's organic heritage while boosting crop yields in our terraced mountain fields."
            </p>
            <span className="block mt-3 text-xs sm:text-sm font-semibold tracking-wider text-terracotta uppercase">
              — Almora Organic Cooperative Association
            </span>
          </div>
          {/* Subtle background ring decoration */}
          <div className="absolute top-1/2 left-10 w-64 h-64 border border-cream/5 rounded-full -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-1/2 right-10 w-96 h-96 border border-cream/5 rounded-full -translate-y-1/2 pointer-events-none"></div>
        </section>

        {/* Section 2: Regional Hill Crops Grid (Card used second time) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-pine tracking-wide mb-4">
               Uttarakhand Specialty Focus
            </h2>
            <div className="h-1 w-20 bg-terracotta mx-auto mb-6"></div>
            <p className="text-sm sm:text-base text-charcoal/80">
              Get targeted consultations specifically calibrated for unique mountain conditions, altitude variations, and organic standards of the local cooperative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cropFocus.map((crop, index) => (
              <Card
                key={index}
                title={crop.title}
                description={crop.description}
                icon={crop.icon}
                actionText={crop.actionText}
                onAction={handleCardAction}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
