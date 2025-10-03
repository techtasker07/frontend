/**
 * Advanced Image Processing Utilities
 * Provides camera capture, auto-detection, quadrilateral cropping, 
 * perspective transform, and on-device compression features
 */

import imageCompression from 'browser-image-compression';

// Types for our advanced image processing
export interface Point {
  x: number;
  y: number;
}

export interface DetectedSubject {
  bounds: Point[];
  confidence: number;
  type: 'building' | 'facade' | 'document' | 'object';
}

export interface CropResult {
  croppedImageBlob: Blob;
  transformedImageBlob: Blob;
  originalBounds: Point[];
  correctedBounds: Point[];
}

// OpenCV.js interface (will be loaded dynamically)
declare global {
  interface Window {
    cv: any;
  }
}

/**
 * Load OpenCV.js dynamically
 */
export async function loadOpenCV(): Promise<boolean> {
  if (window.cv && window.cv.imread) {
    return true;
  }

  return new Promise((resolve) => {
    // Check if already loading
    if (document.querySelector('script[src*="opencv"]')) {
      // Wait for existing script to load
      const checkInterval = setInterval(() => {
        if (window.cv && window.cv.imread) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.5.2/opencv.js';
    script.async = true;
    
    script.onload = () => {
      // OpenCV.js needs time to initialize
      const checkReady = () => {
        if (window.cv && window.cv.imread) {
          console.log('OpenCV.js loaded successfully');
          resolve(true);
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    };

    script.onerror = () => {
      console.warn('Failed to load OpenCV.js, falling back to canvas-based transforms');
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/**
 * Capture image from camera with enhanced settings
 */
export async function captureFromCamera(options: {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  aspectRatio?: number;
} = {}): Promise<MediaStream> {
  const constraints = {
    video: {
      facingMode: options.facingMode || 'environment',
      width: { ideal: options.width || 1920 },
      height: { ideal: options.height || 1080 },
      aspectRatio: options.aspectRatio || 16/9,
      // Enhanced camera settings
      focusMode: 'continuous',
      whiteBalanceMode: 'continuous',
      exposureMode: 'continuous',
    }
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    // Fallback to basic constraints
    console.warn('Advanced camera constraints failed, falling back to basic', error);
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: options.facingMode || 'environment' }
    });
  }
}

/**
 * Auto-detect main subject in image (building facades, documents, etc.)
 */
export async function autoDetectSubject(imageElement: HTMLImageElement): Promise<DetectedSubject | null> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);

  try {
    // Try OpenCV-based detection first
    if (window.cv && window.cv.imread) {
      return await detectSubjectWithOpenCV(canvas);
    } else {
      // Fallback to canvas-based edge detection
      return await detectSubjectWithCanvas(canvas);
    }
  } catch (error) {
    console.warn('Subject detection failed:', error);
    return null;
  }
}

/**
 * OpenCV-based subject detection
 */
async function detectSubjectWithOpenCV(canvas: HTMLCanvasElement): Promise<DetectedSubject | null> {
  const cv = window.cv;
  
  try {
    // Convert canvas to OpenCV mat
    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const hierarchy = new cv.Mat();
    const contours = new cv.MatVector();

    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur to reduce noise
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    // Edge detection
    cv.Canny(blurred, edges, 50, 150);

    // Find contours
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let bestContour = null;
    let maxArea = 0;

    // Find the largest rectangular contour
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      
      // Skip small contours
      if (area < canvas.width * canvas.height * 0.1) continue;

      // Approximate contour to polygon
      const epsilon = 0.02 * cv.arcLength(contour, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(contour, approx, epsilon, true);

      // Look for quadrilateral (4 corners)
      if (approx.rows === 4 && area > maxArea) {
        maxArea = area;
        bestContour = approx.clone();
      }

      approx.delete();
      contour.delete();
    }

    // Clean up
    src.delete();
    gray.delete();
    blurred.delete();
    edges.delete();
    hierarchy.delete();
    contours.delete();

    if (bestContour) {
      // Extract corner points
      const bounds: Point[] = [];
      for (let i = 0; i < 4; i++) {
        const point = bestContour.data32S.slice(i * 2, i * 2 + 2);
        bounds.push({ x: point[0], y: point[1] });
      }

      bestContour.delete();

      // Calculate confidence based on area ratio
      const confidence = Math.min(maxArea / (canvas.width * canvas.height), 1.0);

      return {
        bounds: orderPoints(bounds),
        confidence,
        type: 'building'
      };
    }

    return null;
  } catch (error) {
    console.error('OpenCV detection error:', error);
    return null;
  }
}

/**
 * Canvas-based edge detection fallback
 */
async function detectSubjectWithCanvas(canvas: HTMLCanvasElement): Promise<DetectedSubject | null> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Simple edge detection using Sobel operator
  const edges = new Uint8ClampedArray(data.length);
  
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = (y * canvas.width + x) * 4;
      
      // Calculate gradients
      const gx = (-1 * getGray(data, (y-1)*canvas.width + x-1) + 
                   1 * getGray(data, (y-1)*canvas.width + x+1) +
                  -2 * getGray(data, y*canvas.width + x-1) + 
                   2 * getGray(data, y*canvas.width + x+1) +
                  -1 * getGray(data, (y+1)*canvas.width + x-1) + 
                   1 * getGray(data, (y+1)*canvas.width + x+1));
      
      const gy = (-1 * getGray(data, (y-1)*canvas.width + x-1) + 
                  -2 * getGray(data, (y-1)*canvas.width + x) +
                  -1 * getGray(data, (y-1)*canvas.width + x+1) +
                   1 * getGray(data, (y+1)*canvas.width + x-1) + 
                   2 * getGray(data, (y+1)*canvas.width + x) +
                   1 * getGray(data, (y+1)*canvas.width + x+1));
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const value = magnitude > 128 ? 255 : 0;
      
      edges[idx] = value;     // R
      edges[idx + 1] = value; // G  
      edges[idx + 2] = value; // B
      edges[idx + 3] = 255;   // A
    }
  }

  // For canvas fallback, provide a default rectangular detection
  // This is a simplified approach - in production, you might want more sophisticated detection
  const margin = Math.min(canvas.width, canvas.height) * 0.1;
  const bounds: Point[] = [
    { x: margin, y: margin },
    { x: canvas.width - margin, y: margin },
    { x: canvas.width - margin, y: canvas.height - margin },
    { x: margin, y: canvas.height - margin }
  ];

  return {
    bounds,
    confidence: 0.6, // Moderate confidence for fallback
    type: 'building'
  };
}

/**
 * Get grayscale value from RGBA data
 */
function getGray(data: Uint8ClampedArray, idx: number): number {
  const pixelIdx = idx * 4;
  return (data[pixelIdx] + data[pixelIdx + 1] + data[pixelIdx + 2]) / 3;
}

/**
 * Order points in clockwise order: top-left, top-right, bottom-right, bottom-left
 */
export function orderPoints(points: Point[]): Point[] {
  if (points.length !== 4) return points;

  // Sort by y-coordinate
  const sorted = [...points].sort((a, b) => a.y - b.y);
  
  // Get top two points and bottom two points
  const topTwo = sorted.slice(0, 2);
  const bottomTwo = sorted.slice(2, 4);
  
  // Sort top points by x-coordinate (left to right)
  const topLeft = topTwo.reduce((a, b) => a.x < b.x ? a : b);
  const topRight = topTwo.reduce((a, b) => a.x > b.x ? a : b);
  
  // Sort bottom points by x-coordinate (left to right)  
  const bottomLeft = bottomTwo.reduce((a, b) => a.x < b.x ? a : b);
  const bottomRight = bottomTwo.reduce((a, b) => a.x > b.x ? a : b);
  
  return [topLeft, topRight, bottomRight, bottomLeft];
}

/**
 * Apply perspective transform to straighten the cropped area
 */
export async function applyPerspectiveTransform(
  canvas: HTMLCanvasElement,
  sourcePoints: Point[],
  targetWidth: number = 800,
  targetHeight: number = 600
): Promise<Blob> {
  if (window.cv && window.cv.imread) {
    return await perspectiveTransformOpenCV(canvas, sourcePoints, targetWidth, targetHeight);
  } else {
    return await perspectiveTransformCanvas(canvas, sourcePoints, targetWidth, targetHeight);
  }
}

/**
 * OpenCV-based perspective transform
 */
async function perspectiveTransformOpenCV(
  canvas: HTMLCanvasElement,
  sourcePoints: Point[],
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  const cv = window.cv;
  
  try {
    const src = cv.imread(canvas);
    const dst = new cv.Mat();
    
    // Define source points (the quadrilateral)
    const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, 
      sourcePoints.flatMap(p => [p.x, p.y])
    );
    
    // Define destination points (rectangle)
    const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0, 0,                    // top-left
      targetWidth, 0,          // top-right  
      targetWidth, targetHeight, // bottom-right
      0, targetHeight          // bottom-left
    ]);
    
    // Calculate perspective transform matrix
    const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
    
    // Apply transform
    cv.warpPerspective(src, dst, M, new cv.Size(targetWidth, targetHeight));
    
    // Convert back to canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;
    cv.imshow(outputCanvas, dst);
    
    // Clean up
    src.delete();
    dst.delete();
    srcPoints.delete();
    dstPoints.delete();
    M.delete();
    
    return new Promise(resolve => {
      outputCanvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.9);
    });
    
  } catch (error) {
    console.error('OpenCV perspective transform error:', error);
    // Fallback to canvas method
    return perspectiveTransformCanvas(canvas, sourcePoints, targetWidth, targetHeight);
  }
}

/**
 * Canvas-based perspective transform (simplified)
 */
async function perspectiveTransformCanvas(
  canvas: HTMLCanvasElement,
  sourcePoints: Point[],
  targetWidth: number,
  targetHeight: number  
): Promise<Blob> {
  const outputCanvas = document.createElement('canvas');
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  outputCanvas.width = targetWidth;
  outputCanvas.height = targetHeight;
  
  // For canvas fallback, we'll do a simple crop and scale
  // This is not a true perspective transform but provides basic functionality
  const orderedPoints = orderPoints(sourcePoints);
  const [topLeft, topRight, bottomRight, bottomLeft] = orderedPoints;
  
  // Calculate bounding box
  const minX = Math.min(...orderedPoints.map(p => p.x));
  const minY = Math.min(...orderedPoints.map(p => p.y));
  const maxX = Math.max(...orderedPoints.map(p => p.x));
  const maxY = Math.max(...orderedPoints.map(p => p.y));
  
  const sourceWidth = maxX - minX;
  const sourceHeight = maxY - minY;
  
  // Draw the cropped and scaled image
  ctx.drawImage(
    canvas,
    minX, minY, sourceWidth, sourceHeight,
    0, 0, targetWidth, targetHeight
  );
  
  return new Promise(resolve => {
    outputCanvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg', 0.9);
  });
}

/**
 * Compress image for efficient upload
 */
export async function compressImage(
  file: File,
  options: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    quality?: number;
  } = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    quality: 0.8,
    ...options
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    console.log('Image compressed:', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
      compression: `${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}%`
    });
    return compressedFile;
  } catch (error) {
    console.warn('Image compression failed:', error);
    return file; // Return original if compression fails
  }
}

/**
 * Create a high-quality image file from canvas
 */
export async function createImageFile(
  canvas: HTMLCanvasElement,
  filename: string = `image-${Date.now()}.jpg`,
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Failed to create blob from canvas');
      const file = new File([blob], filename, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', quality);
  });
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Calculate the area of a quadrilateral
 */
export function calculateQuadrilateralArea(points: Point[]): number {
  if (points.length !== 4) return 0;
  
  // Use the shoelace formula
  let area = 0;
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  
  return Math.abs(area) / 2;
}

/**
 * Check if a point is inside a quadrilateral
 */
export function isPointInQuadrilateral(point: Point, quad: Point[]): boolean {
  if (quad.length !== 4) return false;
  
  // Use the ray casting algorithm
  let inside = false;
  
  for (let i = 0, j = quad.length - 1; i < quad.length; j = i++) {
    if (((quad[i].y > point.y) !== (quad[j].y > point.y)) &&
        (point.x < (quad[j].x - quad[i].x) * (point.y - quad[i].y) / (quad[j].y - quad[i].y) + quad[i].x)) {
      inside = !inside;
    }
  }
  
  return inside;
}
