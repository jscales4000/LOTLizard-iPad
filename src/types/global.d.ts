import { EquipmentItem } from '@/lib/equipmentDatabase'

declare global {
  interface Window {
    __LOTLIZARD_ADD_EQUIPMENT__?: (item: EquipmentItem, position: { x: number; y: number }) => void
    __LOTLIZARD_EQUIPMENT_PLACED__?: () => void
  }
}

export {}
