import { EquipmentItem } from '@/lib/equipmentDatabase'

/**
 * Equipment item with canvas position properties
 * Includes all properties needed by both new and legacy canvas implementations
 */
export interface CanvasEquipmentItem extends EquipmentItem {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
}

/**
 * Type guard to check if an equipment item has canvas position
 */
export const isCanvasEquipmentItem = (item: EquipmentItem): item is CanvasEquipmentItem => {
  return typeof (item as any).x === 'number' && typeof (item as any).y === 'number'
}

/**
 * Convert EquipmentItem to CanvasEquipmentItem with default position
 */
export const toCanvasEquipmentItem = (
  item: EquipmentItem, 
  position: { x: number; y: number } = { x: 0, y: 0 }
): CanvasEquipmentItem => {
  // Ensure equipment has proper shape and dimensions
  const defaultDimensions = {
    width: item.dimensions?.width || 20,
    length: item.dimensions?.length || 20,
    height: item.dimensions?.height || 8,
    radius: item.dimensions?.radius || 10
  }
  
  // Determine shape based on existing dimensions or default to rectangle
  const shape = item.shape || (item.dimensions?.radius ? 'circle' : 'rectangle')
  
  // Create default clearance if not present (matching ClearanceArea interface)
  const defaultClearance = {
    shape: 'rectangle' as const,
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    radius: defaultDimensions.radius + 5 // For circle clearance
  }
  
  return {
    ...item,
    x: position.x,
    y: position.y,
    width: defaultDimensions.width,
    height: defaultDimensions.length, // Use length as height for canvas
    rotation: 0,
    color: item.color || '#3b82f6', // Use item color or default blue
    shape: shape,
    dimensions: defaultDimensions,
    clearance: item.clearance || defaultClearance,
    thumbnail: item.thumbnail || '🎪',
    opacity: item.opacity || 1.0,
    borderWidth: item.borderWidth || 2,
    scaleFactor: item.scaleFactor || 1.0
  }
}
