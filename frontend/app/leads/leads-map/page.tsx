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
      <div className="bg-white mt-3 border-b px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <button className="w-full sm:w-auto bg-gray-800 text-white px-4 sm:px-6 py-2 rounded hover:bg-gray-700 transition text-sm sm:text-base whitespace-nowrap">
              Display On Map
            </button>

            <span className="w-full sm:w-auto bg-red-50 text-red-400 text-xs px-2 py-2.5 rounded-sm">
              Please Click <span className="font-semibold">Display On Map</span> To View Your Sales Person On Map
            </span>
          </div>
        
          <div className="flex gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none bg-cyan-500 text-white px-4 sm:px-6 py-2 rounded hover:bg-cyan-600 transition text-sm sm:text-base whitespace-nowrap">
              Refresh
            </button>
            <button className="flex-1 lg:flex-none bg-pink-500 text-white px-4 sm:px-6 py-2 rounded hover:bg-pink-600 transition text-sm sm:text-base whitespace-nowrap">
              Show Online Salespersons
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}