'use client'

import React from 'react'

// We use explicit require() instead of imports to avoid SSR issues
let Line: any
let Group: any

// Only import Konva on the client side
if (typeof window !== 'undefined') {
  const reactKonva = require('react-konva')
  Line = reactKonva.Line
  Group = reactKonva.Group
}

interface KonvaGridProps {
  width: number
  height: number
  gridSize?: number
  gridColor?: string
  majorGridInterval?: number
  majorGridColor?: string
  scale: number
  offset: { x: number, y: number }
}

/**
 * KonvaGrid - A grid component for the Konva canvas
 * Renders a customizable grid pattern with major and minor lines
 */
export function KonvaGrid({
  width,
  height,
  gridSize = 20,
  gridColor = '#e5e7eb',
  majorGridInterval = 5,
  majorGridColor = '#d1d5db',
  scale,
  offset
}: KonvaGridProps) {
  // Calculate grid boundaries based on viewport
  const startX = Math.floor(-offset.x / scale / gridSize) * gridSize - gridSize * 2
  const startY = Math.floor(-offset.y / scale / gridSize) * gridSize - gridSize * 2
  const endX = startX + (width / scale) + gridSize * 4
  const endY = startY + (height / scale) + gridSize * 4
  
  // Create grid lines
  const gridLines = []
  
  // Check if Konva components are available (client-side only)
  if (typeof window === 'undefined' || !Line || !Group) {
    return null
  }
  
  // Vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    const isMajor = x % (gridSize * majorGridInterval) === 0
    gridLines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={isMajor ? majorGridColor : gridColor}
        strokeWidth={isMajor ? 0.5 : 0.5}
        perfectDrawEnabled={false}
        listening={false} // Disable events for performance
      />
    )
  }
  
  // Horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    const isMajor = y % (gridSize * majorGridInterval) === 0
    gridLines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={isMajor ? majorGridColor : gridColor}
        strokeWidth={isMajor ? 0.5 : 0.5}
        perfectDrawEnabled={false}
        listening={false} // Disable events for performance
      />
    )
  }
  
  return (
    <Group>
      {gridLines}
    </Group>
  )
}
