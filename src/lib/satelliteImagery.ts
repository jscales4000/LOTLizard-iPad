export interface SatelliteImageConfig {
  latitude: number
  longitude: number
  zoom: number
  width: number
  height: number
  mapType?: 'satellite' | 'hybrid'
  scale?: 1 | 2 // For high DPI displays
}

export interface SatelliteImageData {
  imageUrl: string
  config: SatelliteImageConfig
  metersPerPixel: number
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  confidence: number // Scale detection confidence (0-1)
}

export class SatelliteImageryService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Calculate meters per pixel for a given zoom level and latitude
   * Formula: (Earth circumference * cos(latitude)) / (2^(zoom + 8))
   */
  private calculateMetersPerPixel(zoom: number, latitude: number): number {
    const earthCircumference = 40075016.686 // meters
    const latitudeRadians = (latitude * Math.PI) / 180
    return (earthCircumference * Math.cos(latitudeRadians)) / Math.pow(2, zoom + 8)
  }

  /**
   * Calculate bounding box for the satellite image
   */
  private calculateBounds(
    centerLat: number,
    centerLng: number,
    zoom: number,
    width: number,
    height: number
  ) {
    const metersPerPixel = this.calculateMetersPerPixel(zoom, centerLat)
    
    // Calculate half dimensions in meters
    const halfWidthMeters = (width * metersPerPixel) / 2
    const halfHeightMeters = (height * metersPerPixel) / 2
    
    // Convert meters to degrees (approximate)
    const metersPerDegreeLat = 111320 // meters per degree latitude (constant)
    const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180)
    
    const latDelta = halfHeightMeters / metersPerDegreeLat
    const lngDelta = halfWidthMeters / metersPerDegreeLng
    
    return {
      north: centerLat + latDelta,
      south: centerLat - latDelta,
      east: centerLng + lngDelta,
      west: centerLng - lngDelta
    }
  }

  /**
   * Generate Google Maps Static API URL
   */
  private generateImageUrl(config: SatelliteImageConfig): string {
    const {
      latitude,
      longitude,
      zoom,
      width,
      height,
      mapType = 'satellite',
      scale = 2
    } = config

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
    const params = new URLSearchParams({
      center: `${latitude},${longitude}`,
      zoom: zoom.toString(),
      size: `${width}x${height}`,
      maptype: mapType,
      scale: scale.toString(),
      key: this.apiKey
    })

    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Get satellite imagery with automatic scale detection
   */
  async getSatelliteImage(config: SatelliteImageConfig): Promise<SatelliteImageData> {
    try {
      const imageUrl = this.generateImageUrl(config)
      const metersPerPixel = this.calculateMetersPerPixel(config.zoom, config.latitude)
      const bounds = this.calculateBounds(
        config.latitude,
        config.longitude,
        config.zoom,
        config.width,
        config.height
      )

      // Calculate confidence based on zoom level and location
      // Higher zoom = higher confidence, certain latitudes have better coverage
      let confidence = 0.95 // Base confidence for Google Maps
      
      // Reduce confidence for extreme zoom levels
      if (config.zoom < 10 || config.zoom > 20) {
        confidence *= 0.8
      }
      
      // Reduce confidence for extreme latitudes (polar regions)
      const absLatitude = Math.abs(config.latitude)
      if (absLatitude > 70) {
        confidence *= 0.6
      } else if (absLatitude > 60) {
        confidence *= 0.8
      }

      return {
        imageUrl,
        config,
        metersPerPixel,
        bounds,
        confidence
      }
    } catch (error) {
      console.error('Error generating satellite image:', error)
      throw new Error('Failed to generate satellite image')
    }
  }

  /**
   * Search for locations using Google Maps Geocoding API
   */
  async searchLocation(query: string): Promise<Array<{
    name: string
    latitude: number
    longitude: number
    formattedAddress: string
  }>> {
    try {
      // Use a CORS proxy or direct API call
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${this.apiKey}`
      
      console.log('Searching for:', query)
      console.log('API URL:', url.replace(this.apiKey, 'API_KEY_HIDDEN'))
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log('Geocoding response:', data)
      
      if (data.status !== 'OK') {
        if (data.status === 'REQUEST_DENIED') {
          throw new Error('API key invalid or Geocoding API not enabled')
        }
        throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`)
      }

      if (!data.results || data.results.length === 0) {
        throw new Error('No results found for this location')
      }

      return data.results.slice(0, 5).map((result: any) => ({
        name: result.address_components[0]?.long_name || result.formatted_address.split(',')[0] || query,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      }))
    } catch (error) {
      console.error('Error searching location:', error)
      throw error
    }
  }

  /**
   * Convert canvas coordinates to real-world coordinates
   */
  canvasToWorldCoordinates(
    canvasX: number,
    canvasY: number,
    imageData: SatelliteImageData,
    canvasWidth: number,
    canvasHeight: number
  ): { latitude: number; longitude: number } {
    // Calculate relative position in image (0-1)
    const relativeX = canvasX / canvasWidth
    const relativeY = canvasY / canvasHeight
    
    // Convert to world coordinates
    const longitude = imageData.bounds.west + 
      (imageData.bounds.east - imageData.bounds.west) * relativeX
    const latitude = imageData.bounds.north - 
      (imageData.bounds.north - imageData.bounds.south) * relativeY
    
    return { latitude, longitude }
  }

  /**
   * Convert real-world coordinates to canvas coordinates
   */
  worldToCanvasCoordinates(
    latitude: number,
    longitude: number,
    imageData: SatelliteImageData,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number } {
    // Calculate relative position in bounds (0-1)
    const relativeX = (longitude - imageData.bounds.west) / 
      (imageData.bounds.east - imageData.bounds.west)
    const relativeY = (imageData.bounds.north - latitude) / 
      (imageData.bounds.north - imageData.bounds.south)
    
    // Convert to canvas coordinates
    const x = relativeX * canvasWidth
    const y = relativeY * canvasHeight
    
    return { x, y }
  }
}
