'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useRobustDrag } from '@/context/RobustDragContext'
import { EquipmentItem } from '@/lib/equipmentDatabase'
import { CanvasEquipmentItem, toCanvasEquipmentItem, isCanvasEquipmentItem } from '@/types/canvasTypes'
import { debugDragDrop } from '@/lib/domUtils'
// Global types are automatically loaded by TypeScript

interface RobustCanvasProps {
  width: number
  height: number
  equipment: CanvasEquipmentItem[]
  onEquipmentUpdate?: (equipment: CanvasEquipmentItem[]) => void
  className?: string
}

export const RobustCanvas: React.FC<RobustCanvasProps> = ({
  width,
  height,
  equipment,
  onEquipmentUpdate,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasEquipment, setCanvasEquipment] = useState<CanvasEquipmentItem[]>(equipment)

  const { setCanvasReady: setDragCanvasReady, isDragging, draggedItem } = useRobustDrag()

  // Handle equipment addition from drag-and-drop
  const handleEquipmentAdd = useCallback((item: EquipmentItem, position: { x: number; y: number }) => {
    console.log('🎯 RobustCanvas: Adding equipment', { item: item.name, position })
    
    const newEquipment = toCanvasEquipmentItem(item, position)
    newEquipment.id = `${item.id}-${Date.now()}` // Ensure unique ID
    
    const updatedEquipment = [...canvasEquipment, newEquipment]
    setCanvasEquipment(updatedEquipment)
    
    if (onEquipmentUpdate) {
      onEquipmentUpdate(updatedEquipment)
    }
    
    // Notify that equipment was successfully placed (for selection reset)
    if (window.__LOTLIZARD_EQUIPMENT_PLACED__) {
      window.__LOTLIZARD_EQUIPMENT_PLACED__()
    }
  }, [canvasEquipment, onEquipmentUpdate])

  // Initialize canvas and set ready state
  useEffect(() => {
    console.log('🎨 RobustCanvas: Initializing canvas')
    
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current
      const container = containerRef.current
      
      // Set canvas size
      canvas.width = width
      canvas.height = height
      
      console.log('✅ RobustCanvas: Canvas initialized', {
        width,
        height,
        containerId: container.id,
        containerClasses: container.className
      })
      
      // Mark canvas as ready
      setCanvasReady(true)
      setDragCanvasReady(true, container)
      
      // Register global equipment addition callback
      window.__LOTLIZARD_ADD_EQUIPMENT__ = handleEquipmentAdd
      
      debugDragDrop.logCanvasState()
    }
  }, [width, height, setDragCanvasReady, handleEquipmentAdd])

  // Update equipment when props change
  useEffect(() => {
    setCanvasEquipment(equipment)
  }, [equipment])

  // Canvas drawing function
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    const gridSize = 50
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Draw equipment
    canvasEquipment.forEach(item => {
      if (isCanvasEquipmentItem(item)) {
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(item.x - 25, item.y - 25, 50, 50)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(item.name.substring(0, 8), item.x, item.y + 4)
      }
    })
    
    // Drag preview is now handled by the DragPreview component
    // No need to draw on canvas
  }, [width, height, canvasEquipment, isDragging, draggedItem])

  // Redraw canvas when equipment or drag state changes
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Handle canvas click for equipment placement (fallback)
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasReady || !isDragging || !draggedItem) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    console.log('🎯 RobustCanvas: Canvas click during drag', { x, y })
    handleEquipmentAdd(draggedItem, { x, y })
  }, [canvasReady, isDragging, draggedItem, handleEquipmentAdd])

  return (
    <div
      ref={containerRef}
      id="lotlizard-main-canvas-container"
      className={`lotlizard-main-canvas ${className}`}
      data-canvas-container="true"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        style={{
          display: 'block',
          cursor: isDragging ? 'crosshair' : 'default'
        }}
      />
      
      {!canvasReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-600">Initializing canvas...</p>
        </div>
      )}
      
      {canvasReady && (
        <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
          Equipment: {canvasEquipment.length} | Ready: {canvasReady ? '✅' : '❌'}
        </div>
      )}
    </div>
  )
}
