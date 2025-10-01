'use client';

import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, useLoadScript } from '@react-google-maps/api';
import { Button } from './button';
import { ExternalLink, Loader2 } from 'lucide-react';

interface MapProps {
  address: string;
  height?: string;
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const MapComponent: React.FC<{ address: string; height: string; zoom: number }> = ({
  address,
  height,
  zoom
}) => {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!address) {
        setError('No address provided');
        setLoading(false);
        return;
      }

      try {
        // For demo purposes, use a default location if geocoding fails
        // In production, you would use the Google Geocoding API
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const location = results[0].geometry.location;
            setCoordinates({
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            // Fallback to a default location (Lagos, Nigeria as example)
            console.warn('Geocoding failed, using default location');
            setCoordinates({ lat: 6.5244, lng: 3.3792 }); // Lagos coordinates
          }
          setLoading(false);
        });
      } catch (err) {
        console.error('Geocoding error:', err);
        setCoordinates({ lat: 6.5244, lng: 3.3792 }); // Lagos coordinates
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address]);

  const openInGoogleMaps = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      // Fallback to search by address
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    }
  };

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

  if (error || !coordinates) {
    return (
      <div
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        <div className="text-center">
          <p>Unable to load map for this location</p>
          <Button
            variant="outline"
            size="sm"
            onClick={openInGoogleMaps}
            className="mt-2 flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Google Maps
          </Button>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ ...containerStyle, height }}
      center={coordinates}
      zoom={zoom}
    >
      <Marker
        position={coordinates}
        title={address}
      />
    </GoogleMap>
  );
};

const Map: React.FC<MapProps> = ({
  address,
  height = '400px',
  zoom = 15
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        className="w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        <div className="text-center">
          <p>Google Maps API key not configured</p>
          <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </div>
    );
  }

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

      <LoadScript googleMapsApiKey={apiKey}>
        <MapComponent address={address} height={height} zoom={zoom} />
      </LoadScript>
    </div>
  );
};

export default Map;