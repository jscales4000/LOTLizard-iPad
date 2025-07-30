import { EquipmentItem } from '@/lib/equipmentDatabase'

/**
 * Extended EquipmentItem with spatial properties for canvas display
 */
export interface CanvasEquipmentItem extends EquipmentItem {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

/**
 * Type adapter functions for converting between Equipment and EquipmentItem
 */
export const CanvasTypeAdapter = {
  /**
   * Convert from Canvas Equipment to EquipmentItem
   */
  toEquipmentItem: (equipment: any): EquipmentItem => {
    const { x, y, width, height, rotation, ...equipmentItem } = equipment
    return equipmentItem
  },
  
  /**
   * Convert from EquipmentItem to Canvas Equipment
   */
  toCanvasEquipment: (item: EquipmentItem, x = 0, y = 0, width?: number, height?: number, rotation = 0): CanvasEquipmentItem => {
    return {
      ...item,
      x,
      y,
      width: width ?? item.dimensions.width * 10, // Convert feet to pixels
      height: height ?? item.dimensions.length * 10, // Convert feet to pixels
      rotation
    }
  },
  
  /**
   * Convert an array of Canvas Equipment to EquipmentItems
   */
  toEquipmentItems: (equipment: any[]): EquipmentItem[] => {
    return equipment.map(CanvasTypeAdapter.toEquipmentItem)
  },
  
  /**
   * Convert an array of EquipmentItems to Canvas Equipment
   */
  toCanvasEquipments: (items: EquipmentItem[]): CanvasEquipmentItem[] => {
    return items.map(item => CanvasTypeAdapter.toCanvasEquipment(
      item,
      (item as any).x,
      (item as any).y,
      (item as any).width,
      (item as any).height,
      (item as any).rotation
    ))
  }
}
