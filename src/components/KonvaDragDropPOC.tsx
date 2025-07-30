'use client'

import React, { useRef, useState, useEffect } from 'react'
import { EquipmentItem } from '@/lib/equipmentDatabase'

// Define TypeScript interfaces
interface KonvaEventObject<T extends Event> {
  target: any;
  evt: T;
  currentTarget: any;
  type: string;
  cancelBubble: boolean;
}

interface PositionedEquipment extends EquipmentItem {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Explicitly declare Konva imports for better Next.js compatibility
let Konva: any;
let Stage: any;
let Layer: any;
let Rect: any;
let Text: any;
let Group: any;

// This ensures these are only imported client-side
if (typeof window !== 'undefined') {
  const konvaModule = require('konva');
  Konva = konvaModule.default || konvaModule;
  
  const reactKonva = require('react-konva');
  Stage = reactKonva.Stage;
  Layer = reactKonva.Layer;
  Rect = reactKonva.Rect;
  Text = reactKonva.Text;
  Group = reactKonva.Group;
}

// Sample equipment data for testing
const sampleEquipment: EquipmentItem = {
  id: 'ride-001',
  name: 'Ferris Wheel',
  category: 'Rides',
  size: 'Extra Large',
  dimensions: { width: 80, length: 80, height: 100 },
  capacity: 48,
  powerRequirement: '480V, 100A',
  setupTime: '8-12 hours',
  operatorCount: 2,
  description: 'Classic 100ft Ferris wheel with 24 gondolas, LED lighting package',
  thumbnail: '🎡',
  color: '#FF6B6B',
  popularity: 10
}

interface KonvaDragDropPOCProps {
  width: number
  height: number
}

export default function KonvaDragDropPOC({ width, height }: KonvaDragDropPOCProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [draggedEquipment, setDraggedEquipment] = useState<PositionedEquipment[]>([])
  const [stageSize, setStageSize] = useState({ width, height })
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update stage size on container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current
        setStageSize({
          width: offsetWidth,
          height: offsetHeight
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Function to handle zooming
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const scaleBy = 1.1
    const stage = stageRef.current
    if (!stage) return

    const oldScale = scale
    // Get pointer position relative to stage
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }

    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

    // Limit scale
    const limitedScale = Math.max(0.1, Math.min(5, newScale))

    // Set new position
    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    }

    setScale(limitedScale)
    setPosition(newPos)
  }

  // Handle stage drag for panning
  const handleDragStart = () => {
    // This prevents Konva from selecting the Stage itself for dragging
    if (stageRef.current) {
      stageRef.current.stopDrag()
    }
  }

  // Add equipment to canvas (simulates drag from sidebar)
  const addEquipment = () => {
    const newEquipment = {
      ...sampleEquipment,
      id: `${sampleEquipment.id}-${Date.now()}`, // Make unique
      x: Math.random() * stageSize.width / 2 / scale,
      y: Math.random() * stageSize.height / 2 / scale,
      // Convert feet to pixels (1 foot = 10 pixels)
      width: sampleEquipment.dimensions.width * 10,
      height: sampleEquipment.dimensions.length * 10
    }

    setDraggedEquipment(prev => [...prev, newEquipment])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold">Konva.js Drag & Drop Proof of Concept</h2>
        <p className="text-sm text-gray-600">
          Testing native Konva.js drag capabilities with touch support
        </p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={addEquipment}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Equipment
          </button>
          <button 
            onClick={() => {
              setScale(1)
              setPosition({ x: 0, y: 0 })
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Reset View
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 relative">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onWheel={handleWheel}
          onDragStart={handleDragStart}
          draggable={true}
          x={position.x}
          y={position.y}
          scale={{ x: scale, y: scale }}
        >
          <Layer>
            {/* Grid */}
            {Array.from({ length: 50 }).map((_, i) => (
              <React.Fragment key={`grid-v-${i}`}>
                <Rect
                  x={i * 100}
                  y={0}
                  width={1}
                  height={5000}
                  fill="#e5e7eb"
                />
                <Rect
                  x={0}
                  y={i * 100}
                  width={5000}
                  height={1}
                  fill="#e5e7eb"
                />
              </React.Fragment>
            ))}
            
            {/* Equipment */}
            {draggedEquipment.map((item) => (
              <Group
                key={item.id}
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                draggable
                // Enable touch and mouse dragging
                onDragStart={(e: KonvaEventObject<DragEvent>) => {
                  e.target.moveToTop()
                }}
                onDragEnd={(e: KonvaEventObject<DragEvent>) => {
                  // Update position in state
                  const { x, y } = e.target.position()
                  setDraggedEquipment(prev => prev.map(eq => 
                    eq.id === item.id ? { ...eq, x, y } : eq
                  ))
                }}
              >
                {/* Background rectangle */}
                <Rect
                  width={item.width}
                  height={item.height}
                  fill={item.color}
                  opacity={0.7}
                  cornerRadius={5}
                  shadowColor="black"
                  shadowBlur={10}
                  shadowOpacity={0.2}
                  shadowOffset={{ x: 5, y: 5 }}
                  stroke="#333"
                  strokeWidth={2}
                />
                
                {/* Equipment name and thumbnail */}
                <Text
                  text={item.thumbnail}
                  fontSize={Math.min(item.width, item.height) * 0.3}
                  x={item.width / 2}
                  y={item.height * 0.2}
                  offsetX={Math.min(item.width, item.height) * 0.15}
                  offsetY={Math.min(item.width, item.height) * 0.15}
                />
                
                <Text
                  text={item.name}
                  fontSize={16}
                  fill="white"
                  x={item.width / 2}
                  y={item.height - 20}
                  width={item.width}
                  align="center"
                  offsetX={item.width / 2}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
        
        {/* Touch instructions */}
        {draggedEquipment.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-white bg-opacity-80 p-6 rounded-lg">
              <div className="text-6xl mb-4">🎪</div>
              <p className="text-lg font-medium">Click "Add Equipment" to test</p>
              <p className="text-sm text-gray-600 mt-2">
                • Drag to move items • Pinch/wheel to zoom • Drag canvas to pan
              </p>
            </div>
          </div>
        )}
        
        {/* Debug info */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-80 px-2 py-1 text-xs text-gray-800 rounded">
          Scale: {scale.toFixed(2)}x | 
          Items: {draggedEquipment.length}
        </div>
      </div>
    </div>
  )
}
