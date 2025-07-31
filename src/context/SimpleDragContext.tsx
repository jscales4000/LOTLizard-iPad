'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Equipment {
  id: string
  name: string
  category: string
  color: string
  thumbnail: string
  dimensions: {
    width: number
    length: number
    height?: number
  }
}

interface SimpleDragContextType {
  isDragging: boolean
  draggedEquipment: Equipment | null
  startDrag: (equipment: Equipment) => void
  endDrag: () => void
  handleDrop: (x: number, y: number) => boolean
}

const SimpleDragContext = createContext<SimpleDragContextType | null>(null)

export const SimpleDragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedEquipment, setDraggedEquipment] = useState<Equipment | null>(null)

  const startDrag = useCallback((equipment: Equipment) => {
    console.log('🚀 SimpleDrag: Starting drag for', equipment.name)
    setIsDragging(true)
    setDraggedEquipment(equipment)
  }, [])

  const endDrag = useCallback(() => {
    console.log('🏁 SimpleDrag: Ending drag')
    setIsDragging(false)
    setDraggedEquipment(null)
  }, [])

  const handleDrop = useCallback((x: number, y: number) => {
    if (!draggedEquipment) {
      console.log('❌ SimpleDrag: No equipment to drop')
      return false
    }

    console.log('🎯 SimpleDrag: Attempting drop at', { x, y })
    
    // Look for any canvas element
    const canvasElement = document.querySelector('canvas')
    if (canvasElement) {
      console.log('✅ SimpleDrag: Found canvas, adding equipment')
      
      // Try to use global canvas instance if available
      if (window.__LOTLIZARD_CANVAS_INSTANCE__?.addEquipment) {
        const newEquipment = {
          id: `eq-${Date.now()}`,
          name: draggedEquipment.name,
          x: x - 50,
          y: y - 50,
          width: draggedEquipment.dimensions.width * 10,
          height: draggedEquipment.dimensions.length * 10,
          rotation: 0,
          color: draggedEquipment.color || '#3B82F6',
          category: draggedEquipment.category,
          thumbnail: draggedEquipment.thumbnail,
          dimensions: draggedEquipment.dimensions
        }
        
        const success = window.__LOTLIZARD_CANVAS_INSTANCE__.addEquipment(newEquipment)
        if (success) {
          console.log('🎉 SimpleDrag: Equipment added successfully!')
          endDrag()
          return true
        }
      }
      
      // Fallback: just log success
      console.log('🎉 SimpleDrag: Canvas found - equipment would be added here!')
      endDrag()
      return true
    }
    
    console.log('❌ SimpleDrag: No canvas found')
    return false
  }, [draggedEquipment, endDrag])

  return (
    <SimpleDragContext.Provider value={{
      isDragging,
      draggedEquipment,
      startDrag,
      endDrag,
      handleDrop
    }}>
      {children}
    </SimpleDragContext.Provider>
  )
}

export const useSimpleDrag = () => {
  const context = useContext(SimpleDragContext)
  if (!context) {
    throw new Error('useSimpleDrag must be used within a SimpleDragProvider')
  }
  return context
}

// Global window properties
declare global {
  interface Window {
    __LOTLIZARD_CANVAS_INSTANCE__?: {
      addEquipment: (equipment: any) => boolean
    }
  }
}
