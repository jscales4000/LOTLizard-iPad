'use client'

// Add type declaration for global window properties
declare global {
  interface Window {
    __LOTLIZARD_MAIN_CANVAS_CONTAINER__?: HTMLDivElement;
    __LOTLIZARD_CANVAS_INSTANCE__?: any;
  }
}

import React, { useCallback, useMemo, useContext, useRef, useEffect, useState } from 'react'
import { KonvaCanvas, CanvasEquipment } from './KonvaCanvas'
import { KonvaGrid } from './KonvaGrid'
import { KonvaEquipment } from './KonvaEquipment'
import { EquipmentItem } from '@/lib/equipmentDatabase'
import { CanvasEquipmentItem, CanvasTypeAdapter } from './CanvasTypes'
import { KonvaDragContext } from '@/context/KonvaDragContext'

// We use explicit require() instead of imports to avoid SSR issues
let Layer: any

// Only import Konva on the client side
if (typeof window !== 'undefined') {
  const reactKonva = require('react-konva')
  Layer = reactKonva.Layer
}

export interface KonvaCanvasConnectorProps {
  width: number
  height: number
  equipment: EquipmentItem[]
  scale: number
  offset: { x: number, y: number }
  x?: number  // Optional x position for canvas
  y?: number  // Optional y position for canvas
  satelliteImage?: HTMLImageElement | null
  satelliteImageLoaded?: boolean
  selectedEquipment?: string | null
  onEquipmentUpdate?: (equipment: EquipmentItem[]) => void
  onEquipmentSelect?: (id: string | null) => void
  className?: string
}

/**
 * KonvaCanvasConnector - Connects the existing Canvas component to the new Konva implementation
 * This handles the conversion between the traditional equipment objects and the Konva representation
 */
export function KonvaCanvasConnector({
  width,
  height,
  equipment,
  scale,
  offset,
  satelliteImage,
  satelliteImageLoaded,
  selectedEquipment,
  onEquipmentUpdate,
  onEquipmentSelect,
  className,
}: KonvaCanvasConnectorProps) {
  // Container ref for calculating drop positions
  // Reference to both container div and Konva stage
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<any>(null)
  
  // Access the drag context for handling equipment drag from sidebar
  const dragContext = useContext(KonvaDragContext)
  
  // Use state for canvasEquipment to allow direct additions via global methods
  const [canvasEquipment, setCanvasEquipment] = useState<CanvasEquipment[]>(() => {
    return equipment.map(item => ({
      ...item,
      // Use existing x,y if available, otherwise default to center
      x: (item as any).x ?? width / 2 / scale - (item.dimensions.width * 5),
      y: (item as any).y ?? height / 2 / scale - (item.dimensions.length * 5),
      // Convert dimensions from feet to pixels (1 foot = 10 pixels)
      width: (item as any).width ?? item.dimensions.width * 10,
      height: (item as any).height ?? item.dimensions.length * 10,
      rotation: (item as any).rotation ?? 0
    }))
  })
  
  // Keep canvasEquipment in sync with incoming equipment props
  useEffect(() => {
    setCanvasEquipment(equipment.map(item => ({
      ...item,
      x: (item as any).x ?? width / 2 / scale - (item.dimensions.width * 5),
      y: (item as any).y ?? height / 2 / scale - (item.dimensions.length * 5),
      width: (item as any).width ?? item.dimensions.width * 10,
      height: (item as any).height ?? item.dimensions.length * 10,
      rotation: (item as any).rotation ?? 0
    })))
  }, [equipment, width, height, scale])
  
  // Handle equipment updates from Konva components
  const handleEquipmentUpdate = useCallback((updatedEquipment: CanvasEquipment[]) => {
    if (onEquipmentUpdate) {
      // Convert back to the format expected by the parent using the adapter
      const convertedEquipment = CanvasTypeAdapter.toEquipmentItems(updatedEquipment)
      onEquipmentUpdate(convertedEquipment)
    }
  }, [onEquipmentUpdate])
  
  // Handle equipment selection
  const handleEquipmentSelect = useCallback((id: string | null) => {
    if (onEquipmentSelect) {
      onEquipmentSelect(id)
    }
  }, [onEquipmentSelect])

  // Handle updates to individual equipment items
  const handleEquipmentChange = useCallback((id: string, newProps: Partial<CanvasEquipment>) => {
    if (onEquipmentUpdate) {
      const updatedEquipment = canvasEquipment.map(item => 
        item.id === id ? { ...item, ...newProps } : item
      )
      handleEquipmentUpdate(updatedEquipment)
    }
  }, [canvasEquipment, handleEquipmentUpdate, onEquipmentUpdate])

  // If Konva is not available (SSR), use a placeholder
  if (typeof window === 'undefined' || !Layer) {
    return (
      <div className={`konva-canvas-placeholder ${className}`} style={{ width, height }}>
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <p>Canvas loading...</p>
        </div>
      </div>
    )
  }

  // Handle drag operations from sidebar to canvas
  useEffect(() => {
    if (!dragContext) return;
    
    // Setup the drop event listener
    const handleMouseUp = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Always log mouse up events for debugging
      console.log('Mouse up detected', { x: e.clientX, y: e.clientY, isDragging: dragContext?.isDragging });
      
      // Exit early if no drag context or no drag operation
      if (!dragContext || !dragContext.dragOperation) {
        console.log('No active drag operation on mouse up');
        return;
      }
      
      // Log that we're processing a potential drop
      console.log('Processing potential equipment drop from mouse event');
      
      // Calculate if the mouse is over the canvas container
      const rect = containerRef.current.getBoundingClientRect();
      const isOverCanvas = (
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom
      );
      
      console.log('Is drop over canvas?', isOverCanvas, 'at position:', { x: e.clientX, y: e.clientY });
      console.log('Canvas bounds:', { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
      
      if (isOverCanvas) {
        console.log('CONFIRMED: Mouse drop is over Konva canvas!');
        
        // Force prevent default and stop propagation
        try { e.preventDefault(); } catch (err) { console.warn('Could not prevent default', err); }
        try { e.stopPropagation(); } catch (err) { console.warn('Could not stop propagation', err); }
        
        // Clear any existing timeout that might auto-cancel the drag
        dragContext.clearDragTimeout();
        
        try {
          // Get the dropped equipment data
          const newEquipment = dragContext.dragOperation.equipment;
          console.log('New equipment to add:', newEquipment);
          
          // Calculate position relative to canvas and apply scale
          const dropX = (e.clientX - rect.left) / scale - offset.x / scale;
          const dropY = (e.clientY - rect.top) / scale - offset.y / scale;
          console.log('Drop position:', { dropX, dropY, scale, offset });
          
          // Create the new equipment item with proper positioning
          const newCanvasEquipment: CanvasEquipment = {
            ...newEquipment,
            x: dropX,
            y: dropY,
            width: newEquipment.dimensions.width * 10,
            height: newEquipment.dimensions.length * 10,
            rotation: 0
          };
          
          console.log('New canvas equipment:', newCanvasEquipment);
          
          // Add to existing equipment
          const updatedEquipment = [...canvasEquipment, newCanvasEquipment];
          handleEquipmentUpdate(updatedEquipment);
          
          // Mark the drop as successful
          console.log('Marking drop as successful');
          dragContext.endDrag(true);
          
          return;
        } catch (err) {
          console.error('Error handling equipment drop:', err);
          dragContext.endDrag(false);
        }
      } else {
        // Log, but don't end the drag yet - that will be handled by the timeout in KonvaDragContext
        console.log('Drop not over canvas');
      }
    };
    
    // Setup touch event equivalent
    const handleTouchEnd = (e: TouchEvent) => {
      if (!containerRef.current) return;
      
      // Always log touch end events for debugging
      console.log('Touch end detected', { touches: e.changedTouches?.length, isDragging: dragContext?.isDragging });
      
      // Exit early if no drag context or no drag operation
      if (!dragContext || !dragContext.dragOperation) {
        console.log('No active drag operation on touch end');
        return;
      }
      
      // Log that we're processing a potential drop
      console.log('Processing potential equipment drop from touch event');
      
      // Get the touch point
      if (!e.changedTouches || e.changedTouches.length === 0) {
        console.log('No touch points available');
        return;
      }
      
      const touch = e.changedTouches[0];
      console.log('Touch end detected during drag', { x: touch.clientX, y: touch.clientY });
      
      // Calculate if the touch is over the canvas container
      const rect = containerRef.current.getBoundingClientRect();
      const isOverCanvas = (
        touch.clientX >= rect.left && 
        touch.clientX <= rect.right && 
        touch.clientY >= rect.top && 
        touch.clientY <= rect.bottom
      );
      
      console.log('Is touch drop over canvas?', isOverCanvas, 'at position:', { x: touch.clientX, y: touch.clientY });
      console.log('Canvas bounds for touch:', { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
      
      if (isOverCanvas) {
        console.log('CONFIRMED: Touch drop is over Konva canvas!');
        
        // Force prevent default and stop propagation
        try { e.preventDefault(); } catch (err) { console.warn('Could not prevent default', err); }
        try { e.stopPropagation(); } catch (err) { console.warn('Could not stop propagation', err); }
        
        // Clear any existing timeout that might auto-cancel the drag
        dragContext.clearDragTimeout();
        
        try {
          // Get the dropped equipment data
          const newEquipment = dragContext.dragOperation.equipment;
          console.log('New equipment to add from touch:', newEquipment);
          
          // Calculate position relative to canvas and apply scale
          const dropX = (touch.clientX - rect.left) / scale - offset.x / scale;
          const dropY = (touch.clientY - rect.top) / scale - offset.y / scale;
          console.log('Touch drop position:', { dropX, dropY, scale, offset });
          
          // Create the new equipment item with proper positioning
          const newCanvasEquipment: CanvasEquipment = {
            ...newEquipment,
            x: dropX,
            y: dropY,
            width: newEquipment.dimensions.width * 10,
            height: newEquipment.dimensions.length * 10,
            rotation: 0
          };
          
          console.log('New canvas equipment from touch:', newCanvasEquipment);
          
          // Add to existing equipment
          const updatedEquipment = [...canvasEquipment, newCanvasEquipment];
          handleEquipmentUpdate(updatedEquipment);
          
          // Mark the drop as successful
          console.log('Marking touch drop as successful');
          dragContext.endDrag(true);
          
          return;
        } catch (err) {
          console.error('Error handling touch equipment drop:', err);
          dragContext.endDrag(false);
        }
      } else {
        // Log, but don't end the drag yet - that will be handled by the timeout in KonvaDragContext
        console.log('Touch drop not over canvas');
      }
    };
    
    // Add both document-level and element-level event listeners for better capture
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
    document.addEventListener('touchend', handleTouchEnd, { capture: true });
    
    // Also add event listeners directly to the container element for more reliable capture
    if (containerRef.current) {
      containerRef.current.addEventListener('mouseup', handleMouseUp, { capture: true });
      containerRef.current.addEventListener('touchend', handleTouchEnd, { capture: true });
      
      // Debug message to confirm registration
      console.log('Direct canvas event listeners registered');
    } else {
      console.warn('Container ref not available for event registration');
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.removeEventListener('touchend', handleTouchEnd, { capture: true });
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('mouseup', handleMouseUp, { capture: true });
        containerRef.current.removeEventListener('touchend', handleTouchEnd, { capture: true });
      }
    };
  }, [dragContext, containerRef, scale, offset, canvasEquipment, handleEquipmentUpdate, onEquipmentUpdate])

  // Convert CanvasEquipment[] to CanvasEquipmentItem[] (ensuring rotation is always defined)
  const equipmentItemsWithDefaults = useMemo(() => {
    return canvasEquipment.map(item => ({
      ...item,
      rotation: item.rotation || 0 // Ensure rotation is always a number
    }));
  }, [canvasEquipment]);
  
  // State to manage canvas equipment items
  const [canvasEquipmentItems, setCanvasEquipmentItems] = useState<CanvasEquipmentItem[]>(equipmentItemsWithDefaults);
  
  // Update local state when canvasEquipment prop changes
  useEffect(() => {
    setCanvasEquipmentItems(equipmentItemsWithDefaults);
  }, [equipmentItemsWithDefaults]);

  // Function to add new equipment to canvas
  const addNewCanvasEquipment = useCallback((equipment: CanvasEquipmentItem) => {
    console.log('🎯 Adding new equipment to canvas:', equipment);
    const updatedEquipment = [...canvasEquipmentItems, equipment];
    setCanvasEquipmentItems(updatedEquipment);
    if (onEquipmentUpdate) {
      onEquipmentUpdate(updatedEquipment);
    }
  }, [canvasEquipmentItems, onEquipmentUpdate]);
  
  // Expose canvas instance globally for direct drag-and-drop handling
  useEffect(() => {
    // Create and expose a global reference to this canvas instance
    // This allows the KonvaDragContext to directly add equipment when dropped
    (window as any).__LOTLIZARD_CANVAS_INSTANCE__ = {
      addEquipment: addNewCanvasEquipment,
      scale: scale,
      offset: offset
    };
    
    console.log('🌐 KonvaCanvasConnector: Canvas instance exposed globally');
    
    // Cleanup function
    return () => {
      delete (window as any).__LOTLIZARD_CANVAS_INSTANCE__;
      console.log('🧹 KonvaCanvasConnector: Global canvas reference removed');
    };
  }, [scale, offset, addNewCanvasEquipment]);

  // Direct handler for Konva stage to capture drops
  const handleStageMouseUp = useCallback((e: any) => {
    console.log('🟢 KONVA STAGE: handleStageMouseUp called');
    
    // Always log the event for debugging
    console.log('Stage event details:', {
      type: e.type,
      target: e.target?.className || 'unknown',
      evt: e.evt ? {
        type: e.evt.type,
        clientX: e.evt.clientX,
        clientY: e.evt.clientY
      } : 'no evt data'
    });
    
    if (!dragContext?.dragOperation) {
      console.log('❌ KONVA STAGE: No active drag operation in context');
      return;
    }
    
    console.log('✅ KONVA STAGE: Mouse up detected with active drag', dragContext.dragOperation);
    console.log('Mouse up event full details:', e);
    
    try {
      // Get the dropped equipment data
      const newEquipment = dragContext.dragOperation.equipment;
      
      // Get pointer position from Konva event
      const stage = e.target.getStage(); // Get stage directly from event
      if (!stage) {
        console.warn('Stage not available from event');
        return;
      }
      
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) {
        console.warn('Could not get pointer position');
        return;
      }
      
      console.log('Stage pointer position:', pointerPos);
      
      // Convert stage position to canvas coordinates
      const dropX = (pointerPos.x / scale) - (offset.x / scale);
      const dropY = (pointerPos.y / scale) - (offset.y / scale);
      
      console.log('Calculated drop position:', { dropX, dropY });
      
      // Create the new equipment item
      const newCanvasEquipment: CanvasEquipment = {
        ...newEquipment,
        x: dropX,
        y: dropY,
        width: newEquipment.dimensions.width * 10,
        height: newEquipment.dimensions.length * 10,
        rotation: 0
      };
      
      // Add to equipment list
      const updatedEquipment = [...canvasEquipment, newCanvasEquipment];
      handleEquipmentUpdate(updatedEquipment);
      
      // End the drag operation successfully
      dragContext.endDrag(true);
      
      console.log('Equipment drop processed directly by Konva stage!');
    } catch (err) {
      console.error('Error in handleStageMouseUp:', err);
    }
  }, [dragContext, scale, offset, canvasEquipment, handleEquipmentUpdate]);
  
  // Global window properties are declared at the top of the file
  
  // Initialize globally accessible canvas container and instance
  useEffect(() => {
    console.log('📡 KonvaCanvasConnector: Initializing global references');
    // Log container ref status
    if (containerRef.current) {
      console.log('💡 Container ref is available:', {
        id: containerRef.current.id,
        classes: containerRef.current.className,
        attributes: containerRef.current.hasAttribute('data-canvas-container') ? 'has data attr' : 'no data attr'
      });
    } else {
      console.log('⚠️ Container ref is NOT available yet');
    }
    
    // Create global markers for reliable detection
    if (!window.__LOTLIZARD_MAIN_CANVAS_CONTAINER__ && containerRef.current) {
      window.__LOTLIZARD_MAIN_CANVAS_CONTAINER__ = containerRef.current;
      console.log('🔍 Created global marker for main canvas container');
    } else {
      console.log(window.__LOTLIZARD_MAIN_CANVAS_CONTAINER__ ? '💾 Global container already exists' : '⛔ Could not set global container - ref missing');
    }
    
    // Register global canvas instance with scale, offset and equipment methods
    window.__LOTLIZARD_CANVAS_INSTANCE__ = {
      scale,
      offset,
      addEquipment: (newEquipment: CanvasEquipment) => {
        console.log('🔄 Global canvas instance: adding equipment', newEquipment);
        setCanvasEquipment(prevEquipment => {
          const newId = `eq-${Date.now()}`;
          return [...prevEquipment, { ...newEquipment, id: newId }];
        });
        return true;
      }
    };
    
    // Update the global instance when scale/offset change
    return () => {
      if (window.__LOTLIZARD_CANVAS_INSTANCE__) {
        window.__LOTLIZARD_CANVAS_INSTANCE__.scale = scale;
        window.__LOTLIZARD_CANVAS_INSTANCE__.offset = offset;
      }
    };
  }, [containerRef, scale, offset]);

  return (
    <div
      ref={containerRef}
      id="lotlizard-main-canvas-container"
      data-canvas-container="true"
      className={`konva-canvas-container lotlizard-main-canvas relative h-full w-full overflow-hidden bg-gray-100 ${className}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onDragOver={(e) => {
        e.preventDefault(); // Critical for drop to work
        console.log('Drag over canvas container');
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        console.log('Drag enter canvas container');
      }}
      onMouseUp={(e) => {
        console.log('🟣 Container div mouseUp event');
        // Only process if there's an active drag
        if (dragContext?.dragOperation) {
          // Get the mouse position relative to the container
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            console.log('Container mouseUp position:', { x, y });
            
            // Call the stage handler directly if it's inside the container
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
              // Create a synthetic event for the stage handler
              const syntheticEvent = {
                type: 'mouseup',
                target: { className: 'synthetic-container' },
                evt: { type: 'mouseup', clientX: e.clientX, clientY: e.clientY }
              };
              
              // Call the stage handler directly
              handleStageMouseUp(syntheticEvent);
            }
          }
        }
      }}
      onTouchEnd={(e) => {
        console.log('🟣 Container div touchEnd event');
        // Only process if there's an active drag
        if (dragContext?.dragOperation) {
          // Get the touch position relative to the container
          const touch = e.changedTouches[0];
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect && touch) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            console.log('Container touchEnd position:', { x, y });
            
            // Call the stage handler directly if it's inside the container
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
              // Create a synthetic event for the stage handler
              const syntheticEvent = {
                type: 'touchend',
                target: { className: 'synthetic-container' },
                evt: { type: 'touchend', clientX: touch.clientX, clientY: touch.clientY }
              };
              
              // Call the stage handler directly
              handleStageMouseUp(syntheticEvent);
            }
          }
        }
      }}
    >
      <KonvaCanvas
        ref={stageRef}
        width={width}
        height={height}
        equipment={canvasEquipment}
        scale={scale}
        satelliteImage={satelliteImage}
        satelliteImageLoaded={satelliteImageLoaded}
        selectedEquipment={selectedEquipment}
        onEquipmentUpdate={handleEquipmentUpdate}
        onEquipmentSelect={handleEquipmentSelect}
        onStageMouseUp={handleStageMouseUp}
        className={className}
      />
      
      {/* We'll render our layers directly in this component instead of as children */}
      <div style={{ display: 'none' }}>
        {/* Reference to Layer components to ensure they're loaded */}
        <Layer>
          <KonvaGrid
            width={width}
            height={height}
            scale={scale}
            offset={offset}
            gridSize={20}
          />
        </Layer>
        
        <Layer>
          {canvasEquipment.map(item => (
            <KonvaEquipment
              key={item.id}
              item={item}
              isSelected={selectedEquipment === item.id}
              onSelect={handleEquipmentSelect}
              onChange={handleEquipmentChange}
              scale={scale}
            />
          ))}
        </Layer>
      </div>
      
      {/* Visual indicator for active drop target */}
      {dragContext?.isDragging && (
        <div 
          className="absolute inset-0 pointer-events-none border-4 border-blue-500 border-dashed bg-blue-100 bg-opacity-10 z-10"
        />
      )}
    </div>
  )
}
