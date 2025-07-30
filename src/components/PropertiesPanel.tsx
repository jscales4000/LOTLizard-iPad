'use client'

import React from 'react'
import { X } from 'lucide-react'
import { type EquipmentItem } from '../lib/equipmentDatabase'

interface PropertiesPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedEquipment: EquipmentItem | null
}

export default function PropertiesPanel({ isOpen, onClose, selectedEquipment }: PropertiesPanelProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedEquipment ? (
            <div className="space-y-6">
              {/* Equipment Header */}
              <div className="text-center">
                <div className="text-6xl mb-3">{selectedEquipment.thumbnail}</div>
                <h3 className="text-xl font-bold text-gray-800">{selectedEquipment.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedEquipment.category}</p>
                <div 
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mt-2"
                  style={{ backgroundColor: selectedEquipment.color + '20', color: selectedEquipment.color }}
                >
                  {selectedEquipment.size}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedEquipment.description}
                </p>
              </div>

              {/* Dimensions */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Dimensions</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Width:</span>
                    <span className="text-sm font-medium">{selectedEquipment.dimensions.width} feet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Length:</span>
                    <span className="text-sm font-medium">{selectedEquipment.dimensions.length} feet</span>
                  </div>
                  {selectedEquipment.dimensions.height && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Height:</span>
                      <span className="text-sm font-medium">{selectedEquipment.dimensions.height} feet</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Footprint:</span>
                      <span className="text-sm font-medium">
                        {selectedEquipment.dimensions.width * selectedEquipment.dimensions.length} sq ft
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Specifications</h4>
                <div className="space-y-3">
                  {selectedEquipment.capacity && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="text-sm font-medium">{selectedEquipment.capacity} people</span>
                    </div>
                  )}
                  {selectedEquipment.powerRequirement && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Power:</span>
                      <span className="text-sm font-medium">{selectedEquipment.powerRequirement}</span>
                    </div>
                  )}
                  {selectedEquipment.setupTime && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Setup Time:</span>
                      <span className="text-sm font-medium">{selectedEquipment.setupTime}</span>
                    </div>
                  )}
                  {selectedEquipment.operatorCount && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Operators:</span>
                      <span className="text-sm font-medium">{selectedEquipment.operatorCount} required</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Popularity Score */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Popularity</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${selectedEquipment.popularity * 10}%`,
                        backgroundColor: selectedEquipment.color 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {selectedEquipment.popularity}/10
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on carnival operator preferences
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Add to Canvas
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Add to Favorites
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">No Equipment Selected</h3>
              <p className="text-sm">
                Select an equipment item from the library to view its properties and specifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
