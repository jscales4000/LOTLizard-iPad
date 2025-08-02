// Equipment Migration Utility
// This utility helps migrate existing equipment data to the new shape-based system

import { EquipmentItem, EquipmentShape } from './equipmentDatabase'

// Helper function to determine logical shape based on equipment type and dimensions
export function determineEquipmentShape(item: any): EquipmentShape {
  const name = item.name.toLowerCase()
  
  // Circle-based equipment (rides that are naturally circular)
  if (name.includes('ferris') || name.includes('carousel') || name.includes('wheel')) {
    return 'circle'
  }
  
  // Most other equipment is rectangular
  return 'rectangle'
}

// Helper function to convert old dimensions to new format
export function migrateDimensions(item: any, shape: EquipmentShape) {
  if (shape === 'circle') {
    // For circular items, use the smaller dimension as radius
    const radius = Math.min(item.dimensions.width, item.dimensions.length) / 2
    return {
      radius,
      height: item.dimensions.height
    }
  } else {
    // For rectangular items, keep width/length
    return {
      width: item.dimensions.width,
      length: item.dimensions.length,
      height: item.dimensions.height
    }
  }
}

// Helper function to add default clearance for different equipment types
export function getDefaultClearance(item: any, shape: EquipmentShape) {
  const category = item.category.toLowerCase()
  const size = item.size
  
  // Rides typically need more clearance
  if (category === 'rides') {
    if (shape === 'circle') {
      const baseRadius = item.dimensions.radius || Math.min(item.dimensions.width, item.dimensions.length) / 2
      return {
        shape: 'circle' as const,
        radius: baseRadius + 10 // 10ft safety clearance
      }
    } else {
      return {
        shape: 'rectangle' as const,
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  }
  
  // Games need moderate clearance for customers
  if (category === 'games') {
    return {
      shape: 'rectangle' as const,
      top: 5,
      bottom: 8, // More space in front for customers
      left: 3,
      right: 3
    }
  }
  
  // Food stands need clearance for customer lines
  if (category === 'food') {
    return {
      shape: 'rectangle' as const,
      top: 3,
      bottom: 15, // Large space for customer queue
      left: 5,
      right: 5
    }
  }
  
  // Default minimal clearance for utilities/services
  return {
    shape: 'rectangle' as const,
    top: 2,
    bottom: 2,
    left: 2,
    right: 2
  }
}
