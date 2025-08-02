'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useCalibration, CalibrationPoint } from '@/lib/useCalibration'
import CanvasToolOverlay from './CanvasToolOverlay'
import { RobustCanvas } from './RobustCanvas'
import { CanvasEquipmentItem, toCanvasEquipmentItem } from '@/types/canvasTypes'
import { useUnifiedDrag } from '@/contexts/UnifiedDragContext'
import EquipmentPropertyEditor from './EquipmentPropertyEditor'
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
  isCalibrating?: boolean
  onCalibrationComplete?: () => void
  satelliteImageData?: any
  // Equipment manipulation props
  selectedEquipmentId?: string | null
  isMovingEquipment?: boolean
  isRotatingEquipment?: boolean
  onEquipmentSelectionChange?: (equipmentId: string | null) => void
  onMoveRotateStateChange?: (moving: boolean, rotating: boolean) => void
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

export default function Canvas({ 
  selectedTool, 
  isCalibrating = false, 
  onCalibrationComplete, 
  satelliteImageData,
  selectedEquipmentId: propSelectedEquipmentId,
  isMovingEquipment: propIsMovingEquipment = false,
  isRotatingEquipment: propIsRotatingEquipment = false,
  onEquipmentSelectionChange,
  onMoveRotateStateChange
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [equipment, setEquipment] = useState<CanvasEquipmentItem[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [editingEquipment, setEditingEquipment] = useState<CanvasEquipmentItem | null>(null)
  const [isPropertyEditorOpen, setIsPropertyEditorOpen] = useState(false)
  
  // Equipment move and rotate state - sync with page-level props
  const [isMovingEquipment, setIsMovingEquipment] = useState(propIsMovingEquipment)
  const [movingEquipmentId, setMovingEquipmentId] = useState<string | null>(propSelectedEquipmentId || null)
  const [moveStartPos, setMoveStartPos] = useState({ x: 0, y: 0 })
  const [isRotatingEquipment, setIsRotatingEquipment] = useState(propIsRotatingEquipment)
  const [rotatingEquipmentId, setRotatingEquipmentId] = useState<string | null>(propSelectedEquipmentId || null)
  
  // Sync local state with page-level props
  useEffect(() => {
    setIsMovingEquipment(propIsMovingEquipment)
    setIsRotatingEquipment(propIsRotatingEquipment)
    if (propIsMovingEquipment) {
      setMovingEquipmentId(propSelectedEquipmentId || null)
    }
    if (propIsRotatingEquipment) {
      setRotatingEquipmentId(propSelectedEquipmentId || null)
    }
  }, [propIsMovingEquipment, propIsRotatingEquipment, propSelectedEquipmentId])
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
  
  // Unified drag context
  const { dragState } = useUnifiedDrag()
  const { isDragging: isRobustDragging, dragItem: draggedItem } = dragState
  
  // Zoom and pan handlers
  const handleZoomIn = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) {
      // Fallback: simple zoom without offset calculation
      const newScale = Math.min((scale || 1) * 1.2, 10)
      if (isFinite(newScale) && !isNaN(newScale)) {
        setScale(newScale)
        console.log('🔍 Zoom In (fallback):', { newScale: newScale.toFixed(2) })
      }
      return
    }
    
    // Validate current scale and offset
    const currentScale = isFinite(scale) && !isNaN(scale) ? scale : 1
    const currentOffsetX = isFinite(offset.x) && !isNaN(offset.x) ? offset.x : 0
    const currentOffsetY = isFinite(offset.y) && !isNaN(offset.y) ? offset.y : 0
    
    // Zoom towards center of canvas
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const zoomFactor = 1.2
    const newScale = Math.min(currentScale * zoomFactor, 10)
    
    // Calculate new offset to zoom towards center with validation
    let newOffsetX = centerX - (centerX - currentOffsetX) * (newScale / currentScale)
    let newOffsetY = centerY - (centerY - currentOffsetY) * (newScale / currentScale)
    
    // Validate calculated offsets
    if (!isFinite(newOffsetX) || isNaN(newOffsetX)) newOffsetX = 0
    if (!isFinite(newOffsetY) || isNaN(newOffsetY)) newOffsetY = 0
    
    const newOffset = { x: newOffsetX, y: newOffsetY }
    
    setScale(newScale)
    setOffset(newOffset)
    console.log('🔍 Zoom In:', { 
      newScale: newScale.toFixed(2),
      newOffset: { x: newOffset.x.toFixed(1), y: newOffset.y.toFixed(1) }
    })
  }, [scale, offset])
  
  const handleZoomOut = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) {
      // Fallback: simple zoom without offset calculation
      const newScale = Math.max((scale || 1) / 1.2, 0.1)
      if (isFinite(newScale) && !isNaN(newScale)) {
        setScale(newScale)
        console.log('🔍 Zoom Out (fallback):', { newScale: newScale.toFixed(2) })
      }
      return
    }
    
    // Validate current scale and offset
    const currentScale = isFinite(scale) && !isNaN(scale) ? scale : 1
    const currentOffsetX = isFinite(offset.x) && !isNaN(offset.x) ? offset.x : 0
    const currentOffsetY = isFinite(offset.y) && !isNaN(offset.y) ? offset.y : 0
    
    // Zoom towards center of canvas
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const zoomFactor = 0.8
    const newScale = Math.max(currentScale * zoomFactor, 0.1)
    
    // Calculate new offset to zoom towards center with validation
    let newOffsetX = centerX - (centerX - currentOffsetX) * (newScale / currentScale)
    let newOffsetY = centerY - (centerY - currentOffsetY) * (newScale / currentScale)
    
    // Validate calculated offsets
    if (!isFinite(newOffsetX) || isNaN(newOffsetX)) newOffsetX = 0
    if (!isFinite(newOffsetY) || isNaN(newOffsetY)) newOffsetY = 0
    
    const newOffset = { x: newOffsetX, y: newOffsetY }
    
    setScale(newScale)
    setOffset(newOffset)
    console.log('🔍 Zoom Out:', { 
      newScale: newScale.toFixed(2),
      newOffset: { x: newOffset.x.toFixed(1), y: newOffset.y.toFixed(1) }
    })
  }, [scale, offset])
  
  const handleResetView = useCallback(() => {
    // Always use safe, validated values
    const safeScale = 1
    const safeOffset = { x: 0, y: 0 }
    
    setScale(safeScale)
    setOffset(safeOffset)
    console.log('🏠 Reset View: Scale 1.0, Offset (0,0)')
  }, [])
  
  const handleFitToScreen = useCallback(() => {
    if (equipment.length === 0) {
      // If no equipment, show a reasonable default view
      setScale(1)
      setOffset({ x: 0, y: 0 })
      console.log('📐 Fit to Screen: No equipment, showing default view')
      return
    }
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) {
      console.warn('📐 Fit to Screen: Invalid container rect')
      return
    }
    
    // Calculate bounding box of all equipment with proper validation
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let validEquipmentCount = 0
    
    equipment.forEach(item => {
      // Validate equipment position
      if (typeof item.x !== 'number' || typeof item.y !== 'number' || 
          isNaN(item.x) || isNaN(item.y)) {
        console.warn('Invalid equipment position:', item)
        return
      }
      
      const width = Math.max(item.width || 40, 10)  // Minimum 10px width
      const height = Math.max(item.height || 40, 10)  // Minimum 10px height
      const left = item.x - width / 2
      const right = item.x + width / 2
      const top = item.y - height / 2
      const bottom = item.y + height / 2
      
      minX = Math.min(minX, left)
      minY = Math.min(minY, top)
      maxX = Math.max(maxX, right)
      maxY = Math.max(maxY, bottom)
      validEquipmentCount++
    })
    
    // If no valid equipment found, reset view
    if (validEquipmentCount === 0) {
      setScale(1)
      setOffset({ x: 0, y: 0 })
      console.log('📐 Fit to Screen: No valid equipment found')
      return
    }
    
    // Validate bounds
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      console.warn('📐 Fit to Screen: Invalid bounds calculated')
      setScale(1)
      setOffset({ x: 0, y: 0 })
      return
    }
    
    // Calculate content dimensions
    const contentWidth = Math.max(maxX - minX, 40)  // Minimum based on equipment size
    const contentHeight = Math.max(maxY - minY, 40)
    
    // Use generous padding to prevent over-zooming
    const paddingX = Math.max(rect.width * 0.2, 100)  // 20% padding, minimum 100px
    const paddingY = Math.max(rect.height * 0.2, 100)
    
    // Calculate available space
    const availableWidth = Math.max(rect.width - (paddingX * 2), 200)
    const availableHeight = Math.max(rect.height - (paddingY * 2), 200)
    
    // Calculate scale with validation
    const scaleX = availableWidth / contentWidth
    const scaleY = availableHeight / contentHeight
    
    // Use the smaller scale, but be conservative to prevent over-zooming
    let calculatedScale = Math.min(scaleX, scaleY)
    
    // Conservative zoom limits: don't zoom in beyond 150% or out below 20%
    let newScale = Math.max(Math.min(calculatedScale, 1.5), 0.2)
    
    // If the calculated scale is close to current scale, don't change much
    const currentScale = isFinite(scale) && !isNaN(scale) ? scale : 1
    if (Math.abs(newScale - currentScale) < 0.1) {
      // If the difference is small, just center without changing scale
      newScale = currentScale
    }
    
    // For single items that are small, prefer to keep at 100% zoom if reasonable
    if (validEquipmentCount === 1 && newScale > 1.2) {
      newScale = Math.min(newScale, 1.2)  // Cap at 120% for single items
    }
    
    // Validate scale
    if (!isFinite(newScale) || isNaN(newScale)) {
      console.warn('📐 Fit to Screen: Invalid scale calculated')
      newScale = 1
    }
    
    // Calculate center point of all equipment
    const contentCenterX = (minX + maxX) / 2
    const contentCenterY = (minY + maxY) / 2
    
    // Calculate offset to center the equipment with validation
    let newOffsetX = rect.width / 2 - contentCenterX * newScale
    let newOffsetY = rect.height / 2 - contentCenterY * newScale
    
    // Validate offsets
    if (!isFinite(newOffsetX) || isNaN(newOffsetX)) newOffsetX = 0
    if (!isFinite(newOffsetY) || isNaN(newOffsetY)) newOffsetY = 0
    
    const newOffset = { x: newOffsetX, y: newOffsetY }
    
    setScale(newScale)
    setOffset(newOffset)
    
    console.log('📐 Fit to Screen:', { 
      equipmentCount: validEquipmentCount,
      contentBounds: { minX: minX.toFixed(1), minY: minY.toFixed(1), maxX: maxX.toFixed(1), maxY: maxY.toFixed(1) },
      contentSize: { width: contentWidth.toFixed(1), height: contentHeight.toFixed(1) },
      calculatedScale: calculatedScale.toFixed(2),
      finalScale: newScale.toFixed(2),
      newOffset: { x: newOffset.x.toFixed(1), y: newOffset.y.toFixed(1) },
      reasoning: validEquipmentCount === 1 ? 'Single item - conservative zoom' : 'Multiple items - fit all'
    })
  }, [equipment, scale])
  
  const handleMaxOut = useCallback(() => {
    // Zoom out to minimum scale and center view with safe values
    const safeMinScale = 0.1
    const safeOffset = { x: 0, y: 0 }
    
    // Validate values before setting
    if (isFinite(safeMinScale) && !isNaN(safeMinScale)) {
      setScale(safeMinScale)
      setOffset(safeOffset)
      console.log('⛶ Max Out: Minimum scale', { scale: safeMinScale })
    } else {
      console.warn('⛶ Max Out: Invalid scale, using fallback')
      setScale(0.5)
      setOffset({ x: 0, y: 0 })
    }
  }, [])
  
  // Equipment interaction handlers
  const handleEquipmentClick = useCallback((equipmentId: string, event?: { shiftKey?: boolean, ctrlKey?: boolean, button?: number }) => {
    console.log('Equipment clicked:', equipmentId, 'button:', event?.button)
    const clickedEquipment = equipment.find(item => item.id === equipmentId)
    console.log('Found equipment:', clickedEquipment)
    if (clickedEquipment) {
      setSelectedEquipment(equipmentId)
      
      // Notify page level of selection change
      onEquipmentSelectionChange?.(equipmentId)
      
      // If Shift key is held, start move mode
      if (event?.shiftKey) {
        setIsMovingEquipment(true)
        setMovingEquipmentId(equipmentId)
        onMoveRotateStateChange?.(true, false)
        console.log('🔄 Starting move mode for:', clickedEquipment.name)
      }
      // If Ctrl key is held, start rotate mode
      else if (event?.ctrlKey) {
        setIsRotatingEquipment(true)
        setRotatingEquipmentId(equipmentId)
        onMoveRotateStateChange?.(false, true)
        console.log('🔄 Starting rotate mode for:', clickedEquipment.name)
      }
      // Right-click (button 2) opens property editor
      else if (event?.button === 2) {
        setEditingEquipment(clickedEquipment)
        setIsPropertyEditorOpen(true)
        console.log('Property editor opened for:', clickedEquipment.name)
      }
      // Normal left-click just selects the equipment
      else {
        console.log('Equipment selected:', clickedEquipment.name)
      }
    }
  }, [equipment, onEquipmentSelectionChange, onMoveRotateStateChange])
  
  const handleEquipmentSave = useCallback((updatedEquipment: CanvasEquipmentItem) => {
    setEquipment(prev => prev.map(item => 
      item.id === updatedEquipment.id ? updatedEquipment : item
    ))
    setEditingEquipment(null)
    setIsPropertyEditorOpen(false)
  }, [])
  
  const handlePropertyEditorClose = useCallback(() => {
    setEditingEquipment(null)
    setIsPropertyEditorOpen(false)
  }, [])
  
  const handleEquipmentDelete = useCallback((equipmentId: string) => {
    setEquipment(prev => prev.filter(item => item.id !== equipmentId))
    if (selectedEquipment === equipmentId) {
      setSelectedEquipment(null)
    }
  }, [selectedEquipment])
  
  useEffect(() => {
    if (selectedEquipment) {
      const selectedItem = equipment.find(item => item.id === selectedEquipment)
      if (selectedItem) {
        setEditingEquipment(selectedItem)
      }
    }
  }, [selectedEquipment, equipment])
  

  
  // Equipment move handlers
  const handleEquipmentMove = useCallback((equipmentId: string, newPosition: { x: number, y: number }) => {
    setEquipment(prev => prev.map(item => 
      item.id === equipmentId 
        ? { ...item, x: newPosition.x, y: newPosition.y }
        : item
    ))
    console.log('📍 Equipment moved:', equipmentId, 'to:', newPosition)
  }, [])
  
  const handleEquipmentRotate = useCallback((equipmentId: string, newRotation: number) => {
    setEquipment(prev => prev.map(item => 
      item.id === equipmentId 
        ? { ...item, rotation: newRotation }
        : item
    ))
    console.log('🔄 Equipment rotated:', equipmentId, 'to:', newRotation, 'degrees')
  }, [])
  
  const stopMoveRotate = useCallback(() => {
    setIsMovingEquipment(false)
    setMovingEquipmentId(null)
    setIsRotatingEquipment(false)
    setRotatingEquipmentId(null)
    console.log('✅ Stopped move/rotate mode')
  }, [])
  
  // Keyboard shortcuts for move/rotate modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to exit move/rotate modes
      if (e.key === 'Escape') {
        stopMoveRotate()
        return
      }
      
      // Only handle shortcuts if equipment is selected
      if (!selectedEquipment) return
      
      // M key for move mode
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setIsMovingEquipment(true)
        setMovingEquipmentId(selectedEquipment)
        setIsRotatingEquipment(false)
        setRotatingEquipmentId(null)
        console.log('🔄 Move mode activated via keyboard')
      }
      
      // R key for rotate mode
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        setIsRotatingEquipment(true)
        setRotatingEquipmentId(selectedEquipment)
        setIsMovingEquipment(false)
        setMovingEquipmentId(null)
        console.log('🔄 Rotate mode activated via keyboard')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedEquipment, stopMoveRotate])
  
  // Mouse wheel zoom handler
  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Calculate zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor))
    
    // Calculate new offset to zoom towards mouse position
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * (newScale / scale),
      y: mouseY - (mouseY - offset.y) * (newScale / scale)
    }
    
    setScale(newScale)
    setOffset(newOffset)
  }, [scale, offset])



  // Pan handlers for middle mouse button or space+drag
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // If in move mode and clicking on moving equipment, start move
    if (isMovingEquipment && movingEquipmentId) {
      const canvasX = (mouseX / scale) - offset.x
      const canvasY = (mouseY / scale) - offset.y
      setMoveStartPos({ x: canvasX, y: canvasY })
      return
    }
    
    // Pan mode (middle mouse or Ctrl+left click)
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
  }, [offset, isMovingEquipment, movingEquipmentId, scale])
  
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Handle equipment movement
    if (isMovingEquipment && movingEquipmentId) {
      e.preventDefault()
      const canvasX = (mouseX / scale) - offset.x
      const canvasY = (mouseY / scale) - offset.y
      handleEquipmentMove(movingEquipmentId, { x: canvasX, y: canvasY })
      return
    }
    
    // Handle equipment rotation
    if (isRotatingEquipment && rotatingEquipmentId) {
      e.preventDefault()
      const targetEquipment = equipment.find(item => item.id === rotatingEquipmentId)
      if (targetEquipment) {
        // Convert screen coordinates to canvas coordinates
        const canvasX = (mouseX - offset.x) / scale
        const canvasY = (mouseY - offset.y) / scale
        const centerX = targetEquipment.x
        const centerY = targetEquipment.y
        
        // Calculate angle from equipment center to mouse position
        const deltaX = canvasX - centerX
        const deltaY = canvasY - centerY
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
        
        // Normalize angle to 0-360 degrees
        const normalizedAngle = ((angle % 360) + 360) % 360
        
        console.log('🔄 Rotating equipment:', rotatingEquipmentId, 'to angle:', normalizedAngle.toFixed(1))
        handleEquipmentRotate(rotatingEquipmentId, normalizedAngle)
      }
      return
    }
    
    // Handle canvas panning
    if (isPanning) {
      e.preventDefault()
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
    }
  }, [isPanning, panStart, isMovingEquipment, movingEquipmentId, isRotatingEquipment, rotatingEquipmentId, scale, offset, handleEquipmentMove, handleEquipmentRotate])
  
  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    // Stop move/rotate modes
    if (isMovingEquipment || isRotatingEquipment) {
      stopMoveRotate()
      return
    }
    
    // Stop panning
    if (e.button === 1 || isPanning) {
      setIsPanning(false)
    }
  }, [isPanning, isMovingEquipment, isRotatingEquipment, stopMoveRotate])
  
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
    
    // Draw adaptive grid that adjusts to zoom level
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = Math.max(0.5 / scale, 0.1)
    
    // Adaptive grid size based on zoom level to prevent nested grids
    let baseGridSize = 20
    let gridSize = baseGridSize
    
    // Adjust grid size based on scale to prevent overcrowding
    if (scale < 0.5) {
      gridSize = baseGridSize * 4 // Larger grid when zoomed out
    } else if (scale < 0.25) {
      gridSize = baseGridSize * 8 // Even larger grid when very zoomed out
    } else if (scale < 0.1) {
      gridSize = baseGridSize * 16 // Very large grid when extremely zoomed out
    }
    
    // Calculate grid bounds
    const startX = Math.floor(-offset.x / scale / gridSize) * gridSize
    const startY = Math.floor(-offset.y / scale / gridSize) * gridSize
    const endX = startX + (canvas.width / scale) + gridSize
    const endY = startY + (canvas.height / scale) + gridSize
    
    // Only draw grid if it won't be too dense
    const gridSpacingInPixels = gridSize * scale
    if (gridSpacingInPixels >= 5) { // Only draw if grid lines are at least 5 pixels apart
      // Draw vertical grid lines
      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }
      
      // Draw horizontal grid lines
      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
      }
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

  // Canvas tool functions removed - using improved versions above

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
    onCalibrationComplete?.()
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
      onWheel={handleCanvasWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      style={{ 
        touchAction: 'none',
        position: 'relative',
        cursor: isPanning ? 'grabbing' : 'grab'
      }}>
      {useRobustCanvas ? (
        // New robust canvas implementation with timing fixes
        <RobustCanvas
          width={canvasSize.width}
          height={canvasSize.height}
          equipment={equipment}
          onEquipmentUpdate={setEquipment}
          onEquipmentClick={handleEquipmentClick}
          scale={scale}
          offset={offset}
          className="w-full h-full"
          selectedEquipmentId={selectedEquipment}
          isMovingEquipment={isMovingEquipment}
          isRotatingEquipment={isRotatingEquipment}
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
      
      {/* Instructions - DISABLED FOR TESTING */}
      {false && equipment.length === 0 && !calibrationState.isActive && (
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
      
      {/* Equipment Property Editor */}
      <EquipmentPropertyEditor
        equipment={editingEquipment}
        isOpen={isPropertyEditorOpen}
        onClose={handlePropertyEditorClose}
        onSave={handleEquipmentSave}
      />

    </div>
  )
}
