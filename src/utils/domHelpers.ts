/**
 * Safe DOM utilities for robust drag-and-drop functionality
 * Addresses className.split errors and canvas/Konva element conflicts
 */

/**
 * Safely get className array from any element type
 * Handles DOM elements, SVG elements, and elements without className
 */
export function safeGetClassName(element: any): string[] {
  if (!element) return [];
  
  // Handle standard DOM elements
  if (typeof element.className === 'string') {
    return element.className.split(' ').filter(Boolean);
  }
  
  // Handle SVG elements (className is an object with baseVal)
  if (element.className && typeof element.className.baseVal === 'string') {
    return element.className.baseVal.split(' ').filter(Boolean);
  }
  
  // Handle elements with classList
  if (element.classList) {
    return Array.from(element.classList);
  }
  
  // Fallback for elements without className
  return [];
}

/**
 * Check if an element is a valid drag target
 * Excludes canvas elements and Konva-generated nodes
 */
export function isValidDragTarget(element: any): boolean {
  // Ensure element is a proper DOM element
  if (!element || !element.nodeType || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  
  // Exclude canvas and Konva-generated elements
  if (element.tagName === 'CANVAS' || 
      element.closest('.konvajs-content') ||
      element.hasAttribute('data-konva-node')) {
    return false;
  }
  
  return true;
}

/**
 * Check if an element or its parents match any of the given class names
 * Uses safe className detection
 */
export function hasClassInHierarchy(element: any, classNames: string[]): boolean {
  let current = element;
  
  while (current && current !== document.body) {
    const elementClasses = safeGetClassName(current);
    
    if (elementClasses.some(cls => classNames.includes(cls))) {
      return true;
    }
    
    current = current.parentElement;
  }
  
  return false;
}

/**
 * Find the closest parent element with any of the given class names
 * Uses safe className detection
 */
export function findClosestWithClass(element: any, classNames: string[]): Element | null {
  let current = element;
  
  while (current && current !== document.body) {
    const elementClasses = safeGetClassName(current);
    
    if (elementClasses.some(cls => classNames.includes(cls))) {
      return current;
    }
    
    current = current.parentElement;
  }
  
  return null;
}

/**
 * Check if element is within canvas container bounds
 * Safe for both DOM and Konva elements
 */
export function isWithinCanvasBounds(element: any, point: { x: number; y: number }): boolean {
  if (!element) return false;
  
  try {
    const rect = element.getBoundingClientRect();
    return (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    );
  } catch (error) {
    console.warn('Error checking canvas bounds:', error);
    return false;
  }
}

/**
 * Device detection utilities - Client-side only
 */
export const getDeviceUtils = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return safe defaults
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isTouchDevice: false
    }
  }
  
  // Client-side detection
  return {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }
}

// Legacy export for backward compatibility - will be safe for SSR
export const deviceUtils = {
  isMobile: false,
  isIOS: false,
  isAndroid: false,
  isTouchDevice: false
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + 
    Math.pow(point2.y - point1.y, 2)
  );
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
