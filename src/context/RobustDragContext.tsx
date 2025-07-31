'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { EquipmentItem } from '@/lib/equipmentDatabase'
import { findCanvasContainer, debugDragDrop } from '@/lib/domUtils'
import { DragPreview } from '@/components/DragPreview'

interface RobustDragState {
  isDragging: boolean
  draggedItem: EquipmentItem | null
  canvasReady: boolean
  canvasContainer: HTMLElement | null
}

interface RobustDragContextType {
  // State
  isDragging: boolean
  draggedItem: EquipmentItem | null
  canvasReady: boolean
  canvasContainer: HTMLElement | null
  
  // Actions
  initiateDrag: (item: EquipmentItem, startPosition: { x: number; y: number }) => void
  completeDrop: (position?: { x: number; y: number }) => boolean
  cancelDrag: () => void
  setCanvasReady: (ready: boolean, container?: HTMLElement | null) => void
  
  // Debug
  debugState: () => void
}

const RobustDragContext = createContext<RobustDragContextType | null>(null)

export const useRobustDrag = () => {
  const context = useContext(RobustDragContext)
  if (!context) {
    throw new Error('useRobustDrag must be used within a RobustDragProvider')
  }
  return context
}

interface RobustDragProviderProps {
  children: React.ReactNode
}

export const RobustDragProvider: React.FC<RobustDragProviderProps> = ({ 
  children
}) => {
  const [dragState, setDragState] = useState<RobustDragState>({
    isDragging: false,
    draggedItem: null,
    canvasReady: false,
    canvasContainer: null
  })

  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })

  const initiateDrag = useCallback((item: EquipmentItem, startPosition: { x: number; y: number }) => {
    console.log('🚀 RobustDrag: Initiating drag for:', item.name)
    
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: item
    }))
    
    setDragPosition(startPosition)
    
    // Set up global mouse/touch move listeners for drag preview
    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY })
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setDragPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    // Store cleanup functions
    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
    }
    
    // Store cleanup function for later use
    ;(window as any).__DRAG_CLEANUP__ = cleanup
    
    debugDragDrop.logCanvasState()
  }, [])

  const completeDrop = useCallback((position?: { x: number; y: number }): boolean => {
    console.log('🎯 RobustDrag: Attempting to complete drop', { position, dragState })
    
    // Clean up drag event listeners
    if ((window as any).__DRAG_CLEANUP__) {
      (window as any).__DRAG_CLEANUP__()
      delete (window as any).__DRAG_CLEANUP__
    }
    
    if (!dragState.isDragging || !dragState.draggedItem) {
      console.log('❌ RobustDrag: No active drag operation')
      return false
    }

    // Find canvas container at drop time (most reliable)
    const container = findCanvasContainer()
    if (!container) {
      console.log('❌ RobustDrag: No canvas container found at drop time')
      debugDragDrop.logCanvasState()
      // Clear drag state even if drop failed
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedItem: null
      }))
      return false
    }

    // Check if drop position is within canvas bounds
    const rect = container.getBoundingClientRect()
    const dropPosition = position || dragPosition
    
    const isWithinCanvas = dropPosition.x >= rect.left && 
                          dropPosition.x <= rect.right && 
                          dropPosition.y >= rect.top && 
                          dropPosition.y <= rect.bottom
    
    if (!isWithinCanvas) {
      console.log('❌ RobustDrag: Drop position outside canvas bounds')
      // Clear drag state
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedItem: null
      }))
      return false
    }

    // Convert screen coordinates to canvas-relative coordinates
    const canvasPosition = {
      x: dropPosition.x - rect.left,
      y: dropPosition.y - rect.top
    }

    console.log('✅ RobustDrag: Adding equipment to canvas', {
      item: dragState.draggedItem.name,
      screenPosition: dropPosition,
      canvasPosition,
      container: container.id || container.className
    })

    // Clear drag state FIRST to prevent UI lag
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      draggedItem: null
    }))

    // Equipment addition will be handled by the canvas component
    // through a global callback mechanism
    if (window.__LOTLIZARD_ADD_EQUIPMENT__) {
      window.__LOTLIZARD_ADD_EQUIPMENT__(dragState.draggedItem, canvasPosition)
    }

    return true
  }, [dragState, dragPosition])

  const cancelDrag = useCallback(() => {
    console.log('🚫 RobustDrag: Canceling drag operation')
    
    // Clean up drag event listeners
    if ((window as any).__DRAG_CLEANUP__) {
      (window as any).__DRAG_CLEANUP__()
      delete (window as any).__DRAG_CLEANUP__
    }
    
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      draggedItem: null
    }))
  }, [])

  const setCanvasReady = useCallback((ready: boolean, container?: HTMLElement | null) => {
    console.log('📋 RobustDrag: Setting canvas ready state:', { ready, hasContainer: !!container })
    
    setDragState(prev => ({
      ...prev,
      canvasReady: ready,
      canvasContainer: container || prev.canvasContainer
    }))
  }, [])

  const debugState = useCallback(() => {
    console.log('🔍 RobustDrag State:', dragState)
    debugDragDrop.logCanvasState()
  }, [dragState])

  const contextValue: RobustDragContextType = {
    // State
    isDragging: dragState.isDragging,
    draggedItem: dragState.draggedItem,
    canvasReady: dragState.canvasReady,
    canvasContainer: dragState.canvasContainer,
    
    // Actions
    initiateDrag,
    completeDrop,
    cancelDrag,
    setCanvasReady,
    
    // Debug
    debugState
  }

  return (
    <RobustDragContext.Provider value={contextValue}>
      {children}
      <DragPreview 
        item={dragState.draggedItem} 
        isDragging={dragState.isDragging}
      />
    </RobustDragContext.Provider>
  )
}
