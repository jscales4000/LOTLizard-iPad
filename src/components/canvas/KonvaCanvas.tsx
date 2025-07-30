'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { EquipmentItem } from '@/lib/equipmentDatabase'

// We use explicit require() instead of imports to avoid SSR issues
let Konva: any
let Stage: any
let Layer: any

// Only import Konva on the client side
if (typeof window !== 'undefined') {
  const konvaModule = require('konva')
  Konva = konvaModule.default || konvaModule
  
  const reactKonva = require('react-konva')
  Stage = reactKonva.Stage
  Layer = reactKonva.Layer
}

// Extend EquipmentItem with position and canvas size
export interface CanvasEquipment extends EquipmentItem {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  selected?: boolean
}

export interface KonvaEventObject<T extends Event> {
  target: any
  evt: T
  currentTarget: any
  type: string
  cancelBubble: boolean
}

export interface KonvaCanvasProps {
  // Basic props
  width: number
  height: number
  equipment: CanvasEquipment[]
  scale?: number
  satelliteImage?: HTMLImageElement | null
  satelliteImageLoaded?: boolean
  selectedEquipment?: string | null
  onEquipmentUpdate?: (equipment: CanvasEquipment[]) => void
  onEquipmentSelect?: (id: string | null) => void
  className?: string
  // Events
  onStageMouseUp?: (e: any) => void
}

/**
 * KonvaCanvas - A React-Konva based canvas component for equipment placement and interaction
 * This component replaces the raw canvas API implementation with a declarative Konva.js approach
 */
export const KonvaCanvas = React.forwardRef<any, KonvaCanvasProps>(function KonvaCanvas({
  // Destructure props
  width,
  height,
  equipment,
  scale = 1,
  satelliteImage = null,
  satelliteImageLoaded = false,
  selectedEquipment = null,
  onEquipmentUpdate,
  onEquipmentSelect,
  className = '',
  // Event handlers
  onStageMouseUp
}, ref) {
  // Stage reference (from forwardRef or local)
  const localStageRef = useRef<any>(null)
  // Safely handle the ref (could be a callback or object ref)
  const stageRef = useRef<any>(null)
  
  // Setup ref forwarding
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(localStageRef.current)
      } else {
        ref.current = localStageRef.current
      }
    }
  }, [ref, localStageRef.current])
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Internal state
  const [stageSize, setStageSize] = useState({ width, height })
  const [stageScale, setStageScale] = useState(scale)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  
  // Feature flag to enable/disable the new canvas
  const [useKonva, setUseKonva] = useState(true)
  
  // Update stage size on container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current
        setStageSize({
          width: offsetWidth,
          height: offsetHeight
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Function to handle zooming
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const scaleBy = 1.1
    const stage = stageRef.current
    if (!stage) return

    const oldScale = stageScale
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    }

    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

    // Limit scale
    const limitedScale = Math.max(0.1, Math.min(5, newScale))

    // Set new position
    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    }

    setStageScale(limitedScale)
    setStagePosition(newPos)
  }, [stageScale, stagePosition])

  // Handle equipment selection
  const handleEquipmentSelect = useCallback((id: string | null) => {
    if (onEquipmentSelect) {
      onEquipmentSelect(id)
    }
  }, [onEquipmentSelect])

  // Prevent stage drag when clicking on empty canvas
  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // If we clicked on an empty area, deselect
    if (e.target === e.currentTarget) {
      handleEquipmentSelect(null)
    }
  }, [handleEquipmentSelect])

  // Update equipment position when dragged
  const handleEquipmentDragEnd = useCallback((id: string, x: number, y: number) => {
    if (onEquipmentUpdate) {
      const updatedEquipment = equipment.map(item => 
        item.id === id ? { ...item, x, y } : item
      )
      onEquipmentUpdate(updatedEquipment)
    }
  }, [equipment, onEquipmentUpdate])

  // If Konva is not available yet (SSR), render a placeholder
  if (typeof window === 'undefined' || !Stage) {
    return (
      <div 
        ref={containerRef}
        className={`konva-canvas-container relative ${className}`}
        style={{ width, height }}
      >
        <div className="flex h-full w-full items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg">Loading Canvas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`konva-canvas-container relative ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      <Stage
        ref={localStageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        x={stagePosition.x}
        y={stagePosition.y}
        scale={{ x: stageScale, y: stageScale }}
        draggable
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onClick={handleStageClick}
        onMouseUp={onStageMouseUp}
        onTouchEnd={onStageMouseUp}
        onPointerUp={onStageMouseUp}
      >
        {/* Grid Layer */}
        <Layer>
          {/* Grid will be implemented in KonvaGrid component */}
        </Layer>
        
        {/* Satellite Layer */}
        <Layer>
          {/* Satellite imagery will be implemented in KonvaSatellite component */}
        </Layer>
        
        {/* Equipment Layer */}
        <Layer>
          {/* Equipment items will be implemented in KonvaEquipment component */}
        </Layer>
      </Stage>
      
      {/* Feature toggle controls (for development only) */}
      {typeof window !== 'undefined' && (
        <div className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded shadow text-xs">
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={useKonva} 
              onChange={(e) => setUseKonva(e.target.checked)} 
            />
            <span>Use Konva.js Canvas</span>
          </label>
        </div>
      )}
      
      {/* Debug info */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-80 px-2 py-1 text-xs text-gray-800 rounded">
        Scale: {stageScale.toFixed(2)}x | 
        Items: {equipment.length}
      </div>
    </div>
  )
})
