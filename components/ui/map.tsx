'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from './button';
import { ExternalLink, Loader2, MapPin, RotateCcw } from 'lucide-react';

interface MapProps {
  address: string;
  height?: string;
}

// Simple 2D Map using Leaflet
const SimpleMap: React.FC<{ address: string; height: string }> = ({
  address,
  height
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Geocode address using Nominatim (OpenStreetMap's free geocoding service)
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // First, try to extract coordinates if they're already in the address
      const coordMatch = address.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (coordMatch) {
        return {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2])
        };
      }

      // Use Nominatim geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Property-Map/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }

      // Fallback to Lagos, Nigeria if geocoding fails
      console.warn('Geocoding failed for address:', address, 'using default location');
      return { lat: 6.5244, lng: 3.3792 }; // Lagos coordinates

    } catch (err) {
      console.error('Geocoding error:', err);
      return { lat: 6.5244, lng: 3.3792 }; // Lagos coordinates
    }
  };

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!address) {
        setError('No address provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Geocode the address
        const coords = await geocodeAddress(address);
        if (!coords) {
          throw new Error('Could not geocode address');
        }

        setCoordinates(coords);

        // Check if we're in browser environment
        if (typeof window === 'undefined') {
          setError('Map not available in server environment');
          setLoading(false);
          return;
        }

        // Dynamically import Leaflet to avoid SSR issues
        const L = await import('leaflet');
        
        // Load Leaflet CSS if not already loaded
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          
          // Wait for CSS to load
          await new Promise((resolve) => {
            link.onload = resolve;
            setTimeout(resolve, 1000); // Fallback timeout
          });
        }

        // Clear any existing map
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
        }

        if (!mapRef.current) {
          setError('Map container not available');
          setLoading(false);
          return;
        }

        // Create the Leaflet map
        const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Create custom marker icon
        const markerIcon = L.divIcon({
          html: `
            <div style="
              background-color: #ef4444;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              position: relative;
            ">
              <div style="
                background-color: white;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              "></div>
            </div>
          `,
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        });

        // Add marker at the property location
        const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon }).addTo(map);
        
        // Add popup with address (truncated if too long)
        const displayAddress = address.length > 50 ? address.substring(0, 50) + '...' : address;
        marker.bindPopup(displayAddress);

        // Store map reference for cleanup
        leafletMapRef.current = map;

        setLoading(false);

      } catch (err) {
        console.error('Error initializing map:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Map failed to load: ${errorMessage}`);
        setLoading(false);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [address, retryCount]);

  const openInGoogleMaps = useCallback(() => {
    if (coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    }
  }, [coordinates, address]);

  const retryMap = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
  }, []);

  if (loading) {
    return (
      <div
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        
        {/* Simple fallback display */}
        <div
          className="w-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border relative overflow-hidden"
          style={{ height }}
        >
          {coordinates ? (
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.01},${coordinates.lat-0.01},${coordinates.lng+0.01},${coordinates.lat+0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Property Location Map"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-medium mb-2">Location Map</h3>
                <p className="text-sm text-gray-600 mb-4">Click below to view this location on Google Maps</p>
                <Button onClick={openInGoogleMaps} variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height }}
      className="rounded-lg overflow-hidden border"
    />
  );
};

const Map: React.FC<MapProps> = ({
  address,
  height = '400px'
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Location</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            window.open(url, '_blank');
          }}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Maps
        </Button>
      </div>

      <SimpleMap address={address} height={height} />
    </div>
  );
};

export default Map;
