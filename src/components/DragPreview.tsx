'use client'

import React, { useEffect, useState } from 'react'
import { EquipmentItem } from '@/lib/equipmentDatabase'

interface DragPreviewProps {
  item: EquipmentItem | null
  isDragging: boolean
}

export const DragPreview: React.FC<DragPreviewProps> = ({ item, isDragging }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isDragging])

  if (!isDragging || !item) return null

  return (
    <div
      className="fixed pointer-events-none z-50 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="text-sm font-medium">{item.name}</div>
      <div className="text-xs opacity-75">{item.category}</div>
    </div>
  )
}
