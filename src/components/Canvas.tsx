'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useCalibration, CalibrationPoint } from '@/lib/useCalibration'
import CanvasToolOverlay from './CanvasToolOverlay'
import { RobustCanvas } from './RobustCanvas'
import { CanvasEquipmentItem, toCanvasEquipmentItem } from '@/types/canvasTypes'
import { useRobustDrag } from '@/context/RobustDragContext'
import dynamic from 'next/dynamic'

// Konva imports temporarily removed to bypass cache issues
// const KonvaCanvasConnector = dynamic(
//   () => import('./canvas/KonvaCanvasConnector_New').then(mod => ({ default: mod.KonvaCanvasConnector })),
//   { ssr: false }
// )

// Add CSS for drop targets
import './canvas.css'

interface CanvasProps {
  selectedTool: string
  isCalibrating: boolean
  onCalibrationComplete: () => void
  satelliteImageData?: any
}

interface Equipment {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
  category: string
  thumbnail: string
  dimensions: {
    width: number
    length: number
    height?: number
  }
}

export default function Canvas({ selectedTool, isCalibrating, onCalibrationComplete, satelliteImageData }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [equipment, setEquipment] = useState<CanvasEquipmentItem[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isLegacyDragging, setIsLegacyDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedCalibrationPoint, setDraggedCalibrationPoint] = useState<'start' | 'end' | null>(null)
  const [canvasTool, setCanvasTool] = useState('select')
  const [satelliteImage, setSatelliteImage] = useState<HTMLImageElement | null>(null)
  const [satelliteImageLoaded, setSatelliteImageLoaded] = useState(false)
  
  // Feature flag for robust canvas implementation
  const [useRobustCanvas, setUseRobustCanvas] = useState(true)
  
  // Robust drag context
  const { isDragging: isRobustDragging, draggedItem } = useRobustDrag()
  
  // Load satellite image when data changes
  useEffect(() => {
    if (satelliteImageData && satelliteImageData.imageUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setSatelliteImage(img)
        setSatelliteImageLoaded(true)
        
        // Automatically set canvas scale based on satellite image scale
        const metersPerPixel = satelliteImageData.metersPerPixel
        const pixelsPerMeter = 1 / metersPerPixel
        setScale(pixelsPerMeter * 0.1) // Adjust scale factor as needed
        
        console.log(`Satellite image loaded with scale: ${metersPerPixel.toFixed(4)} meters/pixel`)
        console.log(`Confidence: ${(satelliteImageData.confidence * 100).toFixed(1)}%`)
      }
      img.onerror = () => {
        console.error('Failed to load satellite image')
        setSatelliteImageLoaded(false)
      }
      img.src = satelliteImageData.imageUrl
    } else {
      setSatelliteImage(null)
      setSatelliteImageLoaded(false)
    }
  }, [satelliteImageData])

  // Calibration system
  const {
    calibrationState,
    startCalibration,
    setFirstPoint,
    setSecondPoint,
    updateCalibration,
    editCalibration,
    updateCalibrationLine,
    saveCalibration,
    resetCalibration,
    cancelCalibration
  } = useCalibration()

  // Update canvas size on container resize
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current
      if (container && canvasRef.current) {
        const newSize = {
          width: container.offsetWidth,
          height: container.offsetHeight,
        }
        setCanvasSize(newSize)
        canvasRef.current.width = newSize.width
        canvasRef.current.height = newSize.height
        drawCanvas()
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [equipment, selectedEquipment, scale, offset])

  // Draw canvas content
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Apply transformations
    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(scale, scale)
    
    // Draw satellite image as background layer
    if (satelliteImage && satelliteImageLoaded) {
      try {
        // Calculate image dimensions to fit canvas
        const imgAspectRatio = satelliteImage.width / satelliteImage.height
        const canvasAspectRatio = canvas.width / canvas.height
        
        let drawWidth = canvas.width / scale
        let drawHeight = canvas.height / scale
        let drawX = -offset.x / scale
        let drawY = -offset.y / scale
        
        // Draw the satellite image
        ctx.globalAlpha = 0.8 // Make it slightly transparent
        ctx.drawImage(satelliteImage, drawX, drawY, drawWidth, drawHeight)
        ctx.globalAlpha = 1.0 // Reset alpha
        
        // Add a subtle border around the satellite image
        ctx.strokeStyle = '#007AFF'
        ctx.lineWidth = 2 / scale
        ctx.strokeRect(drawX, drawY, drawWidth, drawHeight)
      } catch (error) {
        console.error('Error drawing satellite image:', error)
      }
    }
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 0.5 / scale
    const gridSize = 20
    const startX = Math.floor(-offset.x / scale / gridSize) * gridSize
    const startY = Math.floor(-offset.y / scale / gridSize) * gridSize
    const endX = startX + (canvas.width / scale) + gridSize
    const endY = startY + (canvas.height / scale) + gridSize
    
    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
      ctx.stroke()
    }
    
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
      ctx.stroke()
    }
    
    // Draw equipment
    equipment.forEach((item) => {
      ctx.save()
      
      // Equipment rectangle with gradient
      const gradient = ctx.createLinearGradient(item.x, item.y, item.x, item.y + item.height)
      gradient.addColorStop(0, item.color + 'CC') // Slightly transparent
      gradient.addColorStop(1, item.color + '88') // More transparent at bottom
      
      ctx.fillStyle = gradient
      ctx.strokeStyle = selectedEquipment === item.id ? '#007AFF' : '#666'
      ctx.lineWidth = (selectedEquipment === item.id ? 3 : 2) / scale
      
      // Draw rounded rectangle
      const radius = 4 / scale
      ctx.beginPath()
      ctx.roundRect(item.x, item.y, item.width, item.height, radius)
      ctx.fill()
      ctx.stroke()
      
      // Draw thumbnail emoji
      ctx.fillStyle = '#000'
      const thumbnailSize = Math.min(item.width, item.height) * 0.3
      ctx.font = `${thumbnailSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        item.thumbnail,
        item.x + item.width / 2,
        item.y + item.height * 0.35
      )
      
      // Equipment name
      ctx.fillStyle = '#000'
      ctx.font = `bold ${Math.max(8, Math.min(14, item.width * 0.08)) / scale}px -apple-system, BlinkMacSystemFont, SF Pro Display`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Truncate long names
      let displayName = item.name
      if (displayName.length > 12) {
        displayName = displayName.substring(0, 10) + '...'
      }
      
      ctx.fillText(
        displayName,
        item.x + item.width / 2,
        item.y + item.height * 0.65
      )
      
      // Show dimensions
      ctx.fillStyle = '#666'
      ctx.font = `${Math.max(6, Math.min(10, item.width * 0.06)) / scale}px -apple-system, BlinkMacSystemFont, SF Pro Display`
      ctx.fillText(
        `${item.dimensions.width}' × ${item.dimensions.length}'`,
        item.x + item.width / 2,
        item.y + item.height * 0.85
      )
      
      // Selection handles
      if (selectedEquipment === item.id) {
        ctx.fillStyle = '#007AFF'
        const handleSize = 8 / scale
        ctx.fillRect(item.x - handleSize/2, item.y - handleSize/2, handleSize, handleSize)
        ctx.fillRect(item.x + item.width - handleSize/2, item.y - handleSize/2, handleSize, handleSize)
        ctx.fillRect(item.x - handleSize/2, item.y + item.height - handleSize/2, handleSize, handleSize)
        ctx.fillRect(item.x + item.width - handleSize/2, item.y + item.height - handleSize/2, handleSize, handleSize)
      }
      
      ctx.restore()
    })
    
    // Draw calibration line and points
    if (calibrationState.line) {
      ctx.save()
      
      const line = calibrationState.line
      const pointRadius = 8 // Fixed size in pixels
      
      // Draw calibration line
      if (line.start.x !== line.end.x || line.start.y !== line.end.y) {
        ctx.strokeStyle = '#FF3B30'
        ctx.lineWidth = 3
        ctx.setLineDash([8, 8])
        
        ctx.beginPath()
        ctx.moveTo(line.start.x, line.start.y)
        ctx.lineTo(line.end.x, line.end.y)
        ctx.stroke()
      }
      
      // Draw calibration points (always visible)
      ctx.fillStyle = '#FF3B30'
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.setLineDash([])
      
      // Start point
      ctx.beginPath()
      ctx.arc(line.start.x, line.start.y, pointRadius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // End point (only if different from start)
      if (line.start.x !== line.end.x || line.start.y !== line.end.y) {
        ctx.beginPath()
        ctx.arc(line.end.x, line.end.y, pointRadius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      }
      
      // Draw measurement label
      if (line.realWorldDistance && line.unit && (line.start.x !== line.end.x || line.start.y !== line.end.y)) {
        const midX = (line.start.x + line.end.x) / 2
        const midY = (line.start.y + line.end.y) / 2
        
        ctx.fillStyle = '#FFFFFF'
        ctx.strokeStyle = '#FF3B30'
        ctx.lineWidth = 2
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, SF Pro Display'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const text = `${line.realWorldDistance} ${line.unit}`
        const textWidth = ctx.measureText(text).width
        const padding = 8
        
        // Background
        ctx.fillRect(
          midX - textWidth/2 - padding,
          midY - 10 - padding,
          textWidth + padding * 2,
          20 + padding * 2
        )
        
        // Border
        ctx.strokeRect(
          midX - textWidth/2 - padding,
          midY - 10 - padding,
          textWidth + padding * 2,
          20 + padding * 2
        )
        
        // Text
        ctx.fillStyle = '#FF3B30'
        ctx.fillText(text, midX, midY)
      }
      
      ctx.restore()
    }
    
    ctx.restore()
  }, [equipment, selectedEquipment, scale, offset, calibrationState.line])

  // Handle equipment drop from sidebar
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('DROP EVENT ON CANVAS:', e)
    console.log('Drop target:', e.currentTarget.tagName)
    
    try {
      // Try different data formats
      let equipmentData = e.dataTransfer.getData('application/json')
      if (!equipmentData) {
        equipmentData = e.dataTransfer.getData('text/plain')
      }
      if (!equipmentData) {
        equipmentData = e.dataTransfer.getData('text')
      }
      
      console.log('Raw drag data:', equipmentData)
      console.log('Available data types:', e.dataTransfer.types)
      
      if (!equipmentData) {
        console.log('No equipment data found in any format')
        return
      }
      
      const equipment = JSON.parse(equipmentData)
      console.log('Parsed equipment:', equipment)
      
      // Get drop position relative to canvas
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) {
        console.log('No canvas rect available')
        return
      }
      
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Convert screen coordinates to canvas coordinates
      const canvasX = (x - offset.x) / scale
      const canvasY = (y - offset.y) / scale
      
      console.log('Drop position:', { x, y, canvasX, canvasY, scale, offset })
      
      // Create equipment instance with position
      const newEquipment: CanvasEquipmentItem = toCanvasEquipmentItem(equipment, { x: canvasX, y: canvasY })
      newEquipment.width = equipment.dimensions?.width * 10 || 50 // Scale feet to pixels (1 foot = 10 pixels)
      newEquipment.height = equipment.dimensions?.length * 10 || 50
      newEquipment.id = `${equipment.id}-${Date.now()}` // Make unique
      
      // Add to equipment list
      setEquipment(prev => [...prev, newEquipment])
      console.log('Equipment placed successfully:', newEquipment)
      
      // Force redraw of canvas
      setTimeout(() => drawCanvas(), 0)
      
    } catch (error) {
      console.error('Error handling drop:', error)
    }
  }, [scale, offset, drawCanvas])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    // Critical: preventDefault is required to make element a valid drop target
    e.preventDefault()
    // Show copy cursor instead of forbidden icon
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  // Handle mouse interactions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x) / scale
    const y = (e.clientY - rect.top - offset.y) / scale
    
    // Handle calibration interactions
    if (calibrationState.isActive) {
      if (calibrationState.isWaitingForFirstPoint) {
        setFirstPoint({ x, y })
        return
      }
      
      if (calibrationState.isWaitingForSecondPoint) {
        setSecondPoint({ x, y })
        return
      }
      
      if (calibrationState.isEditing && calibrationState.line) {
        // Check if clicking on calibration points for editing
        const pointRadius = 8 // Fixed pixel size
        const rect = canvas.getBoundingClientRect()
        const canvasX = (calibrationState.line.start.x * scale) + offset.x
        const canvasY = (calibrationState.line.start.y * scale) + offset.y
        const canvasX2 = (calibrationState.line.end.x * scale) + offset.x
        const canvasY2 = (calibrationState.line.end.y * scale) + offset.y
        
        const startDist = Math.sqrt(
          Math.pow(e.clientX - rect.left - canvasX, 2) + 
          Math.pow(e.clientY - rect.top - canvasY, 2)
        )
        const endDist = Math.sqrt(
          Math.pow(e.clientX - rect.left - canvasX2, 2) + 
          Math.pow(e.clientY - rect.top - canvasY2, 2)
        )
        
        if (startDist <= pointRadius + 5) {
          setDraggedCalibrationPoint('start')
          return
        }
        if (endDist <= pointRadius + 5) {
          setDraggedCalibrationPoint('end')
          return
        }
      }
      
      return // Don't handle other interactions during calibration
    }
    
    // Check if clicking on equipment
    let clickedEquipment = null
    for (const item of equipment) {
      if (x >= item.x && x <= item.x + item.width && 
          y >= item.y && y <= item.y + item.height) {
        clickedEquipment = item.id
        break
      }
    }
    
    if (clickedEquipment) {
      setSelectedEquipment(clickedEquipment === selectedEquipment ? null : clickedEquipment)
    } else {
      setSelectedEquipment(null)
      if (canvasTool === 'move' || canvasTool === 'select') {
        setIsLegacyDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }
  }, [equipment, selectedEquipment, selectedTool, offset, scale, calibrationState, setFirstPoint, setSecondPoint])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Handle calibration point dragging
    if (draggedCalibrationPoint && calibrationState.line) {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - offset.x) / scale
      const y = (e.clientY - rect.top - offset.y) / scale
      
      if (draggedCalibrationPoint === 'start') {
        updateCalibrationLine({ x, y }, calibrationState.line.end)
      } else {
        updateCalibrationLine(calibrationState.line.start, { x, y })
      }
      return
    }
    
    if (isLegacyDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }, [isLegacyDragging, dragStart, draggedCalibrationPoint, calibrationState.line, offset, scale, updateCalibrationLine])

  const handleMouseUp = useCallback(() => {
    setIsLegacyDragging(false)
    setDraggedCalibrationPoint(null)
  }, [])

  // Canvas tool functions
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(5, scale * 1.2)
    setScale(newScale)
  }, [scale])
  
  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(0.1, scale * 0.8)
    setScale(newScale)
  }, [scale])
  
  const handleResetView = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])
  
  const handleFitToScreen = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Calculate scale to fit content
    const padding = 50
    const availableWidth = canvas.width - padding * 2
    const availableHeight = canvas.height - padding * 2
    
    // Assuming content area of 1000x1000 units
    const contentWidth = 1000
    const contentHeight = 1000
    
    const scaleX = availableWidth / contentWidth
    const scaleY = availableHeight / contentHeight
    const newScale = Math.min(scaleX, scaleY, 1)
    
    setScale(newScale)
    setOffset({ 
      x: (canvas.width - contentWidth * newScale) / 2,
      y: (canvas.height - contentHeight * newScale) / 2
    })
  }, [])
  
  const handleMaxOut = useCallback(() => {
    setScale(5)
  }, [])

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor))
    
    // Zoom towards mouse position
    const scaleChange = newScale / scale
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * scaleChange,
      y: mouseY - (mouseY - offset.y) * scaleChange
    }
    
    setOffset(newOffset)
    setScale(newScale)
  }, [scale, offset])

  // Start calibration when prop changes
  useEffect(() => {
    if (isCalibrating && !calibrationState.isActive) {
      startCalibration()
    }
  }, [isCalibrating, calibrationState.isActive, startCalibration])
  
  // Handle calibration save
  const handleCalibrationSave = useCallback(() => {
    saveCalibration()
    onCalibrationComplete()
  }, [saveCalibration, onCalibrationComplete])
  
  // Handle calibration cancel
  const handleCalibrationCancel = useCallback(() => {
    cancelCalibration()
    onCalibrationComplete()
  }, [cancelCalibration, onCalibrationComplete])
  
  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Global event listeners for debugging drop events
  useEffect(() => {
    const handleGlobalDrop = (e: DragEvent) => {
      console.log('Global drop event detected:', e);
    };
    
    document.addEventListener('drop', handleGlobalDrop);
    return () => {
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-white overflow-hidden drop-target" 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-active');
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-active');
      }}
      style={{ 
        touchAction: 'none',
        position: 'relative',
      }}>
      {useRobustCanvas ? (
        // New robust canvas implementation with timing fixes
        <RobustCanvas
          width={canvasSize.width}
          height={canvasSize.height}
          equipment={equipment}
          onEquipmentUpdate={setEquipment}
          className="w-full h-full"
        />
      ) : (
        // Legacy canvas implementation
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onDragEnter={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ display: 'block', pointerEvents: 'auto', touchAction: 'none' }}
        />
      )}

      {/* Tool Indicator */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-sm">
        <span className="text-sm font-medium text-ios-gray-dark">
          Tool: {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}
        </span>
        <div className="text-xs text-ios-gray mt-1">
          Zoom: {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Feature toggle for development */}
      {(typeof window !== 'undefined' && window.location.hostname === 'localhost') && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={useRobustCanvas}
              onChange={(e) => setUseRobustCanvas(e.target.checked)}
              className="h-4 w-4 text-blue-500"
            />
            <span className="text-xs font-medium">Use Robust Canvas</span>
          </label>
        </div>
      )}
      
      {/* Instructions */}
      {equipment.length === 0 && !calibrationState.isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-ios-gray">
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="text-xl font-semibold mb-2">Welcome to LotPlanner</h3>
            <p className="text-sm mb-2">
              Drag equipment from the sidebar to start planning your carnival lot
            </p>
            <p className="text-xs text-ios-gray">
              • Scroll to zoom • Drag to pan • Click equipment to select
            </p>
          </div>
        </div>
      )}
      
      {/* Canvas Tool Overlay */}
      <CanvasToolOverlay
        selectedTool={canvasTool}
        onToolSelect={setCanvasTool}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
        onFit={handleFitToScreen}
        onMaxOut={handleMaxOut}
      />

    </div>
  )
}
