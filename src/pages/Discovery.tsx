import React from 'react';
import HyperlocalDiscovery from '@/components/HyperlocalDiscovery';
import { useLanguage } from '@/contexts/LanguageContext';

const Discovery = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Discover Nearby Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the best barbers, salons, and beauty clinics near you with real-time availability
          </p>
        </div>
        
        <HyperlocalDiscovery />
      </div>
    </div>
  );
};

export default Discovery;