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
  return {
    ...item,
    x: position.x,
    y: position.y,
    width: item.dimensions.width,
    height: item.dimensions.length, // Use length as height for canvas
    rotation: 0,
    color: '#3b82f6' // Default blue color
  }
}
