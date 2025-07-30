'use client'

// Add type declaration for global window properties
declare global {
  interface Window {
    __LOTLIZARD_MAIN_CANVAS_CONTAINER__?: HTMLDivElement;
    __LOTLIZARD_CANVAS_INSTANCE__?: any;
  }
}

import React, { createContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react'
import { type EquipmentItem } from '@/lib/equipmentDatabase'

// Types for the drag operation
export interface DragOperation {
  equipment: EquipmentItem;
  initialPosition: { x: number; y: number };
  currentPosition?: { x: number; y: number };
  source: 'sidebar' | 'canvas';
}

// Context interface
export interface KonvaDragContextType {
  dragOperation: DragOperation | null;
  startDrag: (data: DragOperation) => void;
  updateDrag: (position: { x: number; y: number }) => void;
  endDrag: (dropSuccessful?: boolean) => void;
  isDragging: boolean;
  timeoutId?: number | null; // Expose timeout ID for external cancellation
  clearDragTimeout: () => void; // Add method to clear timeout from outside
}

// Create the context with a default value
export const KonvaDragContext = createContext<KonvaDragContextType | null>(null)

// Provider component
interface KonvaDragProviderProps {
  children: ReactNode;
}

export const KonvaDragProvider: React.FC<KonvaDragProviderProps> = ({ children }) => {
  // State for the current drag operation
  const [dragOperation, setDragOperation] = useState<DragOperation | null>(null)
  
  // State for tracking the automatic end timeout
  const [timeoutId, setTimeoutId] = useState<number | null>(null)
  
  // Use a ref to avoid stale closure issues in event handlers
  const dragOperationRef = useRef<DragOperation | null>(null)
  
  // Keep the ref in sync with the state
  useEffect(() => {
    dragOperationRef.current = dragOperation
  }, [dragOperation])

  // Event handler refs
  const handlersRef = useRef<{
    mouseMoveHandler: ((e: MouseEvent) => void) | null,
    mouseUpHandler: ((e: MouseEvent) => void) | null,
    touchMoveHandler: ((e: TouchEvent) => void) | null,
    touchEndHandler: ((e: TouchEvent) => void) | null,
  }>({
    mouseMoveHandler: null,
    mouseUpHandler: null,
    touchMoveHandler: null,
    touchEndHandler: null,
  })

  // Start a drag operation
  const startDrag = useCallback((data: DragOperation) => {
    console.log('🔵 KonvaDragContext: startDrag called', { data })
    console.log('Starting drag operation:', data)
    
    // Create the drag operation with initial position
    const newDragOperation = {
      ...data,
      currentPosition: data.initialPosition
    }
    
    // Update both state and ref
    setDragOperation(newDragOperation)
    dragOperationRef.current = newDragOperation

    // Create fresh handlers that use the ref instead of capturing the state
    const mouseMoveHandler = (e: MouseEvent) => {
      if (!dragOperationRef.current) return
      console.log('🟡 KonvaDragContext: mouseMoveHandler', { x: e.clientX, y: e.clientY })
      // Update directly using latest ref
      const updatedOperation = { 
        ...dragOperationRef.current, 
        currentPosition: { x: e.clientX, y: e.clientY } 
      }
      setDragOperation(updatedOperation)
      dragOperationRef.current = updatedOperation
    }
    
    // Global window properties are declared at the top of the file

    const mouseUpHandler = (e: MouseEvent) => {
      console.log('🟠 KonvaDragContext: mouseUpHandler', { x: e.clientX, y: e.clientY })
      // Clear any previous timeout
      clearDragTimeout()
      
      // DIRECT PROCESSING: Instead of waiting for canvas, directly handle the drop
      if (dragOperationRef.current) {
        console.log('🔓 KonvaDragContext: Direct drop processing starting')
        
        try {
          console.log('🔍 DOM INSPECTION DURING DROP:');
          console.log('- Body classes:', document.body.className);
          console.log('- Document readyState:', document.readyState);
          console.log('- Total elements in DOM:', document.querySelectorAll('*').length);
          console.log('- Total divs:', document.querySelectorAll('div').length);
          
          // Check if global container exists
          console.log('- Global container exists?', !!window.__LOTLIZARD_MAIN_CANVAS_CONTAINER__);
          
          // Inspect canvas area elements
          const mainContent = document.querySelector('main');
          if (mainContent) {
            console.log('- Main content exists with classes:', mainContent.className);
            console.log('- Main content children:', mainContent.children.length);
            
            // Print first-level children of main for debugging
            Array.from(mainContent.children).forEach((child, i) => {
              if (child instanceof HTMLElement) {
                console.log(`  Child ${i}:`, { 
                  tag: child.tagName,
                  id: child.id || 'no-id',
                  classes: child.className || 'no-classes',
                  children: child.children.length
                });
              }
            });
          } else {
            console.log('- Main content does not exist');
          }

          // Try multiple methods to find canvas container
          let canvasContainer: HTMLElement | null = null;
          
          // Method 1: Try global reference (most reliable)
          if (window.__LOTLIZARD_MAIN_CANVAS_CONTAINER__) {
            console.log('✅ Found canvas via global reference');
            canvasContainer = window.__LOTLIZARD_MAIN_CANVAS_CONTAINER__;
          }
          
          // Method 2: Try ID selector
          if (!canvasContainer) {
            const byId = document.getElementById('lotlizard-main-canvas-container');
            if (byId) {
              console.log('✅ Found canvas via ID selector');
              canvasContainer = byId;
            } else {
              console.log('❌ ID selector failed: #lotlizard-main-canvas-container not found');
            }
          }
          
          // Method 3: Try class selectors
          if (!canvasContainer) {
            const byClass = document.querySelector('.lotlizard-main-canvas');
            if (byClass instanceof HTMLElement) {
              console.log('✅ Found canvas via class selector');
              canvasContainer = byClass;
            } else {
              console.log('❌ Class selector failed: .lotlizard-main-canvas not found');
              
              // List all classes in the document for debugging
              const allClasses = new Set<string>();
              document.querySelectorAll('[class]').forEach(el => {
                el.className.split(' ').forEach(cls => allClasses.add(cls));
              });
              console.log('- Available classes in DOM:', Array.from(allClasses).join(', '));
            }
          }
          
          // Method 4: Try data attribute
          if (!canvasContainer) {
            const byData = document.querySelector('[data-canvas-container="true"]');
            if (byData instanceof HTMLElement) {
              console.log('✅ Found canvas via data attribute');
              canvasContainer = byData;
            } else {
              console.log('❌ Data attribute selector failed: [data-canvas-container="true"] not found');
            }
          }
          
          // Method 5: Original selector as fallback
          if (!canvasContainer) {
            const original = document.querySelector('.konva-canvas-container');
            if (original instanceof HTMLElement) {
              console.log('✅ Found canvas via original class selector');
              canvasContainer = original;
            } else {
              console.log('❌ Original selector failed: .konva-canvas-container not found');
            }
          }
          
          // Method 6: Desperate measures - any canvas
          if (!canvasContainer) {
            const anyCanvas = document.querySelector('canvas');
            if (anyCanvas) {
              console.log('⚠️ Last resort: found a <canvas> element, using its parent');
              if (anyCanvas.parentElement) {
                canvasContainer = anyCanvas.parentElement;
              }
            } else {
              console.log('❌ No <canvas> elements found in the document at all!');
            }
          }
          
          // If canvas found, check if drop position is within it
          if (canvasContainer) {
            console.log('Processing drop with found canvas container');
            const rect = canvasContainer.getBoundingClientRect();
            
            // Check if mouse position is within this canvas
            if (e.clientX >= rect.left && e.clientX <= rect.right && 
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
              
              console.log('🏁 KonvaDragContext: Drop within canvas detected!');
              
              // Create equipment at drop position
              const newEquipment = dragOperationRef.current.equipment;
              
              // Convert to canvas coordinates
              const canvasX = e.clientX - rect.left;
              const canvasY = e.clientY - rect.top;
              
              console.log('Canvas drop coordinates:', { canvasX, canvasY });
              
              // Find Canvas component instance
              const canvasInstance = window.__LOTLIZARD_CANVAS_INSTANCE__;
              if (canvasInstance) {
                console.log('Canvas instance found, adding equipment');
                
                // Create the new equipment item
                const dropX = canvasX / canvasInstance.scale - (canvasInstance.offset?.x || 0) / canvasInstance.scale;
                const dropY = canvasY / canvasInstance.scale - (canvasInstance.offset?.y || 0) / canvasInstance.scale;
                
                const newCanvasEquipment = {
                  ...newEquipment,
                  x: dropX,
                  y: dropY,
                  width: newEquipment.dimensions.width * 10,
                  height: newEquipment.dimensions.length * 10,
                  rotation: 0
                };
                
                // Add equipment
                canvasInstance.addEquipment(newCanvasEquipment);
                endDrag(true);
                return;
              } else {
                console.log('Canvas instance not found');
              }
            } else {
              console.log('Drop position outside canvas bounds:', { 
                mouseX: e.clientX, 
                mouseY: e.clientY,
                canvasLeft: rect.left,
                canvasRight: rect.right,
                canvasTop: rect.top,
                canvasBottom: rect.bottom
              });
            }
          } else {
            console.log('No canvas container found by any method');
          }
          
          console.log('⛔ KonvaDragContext: Drop not within any canvas');
          endDrag(false);
          
        } catch (err) {
          console.error('Error in direct drop processing:', err);
          endDrag(false);
        }
      } else {
        console.log('❓ KonvaDragContext: No active drag operation during mouseUp');
      }
    }
    
    const touchMoveHandler = (e: TouchEvent) => {
      if (!dragOperationRef.current || e.touches.length === 0) return
      const touch = e.touches[0]
      // Update directly using latest ref
      const updatedOperation = { 
        ...dragOperationRef.current, 
        currentPosition: { x: touch.clientX, y: touch.clientY } 
      }
      setDragOperation(updatedOperation)
      dragOperationRef.current = updatedOperation
      e.preventDefault() // Prevent scrolling while dragging
    }
    
    const touchEndHandler = (e: TouchEvent) => {
      // Clear any previous timeout
      clearDragTimeout()
      
      // Similar timeout for touch events
      const id = window.setTimeout(() => {
        if (dragOperationRef.current) {
          console.log('Touch drag not handled by canvas, ending automatically')
          endDrag(false)
        }
      }, 300)
      
      // Store the timeout ID so it can be cleared if needed
      setTimeoutId(id)
    }
    
    // Save handlers to ref for cleanup
    handlersRef.current = {
      mouseMoveHandler,
      mouseUpHandler,
      touchMoveHandler,
      touchEndHandler
    }

    // Add global event listeners using the new handlers
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
    document.addEventListener('touchmove', touchMoveHandler)
    document.addEventListener('touchend', touchEndHandler)
  }, [])

  // Update the drag position - now a simple wrapper around state updates
  const updateDrag = useCallback((position: { x: number; y: number }) => {
    setDragOperation(prev => {
      if (!prev) return null
      const updated = { ...prev, currentPosition: position }
      // Keep ref in sync
      dragOperationRef.current = updated
      return updated
    })
  }, [])

  // End a drag operation
  // Helper to clear any existing timeout
  const clearDragTimeout = useCallback(() => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
      setTimeoutId(null)
      console.log('Cleared existing drag timeout')
    }
  }, [timeoutId])

  const endDrag = useCallback((dropSuccessful = false) => {
    console.log('Ending drag operation, successful:', dropSuccessful)
    
    // Clear any existing timeout
    clearDragTimeout()
    
    // Clean up event listeners using saved handler refs
    const { mouseMoveHandler, mouseUpHandler, touchMoveHandler, touchEndHandler } = handlersRef.current
    
    if (mouseMoveHandler) document.removeEventListener('mousemove', mouseMoveHandler)
    if (mouseUpHandler) document.removeEventListener('mouseup', mouseUpHandler)
    if (touchMoveHandler) document.removeEventListener('touchmove', touchMoveHandler)
    if (touchEndHandler) document.removeEventListener('touchend', touchEndHandler)
    
    // Reset both state and ref
    setDragOperation(null)
    dragOperationRef.current = null
  }, [clearDragTimeout])

  // The context value
  const value: KonvaDragContextType = {
    dragOperation,
    startDrag,
    updateDrag,
    endDrag,
    isDragging: dragOperation !== null,
    timeoutId,
    clearDragTimeout
  }

  return (
    <KonvaDragContext.Provider value={value}>
      {children}
      
      {/* Ghost drag image that follows cursor/touch */}
      {dragOperation && dragOperation.currentPosition && (
        <div
          className="absolute pointer-events-none z-50 opacity-70 shadow-lg"
          style={{
            left: dragOperation.currentPosition.x - 40,
            top: dragOperation.currentPosition.y - 40,
            width: '80px',
            height: '80px',
            backgroundColor: '#f0f0f0',
            border: `2px solid ${dragOperation.equipment.color || '#666'}`,
            borderRadius: '8px',
            transform: 'translate(-50%, -50%)',
            transition: 'transform 0.05s',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="text-2xl">{dragOperation.equipment.thumbnail}</div>
          <div className="text-xs font-medium truncate max-w-full">
            {dragOperation.equipment.name}
          </div>
        </div>
      )}
    </KonvaDragContext.Provider>
  )
}
