// OpenCV.js utilities for image processing and auto-crop detection

declare global {
  interface Window {
    cv: any;
  }
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Load OpenCV.js dynamically
 */
export function loadOpenCV(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.cv) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.x/opencv.js';
    script.onload = () => {
      // Wait for cv to be available
      const checkCV = () => {
        if (window.cv && window.cv.Mat) {
          resolve();
        } else {
          setTimeout(checkCV, 100);
        }
      };
      checkCV();
    };
    script.onerror = reject;
    document.head.appendChild(script);
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