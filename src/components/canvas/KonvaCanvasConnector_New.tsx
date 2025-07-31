'use client'

// Add type declaration for global window properties
declare global {
  interface Window {
    __LOTLIZARD_MAIN_CANVAS_CONTAINER__?: HTMLDivElement;
    __LOTLIZARD_CANVAS_INSTANCE__?: {
      addEquipment: (equipment: any) => boolean;
    };
  }
}

import React, { useCallback, useRef, useEffect, useState } from 'react'
import { KonvaCanvas, CanvasEquipment } from './KonvaCanvas'
import { KonvaGrid } from './KonvaGrid'
import { KonvaEquipment } from './KonvaEquipment'
import { EquipmentItem } from '@/lib/equipmentDatabase'

// We use explicit require() instead of imports to avoid SSR issues
let Layer: any
let Stage: any

if (typeof window !== 'undefined') {
  try {
    const Konva = require('konva')
    Layer = Konva.Layer
    Stage = Konva.Stage
  } catch (error) {
    console.warn('Konva not available:', error)
  }
}

interface KonvaCanvasConnectorProps {
  equipment: EquipmentItem[]
  width: number
  height: number
  scale: number
  offset: { x: number; y: number }
  onEquipmentUpdate?: (equipment: EquipmentItem[]) => void
  showGrid?: boolean
  gridSize?: number
  satelliteImage?: string | null
  onScaleChange?: (scale: number) => void
  onOffsetChange?: (offset: { x: number; y: number }) => void
}

export const KonvaCanvasConnector: React.FC<KonvaCanvasConnectorProps> = ({
  equipment,
  width,
  height,
  scale,
  offset,
  onEquipmentUpdate,
  showGrid = true,
  gridSize = 50,
  satelliteImage,
  onScaleChange,
  onOffsetChange
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<any>(null)
  
  // Use state for canvasEquipment to allow direct additions via global methods
  const [canvasEquipment, setCanvasEquipment] = useState<CanvasEquipment[]>(() => {
    return equipment.map(item => ({
      ...item,
      // Use existing x,y if available, otherwise default to center
      x: (item as any).x ?? width / 2 / scale - (item.dimensions.width * 5),
      y: (item as any).y ?? height / 2 / scale - (item.dimensions.height || item.dimensions.length) * 5
    }))
  })

  // Update canvasEquipment when props change
  useEffect(() => {
    setCanvasEquipment(equipment.map(item => ({
      ...item,
      x: (item as any).x ?? width / 2 / scale - (item.dimensions.width * 5),
      y: (item as any).y ?? height / 2 / scale - (item.dimensions.height || item.dimensions.length) * 5
    })))
  }, [equipment, width, height, scale])

  // Global canvas instance registration
  useEffect(() => {
    console.log('📡 KonvaCanvasConnector: Initializing global references')
    if (containerRef.current) {
      console.log('💡 Container ref is available:', {
        id: containerRef.current.id,
        classes: containerRef.current.className,
        attributes: containerRef.current.hasAttribute('data-canvas-container') ? 'has data attr' : 'no data attr'
      })
      
      // Set global container reference
      if (!window.__LOTLIZARD_MAIN_CANVAS_CONTAINER__) {
        window.__LOTLIZARD_MAIN_CANVAS_CONTAINER__ = containerRef.current
        console.log('🔍 Created global marker for main canvas container')
      }
    } else {
      console.log('⚠️ Container ref is NOT available yet')
    }

    // Expose global canvas instance for SimpleDragContext
    window.__LOTLIZARD_CANVAS_INSTANCE__ = {
      addEquipment: (equipmentItem: EquipmentItem) => {
        console.log('🎯 Global addEquipment called:', equipmentItem.name)
        
        const newEquipment: CanvasEquipment = {
          ...equipmentItem,
          x: width / 2 / scale,
          y: height / 2 / scale
        }
        
        setCanvasEquipment(prev => {
          const updated = [...prev, newEquipment]
          console.log('✅ Equipment added to canvas:', updated.length, 'total items')
          return updated
        })
        
        // Notify parent component
        if (onEquipmentUpdate) {
          const updatedEquipment = [...equipment, equipmentItem]
          onEquipmentUpdate(updatedEquipment)
        }
        
        return true
      }
    }
    
    console.log('🌐 Global canvas instance registered')
  }, [width, height, scale, equipment, onEquipmentUpdate])

  const handleEquipmentDragEnd = useCallback((id: string, newPos: { x: number; y: number }) => {
    console.log('🎯 Equipment drag end:', id, newPos)
    
    setCanvasEquipment(prev => 
      prev.map(item => 
        item.id === id ? { ...item, x: newPos.x, y: newPos.y } : item
      )
    )
    
    if (onEquipmentUpdate) {
      const updatedEquipment = equipment.map(item => 
        item.id === id ? { ...item, x: newPos.x, y: newPos.y } : item
      )
      onEquipmentUpdate(updatedEquipment)
    }
  }, [equipment, onEquipmentUpdate])

  const handleEquipmentSelect = useCallback((id: string) => {
    console.log('🎯 Equipment selected:', id)
  }, [])

  if (!Layer || !Stage) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-full bg-gray-100 flex items-center justify-center"
        id="main-canvas-container"
        data-canvas-container="true"
      >
        <p>Loading Konva canvas...</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white lotlizard-main-canvas"
      id="main-canvas-container"
      data-canvas-container="true"
    >
      <KonvaCanvas
        ref={stageRef}
        width={width}
        height={height}
        scale={scale}
        offset={offset}
        onScaleChange={onScaleChange}
        onOffsetChange={onOffsetChange}
        satelliteImage={satelliteImage}
      >
        {showGrid && (
          <KonvaGrid
            width={width}
            height={height}
            gridSize={gridSize}
            scale={scale}
            offset={offset}
          />
        )}
        
        {canvasEquipment.map((item) => (
          <KonvaEquipment
            key={item.id}
            equipment={item}
            scale={scale}
            onDragEnd={(newPos) => handleEquipmentDragEnd(item.id, newPos)}
            onSelect={() => handleEquipmentSelect(item.id)}
          />
        ))}
      </KonvaCanvas>
    </div>
  )
}
