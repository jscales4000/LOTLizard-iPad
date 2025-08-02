'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useUnifiedDrag } from '@/contexts/UnifiedDragContext'
import { useCanvasScale } from '@/contexts/CanvasScaleContext'
import { EquipmentItem } from '@/lib/equipmentDatabase'
import { CanvasEquipmentItem, toCanvasEquipmentItem, isCanvasEquipmentItem } from '@/types/canvasTypes'
import { debugDragDrop } from '@/lib/domUtils'
// Global types are automatically loaded by TypeScript

interface RobustCanvasProps {
  width: number
  height: number
  equipment: CanvasEquipmentItem[]
  onEquipmentUpdate?: (equipment: CanvasEquipmentItem[]) => void
  onEquipmentClick?: (equipmentId: string, event?: { shiftKey?: boolean, ctrlKey?: boolean, button?: number }) => void
  scale?: number
  offset?: { x: number; y: number }
  className?: string
  selectedEquipmentId?: string | null
  isMovingEquipment?: boolean
  isRotatingEquipment?: boolean
}

export const RobustCanvas: React.FC<RobustCanvasProps> = ({
  width,
  height,
  equipment,
  onEquipmentUpdate,
  onEquipmentClick,
  scale = 1,
  offset = { x: 0, y: 0 },
  className = '',
  selectedEquipmentId = null,
  isMovingEquipment = false,
  isRotatingEquipment = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasEquipment, setCanvasEquipment] = useState<CanvasEquipmentItem[]>(equipment)
  
  // Move and rotate state
  const [isDraggingEquipment, setIsDraggingEquipment] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [equipmentStartPos, setEquipmentStartPos] = useState({ x: 0, y: 0 })
  const [rotationStartAngle, setRotationStartAngle] = useState(0)
  const [equipmentStartRotation, setEquipmentStartRotation] = useState(0)

  const { dragState, endDrag } = useUnifiedDrag()
  const { screenToCanvas } = useCanvasScale()

  // Handle equipment addition from drag-and-drop
  const handleEquipmentAdd = useCallback((item: EquipmentItem, position: { x: number; y: number }) => {
    console.log('🎯 RobustCanvas: Adding equipment', { item: item.name, position })
    
    // Convert screen coordinates to canvas coordinates
    const canvasPosition = screenToCanvas(position)
    console.log('📐 RobustCanvas: Converted position', { screen: position, canvas: canvasPosition })
    
    const newEquipment = toCanvasEquipmentItem(item, canvasPosition)
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
  }, [canvasEquipment, onEquipmentUpdate, screenToCanvas])

  // Helper function to find equipment by ID
  const findEquipmentById = useCallback((id: string) => {
    return canvasEquipment.find(item => item.id === id)
  }, [canvasEquipment])

  // Helper function to update equipment position
  const updateEquipmentPosition = useCallback((id: string, newX: number, newY: number) => {
    const updatedEquipment = canvasEquipment.map(item => 
      item.id === id ? { ...item, x: newX, y: newY } : item
    )
    setCanvasEquipment(updatedEquipment)
    if (onEquipmentUpdate) {
      onEquipmentUpdate(updatedEquipment)
    }
  }, [canvasEquipment, onEquipmentUpdate])

  // Helper function to update equipment rotation
  const updateEquipmentRotation = useCallback((id: string, newRotation: number) => {
    const updatedEquipment = canvasEquipment.map(item => 
      item.id === id ? { ...item, rotation: newRotation } : item
    )
    setCanvasEquipment(updatedEquipment)
    if (onEquipmentUpdate) {
      onEquipmentUpdate(updatedEquipment)
    }
  }, [canvasEquipment, onEquipmentUpdate])

  // Calculate angle between two points
  const calculateAngle = useCallback((centerX: number, centerY: number, pointX: number, pointY: number) => {
    return Math.atan2(pointY - centerY, pointX - centerX) * (180 / Math.PI)
  }, [])

  // Handle equipment move start
  const handleMoveStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, equipmentId: string) => {
    if (!isMovingEquipment || !selectedEquipmentId || selectedEquipmentId !== equipmentId) return
    
    const equipment = findEquipmentById(equipmentId)
    if (!equipment) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    let clientX: number, clientY: number
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    setIsDraggingEquipment(true)
    setDragStartPos({ x, y })
    setEquipmentStartPos({ x: equipment.x, y: equipment.y })
    
    console.log('🔄 RobustCanvas: Move started for equipment', equipmentId, { x, y })
  }, [isMovingEquipment, selectedEquipmentId, findEquipmentById])

  // Handle equipment rotate start
  const handleRotateStart = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, equipmentId: string) => {
    if (!isRotatingEquipment || !selectedEquipmentId || selectedEquipmentId !== equipmentId) return
    
    const equipment = findEquipmentById(equipmentId)
    if (!equipment) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    let clientX: number, clientY: number
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    // Convert screen coordinates to canvas coordinates
    const canvasX = (x / scale) - offset.x
    const canvasY = (y / scale) - offset.y
    
    const startAngle = calculateAngle(equipment.x, equipment.y, canvasX, canvasY)
    
    setIsDraggingEquipment(true)
    setRotationStartAngle(startAngle)
    setEquipmentStartRotation(equipment.rotation || 0)
    
    console.log('🔄 RobustCanvas: Rotate started for equipment', equipmentId, { startAngle })
  }, [isRotatingEquipment, selectedEquipmentId, findEquipmentById, scale, offset, calculateAngle])

  // Equipment rendering function with shape support
  const drawEquipmentItem = useCallback((ctx: CanvasRenderingContext2D, item: CanvasEquipmentItem) => {
    const { x, y } = item
    const isSelected = item.id === selectedEquipmentId
    
    // Use item coordinates directly - canvas transformations handle scaling
    // CanvasEquipmentItem extends EquipmentItem, so it has shape and clearance properties
    const shape = item.shape || 'rectangle'
    const dimensions = item.dimensions
    const color = item.color || '#3b82f6'
    const clearance = item.clearance
    const rotation = item.rotation || 0
    
    // Save context for transformations
    ctx.save()
    
    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(x, y)
      ctx.rotate(rotation * Math.PI / 180)
      ctx.translate(-x, -y)
    }
    
    // Draw clearance area first (behind equipment) - with defensive checks
    if (clearance && typeof clearance === 'object') {
      try {
        drawClearanceArea(ctx, x, y, dimensions, clearance, shape)
      } catch (error) {
        console.warn('🚨 Error drawing clearance for equipment:', item.name, error)
        // Continue rendering equipment even if clearance fails
      }
    }
    
    // Draw equipment shape - canvas transformations handle scaling
    ctx.fillStyle = color
    ctx.strokeStyle = isSelected ? '#ef4444' : '#2563eb'
    ctx.lineWidth = isSelected ? 3 : 2
    
    if (shape === 'circle') {
      const radius = dimensions.radius || 10
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    } else {
      // Rectangle shape
      const width = dimensions.width || 20
      const length = dimensions.length || 20
      const rectX = x - width / 2
      const rectY = y - length / 2
      
      ctx.fillRect(rectX, rectY, width, length)
      ctx.strokeRect(rectX, rectY, width, length)
    }
    
    // Draw selection indicators
    if (isSelected) {
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      
      if (shape === 'circle') {
        const radius = (dimensions.radius || 10) + 5
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else {
        const width = (dimensions.width || 20) + 10
        const length = (dimensions.length || 20) + 10
        const rectX = x - width / 2
        const rectY = y - length / 2
        ctx.strokeRect(rectX, rectY, width, length)
      }
      
      ctx.setLineDash([]) // Reset line dash
    }
    
    // Draw equipment label
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, SF Pro Display'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.name.substring(0, 8), x, y)
    
    // Draw mode indicator for selected equipment
    if (isSelected) {
      ctx.fillStyle = isMovingEquipment ? '#10b981' : isRotatingEquipment ? '#f59e0b' : '#ef4444'
      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, SF Pro Display'
      const modeText = isMovingEquipment ? '🔄 MOVE' : isRotatingEquipment ? '🔄 ROTATE' : '✓ SELECTED'
      ctx.fillText(modeText, x, y - 20)
    }
    
    // Draw equipment emoji/thumbnail if available
    if (item.thumbnail) {
      ctx.font = '16px Arial'
      ctx.fillText(item.thumbnail, x, y - 20)
    }
  }, [offset, scale])

  // Clearance area rendering function
  const drawClearanceArea = useCallback((
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    equipmentDimensions: any,
    clearance: any,
    equipmentShape: string
  ) => {
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)' // Semi-transparent yellow
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'
    ctx.setLineDash([5, 5]) // Dashed line
    ctx.lineWidth = 1
    
    if (clearance.shape === 'circle') {
      // Circle clearance uses radius directly on clearance object
      const radius = clearance.radius || 15
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    } else {
      // Rectangle clearance uses equipment dimensions + per-side clearance values
      const equipmentWidth = equipmentDimensions.width || 20
      const equipmentHeight = equipmentDimensions.length || 20
      const top = clearance.top || 0
      const bottom = clearance.bottom || 0
      const left = clearance.left || 0
      const right = clearance.right || 0
      
      const clearanceWidth = equipmentWidth + left + right
      const clearanceHeight = equipmentHeight + top + bottom
      const clearanceX = x - clearanceWidth / 2
      const clearanceY = y - clearanceHeight / 2
      
      ctx.fillRect(clearanceX, clearanceY, clearanceWidth, clearanceHeight)
      ctx.strokeRect(clearanceX, clearanceY, clearanceWidth, clearanceHeight)
    }
    
    ctx.restore()
  }, [])

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
        containerClasses: container.className
      })
      
      // Mark canvas as ready
      setCanvasReady(true)
      
      // Register global equipment addition callback
      window.__LOTLIZARD_ADD_EQUIPMENT__ = handleEquipmentAdd
      
      debugDragDrop.logCanvasState()
    }
  }, [width, height, handleEquipmentAdd])

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
    
    // Save context and apply transformations
    ctx.save()
    
    // Apply zoom and pan transformations
    ctx.scale(scale, scale)
    ctx.translate(offset.x, offset.y)
    
    // Draw grid with transformations applied
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1 / scale // Adjust line width for zoom
    const gridSize = 50
    
    // Calculate visible grid bounds based on current view
    const startX = Math.floor(-offset.x / gridSize) * gridSize
    const endX = Math.ceil((width / scale - offset.x) / gridSize) * gridSize
    const startY = Math.floor(-offset.y / gridSize) * gridSize
    const endY = Math.ceil((height / scale - offset.y) / gridSize) * gridSize
    
    // Draw vertical grid lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
      ctx.stroke()
    }
    
    // Draw horizontal grid lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
      ctx.stroke()
    }
    
    // Draw equipment with shape support
    canvasEquipment.forEach(item => {
      if (isCanvasEquipmentItem(item)) {
        drawEquipmentItem(ctx, item)
      }
    })
    
    // Restore canvas context after transformations
    ctx.restore()
    
    // Drag preview is now handled by ScaleAwareDragPreview component
    // No need to draw on canvas
  }, [width, height, canvasEquipment, dragState, scale, offset, drawEquipmentItem])

  // Redraw canvas when equipment or drag state changes
  useEffect(() => {
    if (canvasReady) {
      drawCanvas()
    }
  }, [drawCanvas, dragState, canvasReady, canvasEquipment, scale, offset])

  // Add keyboard shortcuts for move and rotate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEquipmentId) return
      
      // M key for move mode
      if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        if (onEquipmentClick) {
          // Trigger move mode via parent component
          console.log('🔄 RobustCanvas: Move mode activated via M key')
          // This will be handled by the parent Canvas component
        }
      }
      
      // R key for rotate mode
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        if (onEquipmentClick) {
          // Trigger rotate mode via parent component
          console.log('🔄 RobustCanvas: Rotate mode activated via R key')
          // This will be handled by the parent Canvas component
        }
      }
      
      // Escape to cancel move/rotate
      if (e.key === 'Escape') {
        if (isDraggingEquipment) {
          setIsDraggingEquipment(false)
          console.log('🔄 RobustCanvas: Move/rotate cancelled via Escape')
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedEquipmentId, onEquipmentClick, isDraggingEquipment])

  // Handle canvas mouse events for drop detection and equipment selection
  const handleCanvasMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasReady) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // End equipment dragging if active
    if (isDraggingEquipment) {
      setIsDraggingEquipment(false)
      console.log('🔄 RobustCanvas: Equipment drag ended')
      return
    }
    
    // If dragging from sidebar, handle drop
    if (dragState.isDragging && dragState.dragItem) {
      console.log('🎯 RobustCanvas: Mouse up on canvas during drag', { x, y })
      handleEquipmentAdd(dragState.dragItem, { x, y })
      return
    }
    
    // If not dragging, check for equipment click
    // Convert screen coordinates to canvas coordinates
    const canvasX = (x / scale) - offset.x
    const canvasY = (y / scale) - offset.y
    
    const clickedEquipment = canvasEquipment.find(item => {
      const shape = item.shape || 'rectangle'
      
      if (shape === 'circle') {
        const radius = item.dimensions.radius || 10
        const distance = Math.sqrt((canvasX - item.x) ** 2 + (canvasY - item.y) ** 2)
        return distance <= radius
      } else {
        const width = item.dimensions.width || 20
        const length = item.dimensions.length || 20
        const rectX = item.x - width / 2
        const rectY = item.y - length / 2
        return canvasX >= rectX && canvasX <= rectX + width && canvasY >= rectY && canvasY <= rectY + length
      }
    })
    
    if (clickedEquipment) {
      // Handle move/rotate start if in those modes
      if (isMovingEquipment && clickedEquipment.id === selectedEquipmentId) {
        handleMoveStart(e, clickedEquipment.id)
        return
      }
      
      if (isRotatingEquipment && clickedEquipment.id === selectedEquipmentId) {
        handleRotateStart(e, clickedEquipment.id)
        return
      }
      
      // Regular equipment click
      if (onEquipmentClick) {
        console.log('🎯 RobustCanvas: Equipment clicked', clickedEquipment.name, {
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          button: e.button
        })
        onEquipmentClick(clickedEquipment.id, {
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          button: e.button
        })
      }
    }
  }, [canvasReady, dragState, handleEquipmentAdd, canvasEquipment, scale, offset, onEquipmentClick, isDraggingEquipment, isMovingEquipment, isRotatingEquipment, selectedEquipmentId, handleMoveStart, handleRotateStart])
  
  // Handle mouse move for equipment dragging
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasReady || !isDraggingEquipment || !selectedEquipmentId) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (isMovingEquipment) {
      // Calculate movement delta
      const deltaX = (x - dragStartPos.x) / scale
      const deltaY = (y - dragStartPos.y) / scale
      
      // Update equipment position
      const newX = equipmentStartPos.x + deltaX
      const newY = equipmentStartPos.y + deltaY
      
      updateEquipmentPosition(selectedEquipmentId, newX, newY)
      console.log('📐 RobustCanvas: Moving equipment', { newX, newY })
    } else if (isRotatingEquipment) {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (x / scale) - offset.x
      const canvasY = (y / scale) - offset.y
      
      const equipment = findEquipmentById(selectedEquipmentId)
      if (equipment) {
        const currentAngle = calculateAngle(equipment.x, equipment.y, canvasX, canvasY)
        const angleDelta = currentAngle - rotationStartAngle
        const newRotation = equipmentStartRotation + angleDelta
        
        updateEquipmentRotation(selectedEquipmentId, newRotation)
        console.log('🔄 RobustCanvas: Rotating equipment', { newRotation })
      }
    }
  }, [canvasReady, isDraggingEquipment, selectedEquipmentId, isMovingEquipment, isRotatingEquipment, dragStartPos, equipmentStartPos, rotationStartAngle, equipmentStartRotation, scale, offset, updateEquipmentPosition, updateEquipmentRotation, findEquipmentById, calculateAngle])

  // Handle canvas touch events for drop detection
  const handleCanvasTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasReady) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.changedTouches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    // End equipment dragging if active
    if (isDraggingEquipment) {
      setIsDraggingEquipment(false)
      console.log('🔄 RobustCanvas: Equipment touch drag ended')
      return
    }
    
    // Handle sidebar drag drop
    if (dragState.isDragging && dragState.dragItem) {
      console.log('🎯 RobustCanvas: Touch end on canvas during drag', { x, y })
      handleEquipmentAdd(dragState.dragItem, { x, y })
    }
  }, [canvasReady, dragState, handleEquipmentAdd, isDraggingEquipment])

  // Handle touch move for equipment dragging
  const handleCanvasTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasReady || !isDraggingEquipment || !selectedEquipmentId) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    if (isMovingEquipment) {
      // Calculate movement delta
      const deltaX = (x - dragStartPos.x) / scale
      const deltaY = (y - dragStartPos.y) / scale
      
      // Update equipment position
      const newX = equipmentStartPos.x + deltaX
      const newY = equipmentStartPos.y + deltaY
      
      updateEquipmentPosition(selectedEquipmentId, newX, newY)
    } else if (isRotatingEquipment) {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (x / scale) - offset.x
      const canvasY = (y / scale) - offset.y
      
      const equipment = findEquipmentById(selectedEquipmentId)
      if (equipment) {
        const currentAngle = calculateAngle(equipment.x, equipment.y, canvasX, canvasY)
        const angleDelta = currentAngle - rotationStartAngle
        const newRotation = equipmentStartRotation + angleDelta
        
        updateEquipmentRotation(selectedEquipmentId, newRotation)
      }
    }
  }, [canvasReady, isDraggingEquipment, selectedEquipmentId, isMovingEquipment, isRotatingEquipment, dragStartPos, equipmentStartPos, rotationStartAngle, equipmentStartRotation, scale, offset, updateEquipmentPosition, updateEquipmentRotation, findEquipmentById, calculateAngle])
  
  // Handle right-click context menu
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent browser context menu
    
    if (!canvasReady) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Convert screen coordinates to canvas coordinates
    const canvasX = (x / scale) - offset.x
    const canvasY = (y / scale) - offset.y
    
    const clickedEquipment = canvasEquipment.find(item => {
      const shape = item.shape || 'rectangle'
      
      if (shape === 'circle') {
        const radius = item.dimensions.radius || 10
        const distance = Math.sqrt((canvasX - item.x) ** 2 + (canvasY - item.y) ** 2)
        return distance <= radius
      } else {
        const width = item.dimensions.width || 20
        const length = item.dimensions.length || 20
        const rectX = item.x - width / 2
        const rectY = item.y - length / 2
        return canvasX >= rectX && canvasX <= rectX + width && canvasY >= rectY && canvasY <= rectY + length
      }
    })
    
    if (clickedEquipment && onEquipmentClick) {
      console.log('🎯 RobustCanvas: Equipment right-clicked', clickedEquipment.name)
      onEquipmentClick(clickedEquipment.id, {
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        button: 2 // Right-click
      })
    }
  }, [canvasReady, canvasEquipment, scale, offset, onEquipmentClick])

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
        onMouseUp={handleCanvasMouseUp}
        onMouseMove={handleCanvasMouseMove}
        onTouchEnd={handleCanvasTouchEnd}
        onTouchMove={handleCanvasTouchMove}
        onContextMenu={handleCanvasContextMenu}
        style={{
          display: 'block',
          cursor: dragState.isDragging ? 'crosshair' : isDraggingEquipment ? (isMovingEquipment ? 'move' : 'grab') : 'default'
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
