'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { CanvasEquipment } from './KonvaCanvas'

// We use explicit require() instead of imports to avoid SSR issues
let Rect: any
let Text: any
let Group: any
let Transformer: any

// Only import Konva on the client side
if (typeof window !== 'undefined') {
  const reactKonva = require('react-konva')
  Rect = reactKonva.Rect
  Text = reactKonva.Text
  Group = reactKonva.Group
  Transformer = reactKonva.Transformer
}

interface KonvaEquipmentProps {
  item: CanvasEquipment
  isSelected: boolean
  onSelect: (id: string) => void
  onChange: (id: string, newProps: Partial<CanvasEquipment>) => void
  snapToGrid?: boolean
  gridSize?: number
  scale: number
}

/**
 * KonvaEquipment - A draggable equipment component for Konva canvas
 * Handles touch and mouse interactions for equipment items
 */
export function KonvaEquipment({
  item,
  isSelected,
  onSelect,
  onChange,
  snapToGrid = true,
  gridSize = 20,
  scale
}: KonvaEquipmentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const groupRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  
  // Sync transformer with selection state
  useEffect(() => {
    if (isSelected && groupRef.current && transformerRef.current) {
      // Attach transformer
      transformerRef.current.nodes([groupRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected])
  
  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onSelect(item.id)
  }, [item.id, onSelect])
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    
    if (!groupRef.current) return
    
    let newX = groupRef.current.x()
    let newY = groupRef.current.y()
    
    // Snap to grid if enabled
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize
      newY = Math.round(newY / gridSize) * gridSize
      
      // Update position in the group
      groupRef.current.position({
        x: newX,
        y: newY
      })
    }
    
    // Notify parent of position change
    onChange(item.id, { x: newX, y: newY })
  }, [item.id, onChange, snapToGrid, gridSize])
  
  // Handle transform end (for resizing and rotation)
  const handleTransformEnd = useCallback(() => {
    if (!groupRef.current) return
    
    // Get new position, scale, and rotation
    const node = groupRef.current
    const newX = node.x()
    const newY = node.y()
    const rotation = node.rotation()
    
    // Calculate new dimensions based on scale
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    
    // Reset scale and update width/height instead
    node.scaleX(1)
    node.scaleY(1)
    
    const newWidth = Math.round(item.width * scaleX)
    const newHeight = Math.round(item.height * scaleY)
    
    // Notify parent of changes
    onChange(item.id, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      rotation
    })
  }, [item.id, item.width, item.height, onChange])

  // If Konva is not available (SSR), don't render
  if (typeof window === 'undefined' || !Group || !Rect || !Text) {
    return null
  }

  // Equipment visual representation
  return (
    <>
      <Group
        ref={groupRef}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        rotation={item.rotation || 0}
        draggable
        onClick={() => onSelect(item.id)}
        onTap={() => onSelect(item.id)}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Background rectangle with gradient */}
        <Rect
          width={item.width}
          height={item.height}
          fill={item.color}
          opacity={0.8}
          cornerRadius={5}
          shadowColor="black"
          shadowBlur={isSelected ? 10 : isDragging ? 15 : 5}
          shadowOpacity={isDragging ? 0.4 : isSelected ? 0.3 : 0.2}
          shadowOffset={{ x: 3, y: 3 }}
          stroke={isSelected ? '#007AFF' : '#666'}
          strokeWidth={isSelected ? 2 : 1}
          perfectDrawEnabled={false}
        />
        
        {/* Equipment thumbnail */}
        <Text
          text={item.thumbnail}
          fontSize={Math.min(item.width, item.height) * 0.3}
          x={item.width / 2}
          y={item.height * 0.25}
          offsetX={Math.min(item.width, item.height) * 0.15}
          offsetY={Math.min(item.width, item.height) * 0.15}
          align="center"
          listening={false}
          perfectDrawEnabled={false}
        />
        
        {/* Equipment name */}
        <Text
          text={item.name}
          fontSize={16}
          fill="#fff"
          x={item.width / 2}
          y={item.height - 24}
          width={item.width}
          align="center"
          offsetX={item.width / 2}
          listening={false}
          perfectDrawEnabled={false}
          shadowColor="black"
          shadowBlur={2}
          shadowOpacity={0.5}
        />
      </Group>
      
      {/* Transformer for resize/rotate (only shown when selected) */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit to minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox
            }
            return newBox
          }}
          rotateEnabled={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          keepRatio={false}
        />
      )}
    </>
  )
}
