'use client'

import { useState, useEffect } from 'react'
import { EquipmentItem, EquipmentShape, ClearanceShape } from '@/lib/equipmentDatabase'
import { CanvasEquipmentItem } from '@/types/canvasTypes'

interface EquipmentPropertyEditorProps {
  equipment: CanvasEquipmentItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedEquipment: CanvasEquipmentItem) => void
}

export default function EquipmentPropertyEditor({
  equipment,
  isOpen,
  onClose,
  onSave
}: EquipmentPropertyEditorProps) {
  const [editedEquipment, setEditedEquipment] = useState<CanvasEquipmentItem | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize edited equipment when equipment prop changes
  useEffect(() => {
    if (equipment) {
      setEditedEquipment({ ...equipment })
      setHasChanges(false)
    }
  }, [equipment])

  // Track changes
  useEffect(() => {
    if (equipment && editedEquipment) {
      const changed = JSON.stringify(equipment) !== JSON.stringify(editedEquipment)
      setHasChanges(changed)
    }
  }, [equipment, editedEquipment])

  if (!isOpen || !equipment || !editedEquipment) return null

  const handleShapeChange = (shape: EquipmentShape) => {
    setEditedEquipment(prev => {
      if (!prev) return null
      
      const newDimensions = shape === 'circle' 
        ? { 
            radius: prev.dimensions.width ? prev.dimensions.width / 2 : 10,
            height: prev.dimensions.height 
          }
        : { 
            width: prev.dimensions.radius ? prev.dimensions.radius * 2 : 20,
            length: prev.dimensions.radius ? prev.dimensions.radius * 2 : 20,
            height: prev.dimensions.height 
          }

      return {
        ...prev,
        shape,
        dimensions: newDimensions
      }
    })
  }

  const handleDimensionChange = (key: string, value: number) => {
    setEditedEquipment(prev => {
      if (!prev) return null
      return {
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [key]: value
        }
      }
    })
  }

  const handleClearanceShapeChange = (shape: ClearanceShape) => {
    setEditedEquipment(prev => {
      if (!prev) return null
      
      const newClearance = shape === 'circle'
        ? { shape, radius: 10 }
        : { shape, top: 5, bottom: 5, left: 5, right: 5 }

      return {
        ...prev,
        clearance: newClearance
      }
    })
  }

  const handleClearanceChange = (key: string, value: number) => {
    setEditedEquipment(prev => {
      if (!prev) return null
      return {
        ...prev,
        clearance: {
          ...prev.clearance!,
          [key]: value
        }
      }
    })
  }

  const handleSave = () => {
    if (editedEquipment) {
      onSave(editedEquipment)
      onClose()
    }
  }

  const handleCancel = () => {
    setEditedEquipment(equipment ? { ...equipment } : null)
    setHasChanges(false)
    onClose()
  }

  const handleReset = () => {
    if (equipment) {
      setEditedEquipment({ ...equipment })
      setHasChanges(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCancel}
      />
      
      {/* Editor Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Equipment Properties</h2>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={editedEquipment.name}
                  onChange={(e) => setEditedEquipment(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={editedEquipment.description}
                  onChange={(e) => setEditedEquipment(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Shape Selection */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Equipment Shape</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => handleShapeChange('rectangle')}
                className={`flex-1 p-3 border rounded-md text-center transition-colors ${
                  editedEquipment.shape === 'rectangle'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">▭</div>
                <div className="text-sm">Rectangle</div>
              </button>
              <button
                onClick={() => handleShapeChange('circle')}
                className={`flex-1 p-3 border rounded-md text-center transition-colors ${
                  editedEquipment.shape === 'circle'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">●</div>
                <div className="text-sm">Circle</div>
              </button>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Dimensions (feet)</h3>
            <div className="space-y-3">
              {editedEquipment.shape === 'circle' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Radius</label>
                  <input
                    type="number"
                    value={editedEquipment.dimensions.radius || 0}
                    onChange={(e) => handleDimensionChange('radius', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Width</label>
                      <input
                        type="number"
                        value={editedEquipment.dimensions.width || 0}
                        onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Length</label>
                      <input
                        type="number"
                        value={editedEquipment.dimensions.length || 0}
                        onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Height</label>
                <input
                  type="number"
                  value={editedEquipment.dimensions.height || 0}
                  onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Clearance */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Safety Clearance</h3>
            
            {/* Clearance Shape */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Clearance Shape</label>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleClearanceShapeChange('rectangle')}
                  className={`flex-1 p-2 border rounded-md text-center text-sm transition-colors ${
                    editedEquipment.clearance?.shape === 'rectangle'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  ▭ Rectangle
                </button>
                <button
                  onClick={() => handleClearanceShapeChange('circle')}
                  className={`flex-1 p-2 border rounded-md text-center text-sm transition-colors ${
                    editedEquipment.clearance?.shape === 'circle'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  ● Circle
                </button>
              </div>
            </div>

            {/* Clearance Dimensions */}
            {editedEquipment.clearance && (
              <div className="space-y-3">
                {editedEquipment.clearance.shape === 'circle' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Clearance Radius (feet)</label>
                    <input
                      type="number"
                      value={editedEquipment.clearance.radius || 0}
                      onChange={(e) => handleClearanceChange('radius', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Top</label>
                      <input
                        type="number"
                        value={editedEquipment.clearance.top || 0}
                        onChange={(e) => handleClearanceChange('top', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Bottom</label>
                      <input
                        type="number"
                        value={editedEquipment.clearance.bottom || 0}
                        onChange={(e) => handleClearanceChange('bottom', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Left</label>
                      <input
                        type="number"
                        value={editedEquipment.clearance.left || 0}
                        onChange={(e) => handleClearanceChange('left', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Right</label>
                      <input
                        type="number"
                        value={editedEquipment.clearance.right || 0}
                        onChange={(e) => handleClearanceChange('right', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                hasChanges
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Reset
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
