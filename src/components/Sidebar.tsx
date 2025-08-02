'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { X, Edit, Search } from 'lucide-react'
import { equipmentDatabase, equipmentCategories, getEquipmentByCategory, searchEquipment, type EquipmentItem } from '../lib/equipmentDatabase'
import { useUnifiedDrag } from '@/contexts/UnifiedDragContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggleProperties: () => void
  onEquipmentSelect?: (equipment: EquipmentItem) => void
}

export default function Sidebar({ isOpen, onClose, onToggleProperties, onEquipmentSelect }: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null)

  const filteredEquipment = useMemo(() => {
    if (searchQuery.trim()) {
      return searchEquipment(searchQuery)
    }
    if (selectedCategory === 'All') {
      return equipmentDatabase.sort((a, b) => b.popularity - a.popularity)
    }
    return getEquipmentByCategory(selectedCategory)
  }, [selectedCategory, searchQuery])

  const handleEquipmentClick = (equipment: EquipmentItem) => {
    setSelectedEquipment(equipment)
    onEquipmentSelect?.(equipment)
  }
  
  // Unified drag context
  const { 
    dragState, 
    isMobile, 
    handleMouseDown, 
    handleTouchStart 
  } = useUnifiedDrag()
  
  // Register callback to reset selection when equipment is placed
  useEffect(() => {
    const handleEquipmentPlaced = () => {
      console.log('🔄 SIDEBAR: Equipment placed, resetting selection')
      setSelectedEquipment(null)
    }
    
    window.__LOTLIZARD_EQUIPMENT_PLACED__ = handleEquipmentPlaced
    
    return () => {
      delete window.__LOTLIZARD_EQUIPMENT_PLACED__
    }
  }, [])
  
  // Unified drag handler with selection
  const handleEquipmentMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, equipment: EquipmentItem) => {
      console.log('👆 SIDEBAR: Equipment mousedown', equipment.name);
      
      // Immediately select the equipment on mousedown
      setSelectedEquipment(equipment)
      onEquipmentSelect?.(equipment)
      
      // Use unified drag handler
      const success = handleMouseDown(e, equipment, 'EQUIPMENT')
      if (!success) {
        console.log('❌ SIDEBAR: Mouse down failed - invalid target')
      }
    }, [handleMouseDown, setSelectedEquipment, onEquipmentSelect])
  
  // Touch handler for iPad support with selection
  const handleEquipmentTouchStart = useCallback((e: React.TouchEvent, equipment: EquipmentItem) => {
    console.log('👆 SIDEBAR: Touch start for:', equipment.name)
    
    // Immediately select the equipment on touch start
    setSelectedEquipment(equipment)
    onEquipmentSelect?.(equipment)
    
    // Use unified touch handler
    handleTouchStart(e, equipment, 'EQUIPMENT')
  }, [handleTouchStart, setSelectedEquipment, onEquipmentSelect])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop - REMOVED for drag-and-drop functionality */}
      {/* Canvas needs to be interactive while drawer is open */}
      
      {/* Drawer */}
      <div className="fixed left-16 top-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Equipment Library</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleProperties}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Toggle Properties Panel"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                selectedCategory === 'All'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            {equipmentCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 ${
                  selectedCategory === category.name
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredEquipment.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p>No equipment found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredEquipment.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleEquipmentClick(item)}
                  onMouseDown={(e) => handleEquipmentMouseDown(e, item)}
                  onTouchStart={(e) => handleEquipmentTouchStart(e, item)}
                  className={`bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all cursor-grab active:cursor-grabbing border-2 min-h-[120px] ${
                    selectedEquipment?.id === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent'
                  }`}
                  style={{ borderLeftColor: item.color, borderLeftWidth: '4px', touchAction: 'none' }}
                  title={`Drag ${item.name} to canvas`}
                >
                  <div className="text-3xl mb-2 text-center">{item.thumbnail}</div>
                  <div className="text-sm font-medium text-gray-800 leading-tight">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.category}</div>
                  <div className="text-xs text-gray-400">{item.size}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.dimensions.width}' × {item.dimensions.length}'
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Equipment Count */}
        <div className="p-3 border-t border-gray-200 text-xs text-gray-500 text-center">
          {filteredEquipment.length} equipment item{filteredEquipment.length !== 1 ? 's' : ''}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </div>
      </div>
    </>
  )
}
