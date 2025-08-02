'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { isValidDragTarget, getDeviceUtils, calculateDistance } from '../utils/domHelpers'
import type { EquipmentItem } from '../lib/equipmentDatabase'

interface DragState {
  isDragging: boolean
  dragType: string | null
  dragItem: EquipmentItem | null
  startPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  previewVisible: boolean
}

interface DragRefs {
  startPos: { x: number; y: number } | null
  threshold: number
  isClick: boolean
  dragStarted: boolean
}

interface DropResult {
  onDrop?: (item: EquipmentItem, position: { x: number; y: number }) => void
  onSingleClickPlace?: (item: EquipmentItem, position: { x: number; y: number }) => void
}

interface UnifiedDragContextType {
  dragState: DragState
  isMobile: boolean
  isIOS: boolean
  startDrag: (item: EquipmentItem, itemType: string, startPos: { x: number; y: number }) => void
  updateDragPosition: (currentPos: { x: number; y: number }) => void
  endDrag: (dropResult?: DropResult) => { wasClick: boolean; hadDragItem: boolean }
  resetDragState: () => void
  // Mouse handlers
  handleMouseDown: (e: React.MouseEvent, item: EquipmentItem, itemType: string) => boolean
  handleMouseMove: (e: MouseEvent) => void
  handleMouseUp: (e: MouseEvent, dropResult?: DropResult) => void
  // Touch handlers
  handleTouchStart: (e: React.TouchEvent, item: EquipmentItem, itemType: string) => void
  handleTouchMove: (e: TouchEvent) => void
  handleTouchEnd: (e: TouchEvent, dropResult?: DropResult) => void
}

const UnifiedDragContext = createContext<UnifiedDragContextType | null>(null)

export const UnifiedDragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    dragItem: null,
    startPosition: null,
    currentPosition: null,
    previewVisible: false
  })
  
  const dragRefs = useRef<DragRefs>({
    startPos: null,
    threshold: 5, // 5 pixel threshold for drag detection
    isClick: true,
    dragStarted: false
  })

  // Device detection - client-side only
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, isIOS: false })
  
  useEffect(() => {
    // Only detect device on client-side
    const utils = getDeviceUtils()
    setDeviceInfo({ isMobile: utils.isMobile, isIOS: utils.isIOS })
  }, [])
  
  const { isMobile, isIOS } = deviceInfo
  
  const resetDragState = useCallback(() => {
    console.log('🔄 UNIFIED_DRAG: Resetting drag state')
    
    setDragState({
      isDragging: false,
      dragType: null,
      dragItem: null,
      startPosition: null,
      currentPosition: null,
      previewVisible: false
    })
    
    // Reset cursor
    document.body.style.cursor = 'default'
    
    // Clear drag refs
    dragRefs.current = {
      startPos: null,
      threshold: 5,
      isClick: true,
      dragStarted: false
    }
  }, [])

  const startDrag = useCallback((item: EquipmentItem, itemType: string, startPos: { x: number; y: number }) => {
    console.log('🚀 UNIFIED_DRAG: Starting drag for:', item.name, 'at:', startPos)
    
    dragRefs.current.startPos = startPos
    dragRefs.current.isClick = true
    dragRefs.current.dragStarted = false
    
    setDragState({
      isDragging: false, // Don't set true until threshold met
      dragType: itemType,
      dragItem: item,
      startPosition: startPos,
      currentPosition: startPos,
      previewVisible: false
    })
    
    document.body.style.cursor = 'grabbing'
  }, [])

  const updateDragPosition = useCallback((currentPos: { x: number; y: number }) => {
    if (!dragRefs.current.startPos || !dragState.dragItem) return
    
    const distance = calculateDistance(dragRefs.current.startPos, currentPos)
    
    // Check if we've exceeded drag threshold
    if (!dragRefs.current.dragStarted && distance > dragRefs.current.threshold) {
      console.log('🎯 UNIFIED_DRAG: Threshold exceeded, starting visual drag')
      dragRefs.current.isClick = false
      dragRefs.current.dragStarted = true
      
      setDragState(prev => ({
        ...prev,
        isDragging: true,
        previewVisible: true,
        currentPosition: currentPos
      }))
    } else if (dragRefs.current.dragStarted) {
      // Update position during drag
      setDragState(prev => ({
        ...prev,
        currentPosition: currentPos
      }))
    }
  }, [dragState.dragItem])

  const endDrag = useCallback((dropResult?: DropResult) => {
    const wasClick = dragRefs.current.isClick
    const hadDragItem = !!dragState.dragItem
    const currentPos = dragState.currentPosition
    
    console.log('🏁 UNIFIED_DRAG: Ending drag', { wasClick, hadDragItem, currentPos })
    
    if (hadDragItem && currentPos) {
      if (wasClick && dropResult?.onSingleClickPlace) {
        // Single-click-to-place behavior
        console.log('👆 UNIFIED_DRAG: Single click place')
        dropResult.onSingleClickPlace(dragState.dragItem!, currentPos)
      } else if (dragRefs.current.dragStarted && dropResult?.onDrop) {
        // Standard drag-and-drop
        console.log('🎯 UNIFIED_DRAG: Standard drop')
        dropResult.onDrop(dragState.dragItem!, currentPos)
      }
    }
    
    resetDragState()
    
    return { wasClick, hadDragItem }
  }, [dragState, resetDragState])

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, item: EquipmentItem, itemType: string): boolean => {
    if (!isValidDragTarget(e.target)) {
      console.log('❌ UNIFIED_DRAG: Invalid drag target')
      return false
    }
    
    // Only left mouse button triggers drag
    if (e.button !== 0) return false
    
    console.log('🖱️ UNIFIED_DRAG: Mouse down on:', item.name)
    e.preventDefault()
    startDrag(item, itemType, { x: e.clientX, y: e.clientY })
    return true
  }, [startDrag])
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.dragItem) {
      updateDragPosition({ x: e.clientX, y: e.clientY })
    }
  }, [dragState.dragItem, updateDragPosition])
  
  const handleMouseUp = useCallback((e: MouseEvent, dropResult?: DropResult) => {
    if (dragState.dragItem) {
      console.log('🖱️ UNIFIED_DRAG: Mouse up')
      endDrag(dropResult)
    }
  }, [dragState.dragItem, endDrag])

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent, item: EquipmentItem, itemType: string) => {
    console.log('👆 UNIFIED_DRAG: Touch start on:', item.name)
    
    // Prevent scrolling while dragging
    e.preventDefault()
    
    const touch = e.touches[0]
    startDrag(item, itemType, { x: touch.clientX, y: touch.clientY })
  }, [startDrag])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (dragState.dragItem && e.touches.length > 0) {
      const touch = e.touches[0]
      updateDragPosition({ x: touch.clientX, y: touch.clientY })
    }
  }, [dragState.dragItem, updateDragPosition])
  
  const handleTouchEnd = useCallback((e: TouchEvent, dropResult?: DropResult) => {
    if (dragState.dragItem) {
      console.log('👆 UNIFIED_DRAG: Touch end')
      endDrag(dropResult)
    }
  }, [dragState.dragItem, endDrag])

  // Global event listeners for drag operations
  useEffect(() => {
    if (dragState.dragItem) {
      const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e)
      const mouseUpHandler = (e: MouseEvent) => handleMouseUp(e)
      const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e)
      const touchEndHandler = (e: TouchEvent) => handleTouchEnd(e)
      
      if (!isMobile) {
        document.addEventListener('mousemove', mouseMoveHandler)
        document.addEventListener('mouseup', mouseUpHandler)
      } else {
        document.addEventListener('touchmove', touchMoveHandler, { passive: false })
        document.addEventListener('touchend', touchEndHandler)
      }
      
      return () => {
        if (!isMobile) {
          document.removeEventListener('mousemove', mouseMoveHandler)
          document.removeEventListener('mouseup', mouseUpHandler)
        } else {
          document.removeEventListener('touchmove', touchMoveHandler)
          document.removeEventListener('touchend', touchEndHandler)
        }
      }
    }
  }, [dragState.dragItem, isMobile, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const value: UnifiedDragContextType = {
    dragState,
    isMobile,
    isIOS,
    startDrag,
    updateDragPosition,
    endDrag,
    resetDragState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }

  return (
    <UnifiedDragContext.Provider value={value}>
      {children}
    </UnifiedDragContext.Provider>
  )
}

export const useUnifiedDrag = (): UnifiedDragContextType => {
  const context = useContext(UnifiedDragContext)
  if (!context) {
    throw new Error('useUnifiedDrag must be used within UnifiedDragProvider')
  }
  return context
}
