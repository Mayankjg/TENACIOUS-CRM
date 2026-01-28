"use client";

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

export default function LeadsMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBwmRbwpmdyOU3giJuIru9Z9waaZZ2oBH4`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    new window.google.maps.Map(mapRef.current, {
      center: { lat: 21.1702, lng: 72.8311 },
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });
  }, [isLoaded]);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header with buttons */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition">
            Display On Map
          </button>

          <span className="bg-red-50 text-red-400 text-sm py-2.5 rounded-sm">
            Please Click Display On Map To View Your Sales Person On Map
          </span>
        </div>
        
        <div className="flex gap-3">
          <button className="bg-cyan-500 text-white px-6 py-2 rounded hover:bg-cyan-600 transition">
            Refresh
          </button>
          <button className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition">
            Show Online Salespersons
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}