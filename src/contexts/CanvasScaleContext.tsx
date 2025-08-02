'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface CanvasScaleContextType {
  scale: number // Base scale: 1 pixel = 1 foot
  zoom: number // Zoom level
  effectiveScale: number // Base scale * zoom
  setScale: (scale: number) => void
  setZoom: (zoom: number) => void
  screenToCanvas: (screenCoords: { x: number; y: number }) => { x: number; y: number }
  canvasToScreen: (canvasCoords: { x: number; y: number }) => { x: number; y: number }
  realWorldToCanvas: (dimensions: { width: number; height: number }) => { width: number; height: number }
  canvasToRealWorld: (dimensions: { width: number; height: number }) => { width: number; height: number }
}

const CanvasScaleContext = createContext<CanvasScaleContextType | null>(null)

export const CanvasScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scale, setScale] = useState(1) // Base scale: 1 pixel = 1 foot
  const [zoom, setZoom] = useState(1)   // Zoom level
  
  // Calculate effective scale (base scale * zoom)
  const effectiveScale = scale * zoom
  
  // Transform screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenCoords: { x: number; y: number }) => {
    console.log('📐 CANVAS_SCALE: Screen to canvas:', screenCoords, '→', {
      x: screenCoords.x / effectiveScale,
      y: screenCoords.y / effectiveScale
    })
    
    return {
      x: screenCoords.x / effectiveScale,
      y: screenCoords.y / effectiveScale
    }
  }, [effectiveScale])
  
  // Transform canvas coordinates to screen coordinates  
  const canvasToScreen = useCallback((canvasCoords: { x: number; y: number }) => {
    return {
      x: canvasCoords.x * effectiveScale,
      y: canvasCoords.y * effectiveScale
    }
  }, [effectiveScale])
  
  // Convert real-world dimensions to canvas pixels
  const realWorldToCanvas = useCallback((dimensions: { width: number; height: number }) => {
    const result = {
      width: dimensions.width * effectiveScale,
      height: dimensions.height * effectiveScale
    }
    
    console.log('📐 CANVAS_SCALE: Real world to canvas:', dimensions, '→', result, 'at scale:', effectiveScale)
    return result
  }, [effectiveScale])
  
  // Convert canvas pixels to real-world dimensions
  const canvasToRealWorld = useCallback((dimensions: { width: number; height: number }) => {
    return {
      width: dimensions.width / effectiveScale,
      height: dimensions.height / effectiveScale
    }
  }, [effectiveScale])
  
  const value: CanvasScaleContextType = {
    scale,
    zoom,
    effectiveScale,
    setScale,
    setZoom,
    screenToCanvas,
    canvasToScreen,
    realWorldToCanvas,
    canvasToRealWorld
  }
  
  return (
    <CanvasScaleContext.Provider value={value}>
      {children}
    </CanvasScaleContext.Provider>
  )
}

export const useCanvasScale = (): CanvasScaleContextType => {
  const context = useContext(CanvasScaleContext)
  if (!context) {
    throw new Error('useCanvasScale must be used within CanvasScaleProvider')
  }
  return context
}
