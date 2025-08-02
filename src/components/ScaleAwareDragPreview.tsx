'use client'

import React from 'react'
import { useUnifiedDrag } from '../contexts/UnifiedDragContext'
import { useCanvasScale } from '../contexts/CanvasScaleContext'

const ScaleAwareDragPreview: React.FC = () => {
  const { dragState } = useUnifiedDrag()
  const { realWorldToCanvas, effectiveScale } = useCanvasScale()
  
  if (!dragState.previewVisible || !dragState.dragItem || !dragState.currentPosition) {
    return null
  }
  
  // Calculate actual size based on canvas scale and real-world dimensions
  const realDimensions = {
    width: dragState.dragItem.dimensions.width,
    height: dragState.dragItem.dimensions.length // Note: length maps to height
  }
  
  const canvasDimensions = realWorldToCanvas(realDimensions)
  
  // Ensure minimum visible size for very small items
  const minSize = 20
  const displayWidth = Math.max(canvasDimensions.width, minSize)
  const displayHeight = Math.max(canvasDimensions.height, minSize)
  
  // Position the preview at cursor location (centered)
  const previewStyle: React.CSSProperties = {
    position: 'fixed',
    left: dragState.currentPosition.x - (displayWidth / 2),
    top: dragState.currentPosition.y - (displayHeight / 2),
    width: displayWidth,
    height: displayHeight,
    pointerEvents: 'none',
    zIndex: 9999,
    opacity: 0.8,
    border: '2px dashed #007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.15)',
    borderRadius: '4px',
    transform: 'rotate(0deg)', // Prevent any accidental transforms
    transformOrigin: 'center center',
    transition: 'none', // Disable transitions for smooth following
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  }
  
  // Calculate appropriate font size based on preview size
  const fontSize = Math.min(displayWidth / 8, displayHeight / 8, 14)
  const showDimensions = displayWidth > 60 && displayHeight > 40
  
  const textStyle: React.CSSProperties = {
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: `${fontSize}px`,
    lineHeight: '1.2',
    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
    userSelect: 'none'
  }
  
  console.log('🎨 DRAG_PREVIEW: Rendering preview', {
    item: dragState.dragItem.name,
    realDimensions,
    canvasDimensions,
    displaySize: { width: displayWidth, height: displayHeight },
    position: dragState.currentPosition,
    effectiveScale
  })
  
  return (
    <div style={previewStyle}>
      <div style={textStyle}>
        <div>{dragState.dragItem.name}</div>
        {showDimensions && (
          <div style={{ fontSize: `${fontSize * 0.8}px`, marginTop: '2px' }}>
            {realDimensions.width}' × {realDimensions.height}'
          </div>
        )}
      </div>
    </div>
  )
}

export default ScaleAwareDragPreview
