'use client'

import { useState, useCallback, useRef } from 'react'
import { SatelliteImageryService, SatelliteImageData, SatelliteImageConfig } from './satelliteImagery'

interface UseSatelliteImageryReturn {
  // State
  satelliteImage: SatelliteImageData | null
  isLoading: boolean
  error: string | null
  confidence: number
  
  // Actions
  loadSatelliteImage: (config: SatelliteImageConfig) => Promise<void>
  searchLocation: (query: string) => Promise<Array<{
    name: string
    latitude: number
    longitude: number
    formattedAddress: string
  }>>
  clearSatelliteImage: () => void
  
  // Coordinate conversion utilities
  canvasToWorldCoordinates: (canvasX: number, canvasY: number, canvasWidth: number, canvasHeight: number) => { latitude: number; longitude: number } | null
  worldToCanvasCoordinates: (latitude: number, longitude: number, canvasWidth: number, canvasHeight: number) => { x: number; y: number } | null
}

export function useSatelliteImagery(): UseSatelliteImageryReturn {
  const [satelliteImage, setSatelliteImage] = useState<SatelliteImageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Create service instance (memoized)
  const serviceRef = useRef<SatelliteImageryService | null>(null)
  
  const getService = useCallback(() => {
    if (!serviceRef.current) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        throw new Error('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.')
      }
      serviceRef.current = new SatelliteImageryService(apiKey)
    }
    return serviceRef.current
  }, [])

  const loadSatelliteImage = useCallback(async (config: SatelliteImageConfig) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const service = getService()
      const imageData = await service.getSatelliteImage(config)
      setSatelliteImage(imageData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load satellite image'
      setError(errorMessage)
      console.error('Error loading satellite image:', err)
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  const searchLocation = useCallback(async (query: string) => {
    setError(null) // Clear previous errors
    try {
      const service = getService()
      const results = await service.searchLocation(query)
      console.log('Search results:', results)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search location'
      setError(errorMessage)
      console.error('Search location error:', err)
      return []
    }
  }, [getService])

  const clearSatelliteImage = useCallback(() => {
    setSatelliteImage(null)
    setError(null)
  }, [])

  const canvasToWorldCoordinates = useCallback((
    canvasX: number,
    canvasY: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (!satelliteImage) return null
    
    try {
      const service = getService()
      return service.canvasToWorldCoordinates(
        canvasX,
        canvasY,
        satelliteImage,
        canvasWidth,
        canvasHeight
      )
    } catch (err) {
      console.error('Error converting canvas to world coordinates:', err)
      return null
    }
  }, [satelliteImage, getService])

  const worldToCanvasCoordinates = useCallback((
    latitude: number,
    longitude: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    if (!satelliteImage) return null
    
    try {
      const service = getService()
      return service.worldToCanvasCoordinates(
        latitude,
        longitude,
        satelliteImage,
        canvasWidth,
        canvasHeight
      )
    } catch (err) {
      console.error('Error converting world to canvas coordinates:', err)
      return null
    }
  }, [satelliteImage, getService])

  return {
    // State
    satelliteImage,
    isLoading,
    error,
    confidence: satelliteImage?.confidence || 0,
    
    // Actions
    loadSatelliteImage,
    searchLocation,
    clearSatelliteImage,
    
    // Utilities
    canvasToWorldCoordinates,
    worldToCanvasCoordinates
  }
}
