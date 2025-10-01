'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from './button';
import { ExternalLink, Loader2 } from 'lucide-react';

// Dynamic import for Cesium to avoid bundling in main bundle
let Cesium: any = null;

interface MapProps {
  address: string;
  height?: string;
}

const Cesium3DMap: React.FC<{ address: string; height: string }> = ({
  address,
  height
}) => {
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
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
        // Simple geocoding using a free service or fallback
        // For production, you might want to use a proper geocoding service
        // For now, we'll use a simple approach or fallback coordinates

        // Try to extract coordinates from address if they exist
        const coordMatch = address.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (coordMatch) {
          setCoordinates({
            lat: parseFloat(coordMatch[1]),
            lng: parseFloat(coordMatch[2])
          });
        } else {
          // Fallback to Lagos, Nigeria coordinates for demo
          console.warn('Could not parse coordinates from address, using default location');
          setCoordinates({ lat: 6.5244, lng: 3.3792 });
        }
      } catch (err) {
        console.error('Geocoding error:', err);
        setCoordinates({ lat: 6.5244, lng: 3.3792 }); // Lagos coordinates
      }
      setLoading(false);
    };

    geocodeAddress();
  }, [address]);

  useEffect(() => {
    if (!coordinates || !cesiumContainerRef.current || loading) return;

    const initializeViewer = async () => {
      try {
        // Dynamically import CesiumJS
        if (!Cesium) {
          Cesium = await import('cesium');
          // Set the access token after importing
          Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYmY1MTczYy1jN2IxLTQzOWEtYmM1ZC03OTZjOGZhMmYwMzIiLCJpZCI6MzQ2NDEyLCJpYXQiOjE3NTkzNDgzMzJ9.AtgkBF3QFYfTTEp1YYLhPDxKCLSPVpEvHrf5Y0Pe0YU';

          // Dynamically import Cesium CSS
          if (typeof document !== 'undefined') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.115/Build/Cesium/Widgets/widgets.css';
            document.head.appendChild(link);
          }
        }

        // Initialize Cesium Viewer
        const viewer = new Cesium.Viewer(cesiumContainerRef.current!, {
          terrainProvider: await Cesium.createWorldTerrainAsync(),
          baseLayerPicker: false,
          geocoder: false,
          homeButton: true,
          sceneModePicker: true,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          creditContainer: document.createElement('div') // Hide credits
        });

        // Set OpenStreetMap imagery provider
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(
          new Cesium.OpenStreetMapImageryProvider({
            url: 'https://a.tile.openstreetmap.org/'
          })
        );

        // Set the camera to the property location
        const destination = Cesium.Cartesian3.fromDegrees(
          coordinates.lng,
          coordinates.lat,
          1000 // Height in meters
        );

        viewer.camera.setView({
          destination: destination
        });

        // Add a marker (billboard) at the property location
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(coordinates.lng, coordinates.lat),
          billboard: {
            image: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
                <circle cx="16" cy="16" r="6" fill="#ffffff"/>
              </svg>
            `),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: address,
            font: '12pt sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -32)
          }
        });

        viewerRef.current = viewer;
      } catch (err) {
        console.error('Error initializing Cesium viewer:', err);
        setError('Failed to initialize 3D map');
      }
    };

    initializeViewer();

    // Cleanup function
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, [coordinates, loading, address]);

  const openInGoogleMaps = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    } else {
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
          <span>Loading 3D map...</span>
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
          <p>Unable to load 3D map for this location</p>
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
    <div
      ref={cesiumContainerRef}
      style={{ width: '100%', height }}
      className="rounded-lg overflow-hidden"
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

      <Cesium3DMap address={address} height={height} />
    </div>
  );
};

export default Map;