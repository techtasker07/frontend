"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crop, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { suggestCropBox, convertCropToCropperCoords, loadOpenCV, applyPerspectiveCorrection, getCropperCorners, CropBox } from '@/lib/opencv-utils';

interface SmartCropperProps {
  src: string;
  initialBox?: CropBox;
  onCrop: (blob: Blob) => void;
  onCancel?: () => void;
  className?: string;
}

export function SmartCropper({ src, initialBox, onCrop, onCancel, className = '' }: SmartCropperProps) {
  const cropperRef = useRef<CropperRef>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  const [opencvLoaded, setOpencvLoaded] = useState(false);

  // Load OpenCV on mount
  useEffect(() => {
    loadOpenCV().then(() => {
      setOpencvLoaded(true);
    }).catch(console.error);
  }, []);

  // Auto-detect crop area when image loads
  const handleCropperReady = useCallback(async () => {
    if (!opencvLoaded || hasAutoDetected || !cropperRef.current) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const suggestedBox = await suggestCropBox(img);

      if (suggestedBox && cropperRef.current) {
        // Set crop box data directly
        cropperRef.current.setCoordinates({
          left: suggestedBox.x,
          top: suggestedBox.y,
          width: suggestedBox.width,
          height: suggestedBox.height
        });
        setHasAutoDetected(true);
      }
    } catch (error) {
      console.error('Auto-detection failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [src, opencvLoaded, hasAutoDetected]);

  const handleSaveCrop = useCallback(() => {
    if (!cropperRef.current) return;

    const canvas = cropperRef.current.getCanvas();
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob);
        }
      }, 'image/jpeg', 0.85); // Good quality for uploads
    }
  }, [onCrop]);

  const handleReset = useCallback(() => {
    if (cropperRef.current) {
      cropperRef.current.reset();
      setHasAutoDetected(false);
    }
  }, []);

  // Simplified zoom - let the cropper handle it natively
  const handleZoomIn = useCallback(() => {
    // Zoom functionality handled by cropper's built-in controls
  }, []);

  const handleZoomOut = useCallback(() => {
    // Zoom functionality handled by cropper's built-in controls
  }, []);

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="relative bg-black rounded-lg overflow-hidden">
        {/* Status indicator */}
        <div className="absolute top-4 left-4 z-10">
          {isProcessing && (
            <Badge variant="secondary" className="bg-blue-500/90 text-white">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Detecting subject...
            </Badge>
          )}
          {hasAutoDetected && !isProcessing && (
            <Badge variant="secondary" className="bg-green-500/90 text-white">
              <Check className="w-3 h-3 mr-1" />
              Auto-detected
            </Badge>
          )}
        </div>

        {/* Zoom controls - using cropper's built-in functionality */}

        {/* Cropper */}
        <Cropper
          ref={cropperRef}
          src={src}
          className="w-full h-96"
          stencilProps={{
            aspectRatio: undefined, // Free form
            movable: true,
            resizable: true,
            handlers: {
              eastNorth: true,
              north: true,
              westNorth: true,
              west: true,
              westSouth: true,
              south: true,
              eastSouth: true,
              east: true,
            }, // Enable all corner and edge handlers
            lines: {
              east: true,
              north: true,
              west: true,
              south: true,
            },
            overlayClassName: 'cropper-overlay'
          }}
          backgroundProps={{
            className: 'cropper-background'
          }}
          onReady={handleCropperReady}
          // Enable polygon/quadrilateral cropping like Google Lens
          stencilComponent="polygon"
        />

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>

            <Button
              onClick={handleSaveCrop}
              className="bg-white text-black hover:bg-gray-100"
            >
              <Crop className="w-4 h-4 mr-2" />
              Save Crop
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Drag corners to adjust the crop area. Use zoom controls for precision.</p>
        {hasAutoDetected && (
          <p className="text-green-600 mt-1">✨ Subject automatically detected - adjust as needed</p>
        )}
      </div>
    </div>
  );
}