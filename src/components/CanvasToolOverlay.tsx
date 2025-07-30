'use client'

import { useState } from 'react'

interface CanvasToolOverlayProps {
  selectedTool: string
  onToolSelect: (tool: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFit: () => void
  onMaxOut: () => void
}

const canvasTools = [
  { id: 'select', name: 'Select', icon: '↖️' },
  { id: 'move', name: 'Move', icon: '✋' },
  { id: 'rotate', name: 'Rotate', icon: '🔄' },
  { id: 'zoom-in', name: 'Zoom In', icon: '🔍+' },
  { id: 'zoom-out', name: 'Zoom Out', icon: '🔍-' },
  { id: 'reset', name: 'Reset View', icon: '🏠' },
  { id: 'fit', name: 'Fit to Screen', icon: '📐' },
  { id: 'max-out', name: 'Max Out', icon: '⛶' },
]

export default function CanvasToolOverlay({
  selectedTool,
  onToolSelect,
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
  onMaxOut
}: CanvasToolOverlayProps) {
  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case 'zoom-in':
        onZoomIn()
        break
      case 'zoom-out':
        onZoomOut()
        break
      case 'reset':
        onReset()
        break
      case 'fit':
        onFit()
        break
      case 'max-out':
        onMaxOut()
        break
      default:
        onToolSelect(toolId)
    }
  }

  return (
    <div className="
      absolute top-4 right-4 z-30
      flex flex-col space-y-1
      bg-white/90 backdrop-blur-sm
      rounded-lg shadow-lg border border-ios-gray-light/50
      p-2
    ">
      {canvasTools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          className={`
            w-10 h-10 rounded-md
            flex items-center justify-center
            text-sm font-medium
            transition-all duration-200
            ${selectedTool === tool.id && !['zoom-in', 'zoom-out', 'reset', 'fit', 'max-out'].includes(tool.id)
              ? 'bg-ios-blue text-white shadow-md'
              : 'bg-transparent text-ios-gray-dark hover:bg-ios-gray-light/50'
            }
            active:scale-95
            touch-manipulation
          `}
          title={tool.name}
        >
          <span className="text-base leading-none">
            {tool.id === 'zoom-in' ? '🔍' : 
             tool.id === 'zoom-out' ? '🔍' : 
             tool.id === 'reset' ? '🏠' :
             tool.id === 'fit' ? '📐' :
             tool.id === 'max-out' ? '⛶' :
             tool.icon}
          </span>
          {tool.id === 'zoom-in' && (
            <span className="text-xs ml-0.5 font-bold">+</span>
          )}
          {tool.id === 'zoom-out' && (
            <span className="text-xs ml-0.5 font-bold">-</span>
          )}
        </button>
      ))}
    </div>
  )
}
