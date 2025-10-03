// Enhanced OpenCV.js utilities for Google Lens-like image processing

declare global {
  interface Window {
    cv: any;
  }
}

export interface Point {
  x: number;
  y: number;
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuadrilateralPoints {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface DetectionResult {
  quadrilateral: QuadrilateralPoints;
  confidence: number;
  boundingBox: CropBox;
}

/**
 * Load OpenCV.js dynamically with better error handling
 */
export function loadOpenCV(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.cv && window.cv.Mat) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.async = true;
    
    script.onload = () => {
      const checkCV = () => {
        if (window.cv && window.cv.Mat) {
          console.log('OpenCV.js loaded successfully');
          resolve();
        } else {
          setTimeout(checkCV, 100);
        }
      };
      checkCV();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load OpenCV.js:', error);
      reject(new Error('Failed to load OpenCV.js'));
    };
    
    if (!document.head.querySelector(`script[src="${script.src}"]`)) {
      document.head.appendChild(script);
    }
  });
}

/**
 * Suggest a crop box for building façades using OpenCV.js
 * Heuristic: find largest contour with reasonable aspect ratio
 */
export async function suggestCropBox(imgEl: HTMLImageElement): Promise<CropBox | null> {
  try {
    await loadOpenCV();

    const src = window.cv.imread(imgEl);
    const dst = new window.cv.Mat();
    const gray = new window.cv.Mat();

    // Convert to grayscale
    window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur to reduce noise
    window.cv.GaussianBlur(gray, dst, new window.cv.Size(5, 5), 0);

    // Canny edge detection
    window.cv.Canny(dst, dst, 50, 150);

    // Dilate to connect edges
    const kernel = window.cv.Mat.ones(3, 3, window.cv.CV_8U);
    window.cv.dilate(dst, dst, kernel);

    // Find contours
    const contours = new window.cv.MatVector();
    const hierarchy = new window.cv.Mat();
    window.cv.findContours(dst, contours, hierarchy, window.cv.RETR_EXTERNAL, window.cv.CHAIN_APPROX_SIMPLE);

    let bestRect: CropBox | null = null;
    let maxArea = 0;

    // Find the largest contour with reasonable aspect ratio (buildings are typically not too wide/tall)
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const rect = window.cv.boundingRect(cnt);
      const area = rect.width * rect.height;

      // Filter: reasonable size and aspect ratio
      const aspectRatio = rect.width / rect.height;
      if (area > maxArea && area > 10000 && aspectRatio > 0.3 && aspectRatio < 3.5) {
        maxArea = area;
        bestRect = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      cnt.delete();
    }

    // Clean up
    src.delete();
    dst.delete();
    gray.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();

    return bestRect;
  } catch (error) {
    console.error('Error in suggestCropBox:', error);
    return null;
  }
}

/**
 * Downscale image for faster processing
 */
export function downscaleImage(imgEl: HTMLImageElement, maxSize: number = 1280): HTMLImageElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const { width, height } = imgEl;
  const scale = Math.min(maxSize / width, maxSize / height, 1);

  canvas.width = width * scale;
  canvas.height = height * scale;

  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

  const downscaledImg = new Image();
  downscaledImg.src = canvas.toDataURL('image/jpeg', 0.9);

  return downscaledImg;
}

/**
 * Convert crop coordinates from image pixels to cropper canvas coordinates
 */
export function convertCropToCropperCoords(
  cropBox: CropBox,
  imageElement: HTMLImageElement,
  cropperElement: any
): CropBox {
  if (!cropperElement) return cropBox;

  const canvasData = cropperElement.getCanvasData();
  const imageData = cropperElement.getImageData();

  // Scale factors
  const scaleX = canvasData.width / imageData.naturalWidth;
  const scaleY = canvasData.height / imageData.naturalHeight;

  return {
    x: cropBox.x * scaleX,
    y: cropBox.y * scaleY,
    width: cropBox.width * scaleX,
    height: cropBox.height * scaleY
  };
}

/**
 * Apply perspective transform to straighten a quadrilateral crop (like Google Lens)
 */
export async function applyPerspectiveCorrection(
  imageElement: HTMLImageElement,
  corners: { x: number; y: number }[]
): Promise<HTMLCanvasElement | null> {
  try {
    await loadOpenCV();

    if (corners.length !== 4) {
      throw new Error('Perspective correction requires exactly 4 corner points');
    }

    const src = window.cv.imread(imageElement);
    const dst = new window.cv.Mat();
    const result = new window.cv.Mat();

    // Define the destination points (rectangle)
    const width = 800; // Output width
    const height = 600; // Output height

    const srcPoints = window.cv.matFromArray(4, 1, window.cv.CV_32FC2, [
      corners[0].x, corners[0].y, // top-left
      corners[1].x, corners[1].y, // top-right
      corners[2].x, corners[2].y, // bottom-right
      corners[3].x, corners[3].y  // bottom-left
    ]);

    const dstPoints = window.cv.matFromArray(4, 1, window.cv.CV_32FC2, [
      0, 0,           // top-left
      width, 0,        // top-right
      width, height,   // bottom-right
      0, height        // bottom-left
    ]);

    // Get perspective transform matrix
    const M = window.cv.getPerspectiveTransform(srcPoints, dstPoints);

    // Apply perspective transformation
    window.cv.warpPerspective(src, result, M, new window.cv.Size(width, height));

    // Convert to canvas for output
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    window.cv.imshow(canvas, result);

    // Clean up
    src.delete();
    dst.delete();
    result.delete();
    M.delete();
    srcPoints.delete();
    dstPoints.delete();

    return canvas;
  } catch (error) {
    console.error('Error applying perspective correction:', error);
    return null;
  }
}

/**
 * Get corner coordinates from cropper state for perspective correction
 */
export function getCropperCorners(cropperRef: any): { x: number; y: number }[] | null {
  if (!cropperRef?.current) return null;

  try {
    const state = cropperRef.current.getState();
    if (!state?.coordinates) return null;

    const { coordinates } = state;

    // Convert cropper coordinates to image coordinates
    const canvasData = cropperRef.current.getCanvasData();
    const imageData = cropperRef.current.getImageData();

    const scaleX = imageData.naturalWidth / canvasData.width;
    const scaleY = imageData.naturalHeight / canvasData.height;

    // Get the four corners of the crop area
    return [
      { x: coordinates.left * scaleX, y: coordinates.top * scaleY }, // top-left
      { x: (coordinates.left + coordinates.width) * scaleX, y: coordinates.top * scaleY }, // top-right
      { x: (coordinates.left + coordinates.width) * scaleX, y: (coordinates.top + coordinates.height) * scaleY }, // bottom-right
      { x: coordinates.left * scaleX, y: (coordinates.top + coordinates.height) * scaleY } // bottom-left
    ];
  } catch (error) {
    console.error('Error getting cropper corners:', error);
    return null;
  }
}

/**
 * Enhanced subject detection with quadrilateral detection (Google Lens style)
 */
export async function detectSubjectQuadrilateral(imgEl: HTMLImageElement): Promise<DetectionResult | null> {
  try {
    await loadOpenCV();
    
    const src = window.cv.imread(imgEl);
    const gray = new window.cv.Mat();
    const blur = new window.cv.Mat();
    const edges = new window.cv.Mat();
    const dilated = new window.cv.Mat();
    
    // Convert to grayscale
    window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
    
    // Apply Gaussian blur
    window.cv.GaussianBlur(gray, blur, new window.cv.Size(5, 5), 0);
    
    // Edge detection with adaptive thresholds
    window.cv.Canny(blur, edges, 75, 200);
    
    // Morphological operations to close gaps
    const kernel = window.cv.getStructuringElement(
      window.cv.MORPH_RECT, 
      new window.cv.Size(3, 3)
    );
    window.cv.dilate(edges, dilated, kernel);
    
    // Find contours
    const contours = new window.cv.MatVector();
    const hierarchy = new window.cv.Mat();
    window.cv.findContours(
      dilated, 
      contours, 
      hierarchy, 
      window.cv.RETR_EXTERNAL, 
      window.cv.CHAIN_APPROX_SIMPLE
    );
    
    let bestQuad: QuadrilateralPoints | null = null;
    let bestConfidence = 0;
    let bestBoundingBox: CropBox | null = null;
    
    // Analyze each contour for quadrilateral shapes
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = window.cv.contourArea(contour);
      
      // Skip very small contours
      if (area < 10000) {
        contour.delete();
        continue;
      }
      
      // Approximate contour to polygon
      const approx = new window.cv.Mat();
      const peri = window.cv.arcLength(contour, true);
      window.cv.approxPolyDP(contour, approx, 0.02 * peri, true);
      
      // Check if it's roughly a quadrilateral
      if (approx.rows >= 4) {
        const boundingRect = window.cv.boundingRect(contour);
        const aspectRatio = boundingRect.width / boundingRect.height;
        
        // Building-like aspect ratio and reasonable size
        if (aspectRatio > 0.3 && aspectRatio < 4.0 && area > bestConfidence * 5000) {
          // Calculate confidence based on area and shape regularity
          const confidence = Math.min(area / (imgEl.width * imgEl.height), 0.9);
          
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            
            // Extract corner points (use first 4 points of approximation)
            const points: Point[] = [];
            for (let j = 0; j < Math.min(4, approx.rows); j++) {
              const point = approx.intPtr(j, 0);
              points.push({ x: point[0], y: point[1] });
            }
            
            // Sort points to get proper quadrilateral order
            const sortedPoints = sortQuadrilateralPoints(points);
            
            bestQuad = {
              topLeft: sortedPoints[0],
              topRight: sortedPoints[1],
              bottomRight: sortedPoints[2],
              bottomLeft: sortedPoints[3]
            };
            
            bestBoundingBox = {
              x: boundingRect.x,
              y: boundingRect.y,
              width: boundingRect.width,
              height: boundingRect.height
            };
          }
        }
      }
      
      approx.delete();
      contour.delete();
    }
    
    // Clean up
    src.delete();
    gray.delete();
    blur.delete();
    edges.delete();
    dilated.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();
    
    if (bestQuad && bestBoundingBox) {
      return {
        quadrilateral: bestQuad,
        confidence: bestConfidence,
        boundingBox: bestBoundingBox
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in detectSubjectQuadrilateral:', error);
    return null;
  }
}

/**
 * Sort quadrilateral points in clockwise order starting from top-left
 */
function sortQuadrilateralPoints(points: Point[]): Point[] {
  if (points.length !== 4) {
    // If we don't have exactly 4 points, create a reasonable quadrilateral
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));
    
    return [
      { x: minX, y: minY }, // top-left
      { x: maxX, y: minY }, // top-right
      { x: maxX, y: maxY }, // bottom-right
      { x: minX, y: maxY }  // bottom-left
    ];
  }
  
  // Calculate centroid
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  
  // Sort points by angle from center
  const sortedByAngle = points.sort((a, b) => {
    const angleA = Math.atan2(a.y - centerY, a.x - centerX);
    const angleB = Math.atan2(b.y - centerY, b.x - centerX);
    return angleA - angleB;
  });
  
  // Find the top-left point (minimum distance from origin)
  let topLeftIndex = 0;
  let minDist = Infinity;
  
  sortedByAngle.forEach((point, index) => {
    const dist = Math.sqrt(point.x * point.x + point.y * point.y);
    if (dist < minDist) {
      minDist = dist;
      topLeftIndex = index;
    }
  });
  
  // Reorder starting from top-left
  const reordered = [
    ...sortedByAngle.slice(topLeftIndex),
    ...sortedByAngle.slice(0, topLeftIndex)
  ];
  
  return reordered;
}

/**
 * Apply perspective correction with automatic size calculation
 */
export async function applyPerspectiveCorrectionAuto(
  imageElement: HTMLImageElement,
  quadrilateral: QuadrilateralPoints
): Promise<HTMLCanvasElement | null> {
  try {
    await loadOpenCV();
    
    const src = window.cv.imread(imageElement);
    const result = new window.cv.Mat();
    
    // Calculate optimal output dimensions based on quadrilateral
    const topWidth = Math.sqrt(
      Math.pow(quadrilateral.topRight.x - quadrilateral.topLeft.x, 2) +
      Math.pow(quadrilateral.topRight.y - quadrilateral.topLeft.y, 2)
    );
    
    const bottomWidth = Math.sqrt(
      Math.pow(quadrilateral.bottomRight.x - quadrilateral.bottomLeft.x, 2) +
      Math.pow(quadrilateral.bottomRight.y - quadrilateral.bottomLeft.y, 2)
    );
    
    const leftHeight = Math.sqrt(
      Math.pow(quadrilateral.bottomLeft.x - quadrilateral.topLeft.x, 2) +
      Math.pow(quadrilateral.bottomLeft.y - quadrilateral.topLeft.y, 2)
    );
    
    const rightHeight = Math.sqrt(
      Math.pow(quadrilateral.bottomRight.x - quadrilateral.topRight.x, 2) +
      Math.pow(quadrilateral.bottomRight.y - quadrilateral.topRight.y, 2)
    );
    
    const outputWidth = Math.round(Math.max(topWidth, bottomWidth));
    const outputHeight = Math.round(Math.max(leftHeight, rightHeight));
    
    // Source points (quadrilateral corners)
    const srcPoints = window.cv.matFromArray(4, 1, window.cv.CV_32FC2, [
      quadrilateral.topLeft.x, quadrilateral.topLeft.y,
      quadrilateral.topRight.x, quadrilateral.topRight.y,
      quadrilateral.bottomRight.x, quadrilateral.bottomRight.y,
      quadrilateral.bottomLeft.x, quadrilateral.bottomLeft.y
    ]);
    
    // Destination points (rectangle)
    const dstPoints = window.cv.matFromArray(4, 1, window.cv.CV_32FC2, [
      0, 0,
      outputWidth, 0,
      outputWidth, outputHeight,
      0, outputHeight
    ]);
    
    // Get perspective transform matrix
    const transformMatrix = window.cv.getPerspectiveTransform(srcPoints, dstPoints);
    
    // Apply transformation
    window.cv.warpPerspective(
      src, 
      result, 
      transformMatrix, 
      new window.cv.Size(outputWidth, outputHeight)
    );
    
    // Convert to canvas
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    window.cv.imshow(canvas, result);
    
    // Clean up
    src.delete();
    result.delete();
    srcPoints.delete();
    dstPoints.delete();
    transformMatrix.delete();
    
    return canvas;
  } catch (error) {
    console.error('Error in applyPerspectiveCorrectionAuto:', error);
    return null;
  }
}
