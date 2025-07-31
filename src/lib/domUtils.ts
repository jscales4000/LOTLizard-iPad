/**
 * Safe DOM utilities to handle className operations on both regular DOM elements and SVG elements
 * Addresses the root cause: TypeError: el.className.split is not a function
 */

export const safeGetClassName = (element: Element | null): string[] => {
  if (!element || !element.className) return [];
  
  // Handle regular elements (string className)
  if (typeof element.className === 'string') {
    return element.className.split(' ').filter(Boolean);
  }
  
  // Handle SVG elements (SVGAnimatedString)
  if (element.className && typeof element.className === 'object' && 'baseVal' in element.className) {
    const svgClassName = element.className as SVGAnimatedString;
    return svgClassName.baseVal.split(' ').filter(Boolean);
  }
  
  return [];
};

export const safeHasClass = (element: Element | null, className: string): boolean => {
  const classes = safeGetClassName(element);
  return classes.includes(className);
};

export const safeAddClass = (element: Element | null, className: string): void => {
  if (!element) return;
  
  const classes = safeGetClassName(element);
  if (!classes.includes(className)) {
    classes.push(className);
    
    if (typeof element.className === 'string') {
      element.className = classes.join(' ');
    } else if (element.className && 'baseVal' in element.className) {
      (element.className as SVGAnimatedString).baseVal = classes.join(' ');
    }
  }
};

export const safeRemoveClass = (element: Element | null, className: string): void => {
  if (!element) return;
  
  const classes = safeGetClassName(element);
  const filteredClasses = classes.filter(cls => cls !== className);
  
  if (typeof element.className === 'string') {
    element.className = filteredClasses.join(' ');
  } else if (element.className && 'baseVal' in element.className) {
    (element.className as SVGAnimatedString).baseVal = filteredClasses.join(' ');
  }
};

/**
 * Safe canvas container detection with multiple fallback methods
 */
export const findCanvasContainer = (): HTMLElement | null => {
  // Method 1: Try ID selector
  const byId = document.getElementById('lotlizard-main-canvas-container');
  if (byId) return byId;
  
  // Method 2: Try class selector
  const byClass = document.querySelector('.lotlizard-main-canvas');
  if (byClass instanceof HTMLElement) return byClass;
  
  // Method 3: Try data attribute
  const byDataAttr = document.querySelector('[data-canvas-container="true"]');
  if (byDataAttr instanceof HTMLElement) return byDataAttr;
  
  // Method 4: Find any canvas element's parent
  const canvas = document.querySelector('canvas');
  if (canvas && canvas.parentElement) return canvas.parentElement;
  
  return null;
};

/**
 * Debug logging for drag-and-drop operations
 */
export const debugDragDrop = {
  logCanvasState: () => {
    console.log('🔍 Canvas State Debug:', {
      byId: document.getElementById('lotlizard-main-canvas-container'),
      byClass: document.querySelector('.lotlizard-main-canvas'),
      byDataAttr: document.querySelector('[data-canvas-container="true"]'),
      anyCanvas: document.querySelector('canvas'),
      containerFound: findCanvasContainer()
    });
  },
  
  logDragEvent: (event: DragEvent | MouseEvent | TouchEvent, phase: string) => {
    console.log(`🎯 Drag ${phase}:`, {
      type: event.type,
      target: event.target,
      currentTarget: event.currentTarget,
      coordinates: 'clientX' in event ? { x: event.clientX, y: event.clientY } : 'touches' in event ? { x: event.touches[0]?.clientX, y: event.touches[0]?.clientY } : null,
      timestamp: Date.now()
    });
  }
};
