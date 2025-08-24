/**
 * Utility functions for aspect ratio calculations and canvas sizing
 */

/**
 * Calculate canvas dimensions based on aspect ratio and available space
 * @param {number} availableWidth - Available width for canvas
 * @param {number} availableHeight - Available height for canvas
 * @param {number} aspectRatio - Target aspect ratio (width/height)
 * @returns {Object} Canvas dimensions and spacer widths
 */
export function calculateCanvasDimensions(availableWidth, availableHeight, aspectRatio = 4/3) {
  // Calculate dimensions based on width constraint
  const widthBasedHeight = availableWidth / aspectRatio;
  
  // Calculate dimensions based on height constraint
  const heightBasedWidth = availableHeight * aspectRatio;
  
  let canvasWidth, canvasHeight, leftSpacer = 0, rightSpacer = 0;
  
  if (widthBasedHeight <= availableHeight) {
    // Width is the limiting factor
    canvasWidth = availableWidth;
    canvasHeight = widthBasedHeight;
  } else {
    // Height is the limiting factor
    canvasWidth = heightBasedWidth;
    canvasHeight = availableHeight;
    
    // Calculate horizontal spacers to center the canvas
    const totalSpacer = availableWidth - canvasWidth;
    leftSpacer = totalSpacer / 2;
    rightSpacer = totalSpacer / 2;
  }
  
  return {
    canvasWidth: Math.floor(canvasWidth),
    canvasHeight: Math.floor(canvasHeight),
    leftSpacer: Math.floor(leftSpacer),
    rightSpacer: Math.floor(rightSpacer)
  };
}

/**
 * Get common aspect ratios
 * @returns {Object} Common aspect ratios
 */
export const ASPECT_RATIOS = {
  STANDARD: 4/3,    // 1.333... (4:3)
  WIDESCREEN: 16/9, // 1.777... (16:9)
  CINEMA: 21/9,     // 2.333... (21:9)
  SQUARE: 1/1,      // 1.0 (1:1)
  GOLDEN: 1.618,    // Golden ratio
  PORTRAIT: 3/4     // 0.75 (3:4)
};

/**
 * Calculate responsive breakpoints for different screen sizes
 * @param {number} windowWidth - Current window width
 * @returns {Object} Responsive settings
 */
export function getResponsiveBreakpoints(windowWidth) {
  if (windowWidth < 768) {
    return {
      controlsWidth: 280,
      navWidth: 60,
      aspectRatio: ASPECT_RATIOS.STANDARD,
      minCanvasWidth: 320
    };
  } else if (windowWidth < 1024) {
    return {
      controlsWidth: 320,
      navWidth: 80,
      aspectRatio: ASPECT_RATIOS.STANDARD,
      minCanvasWidth: 480
    };
  } else {
    return {
      controlsWidth: 340,
      navWidth: 120,
      aspectRatio: ASPECT_RATIOS.STANDARD,
      minCanvasWidth: 640
    };
  }
}
