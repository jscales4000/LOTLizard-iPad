'use client'

import { useState } from 'react'

interface MeasureDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MeasureDrawer({ isOpen, onClose }: MeasureDrawerProps) {
  const [activeTool, setActiveTool] = useState<'distance' | 'perimeter' | 'area' | null>(null)

  const measurementTools = [
    { id: 'distance', name: 'Distance', icon: '📏', description: 'Measure distance between two points' },
    { id: 'perimeter', name: 'Perimeter', icon: '📐', description: 'Measure perimeter of a shape' },
    { id: 'area', name: 'Area', icon: '📊', description: 'Calculate area of a region' },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 landscape:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`
        fixed top-0 h-full w-80 bg-white shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        landscape:left-20 portrait:left-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        landscape:border-r landscape:border-ios-gray-light
      `}>
        {/* Header */}
        <div className="bg-ios-blue text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">📏 Measure Tools</h2>
            <p className="text-blue-100 text-sm">Distance, perimeter, and area</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 text-xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Tool Selection */}
          <div className="bg-white border border-ios-gray-light rounded-lg p-4">
            <h3 className="font-semibold text-ios-gray-dark mb-3">Measurement Tools</h3>
            <div className="space-y-2">
              {measurementTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as any)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-colors
                    ${activeTool === tool.id
                      ? 'bg-ios-blue text-white'
                      : 'bg-ios-gray-light text-ios-gray-dark hover:bg-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{tool.icon}</span>
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className={`text-sm ${activeTool === tool.id ? 'text-blue-100' : 'text-ios-gray'}`}>
                        {tool.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Tool Instructions */}
          {activeTool && (
            <div className="bg-ios-gray-light rounded-lg p-4">
              <h3 className="font-semibold text-ios-gray-dark mb-2">Instructions</h3>
              {activeTool === 'distance' && (
                <div className="text-sm text-ios-gray">
                  <p className="mb-2">📍 Click two points on the canvas to measure distance</p>
                  <p>• First click: Start point</p>
                  <p>• Second click: End point</p>
                  <p>• Distance will be displayed in real-time</p>
                </div>
              )}
              {activeTool === 'perimeter' && (
                <div className="text-sm text-ios-gray">
                  <p className="mb-2">🔄 Click multiple points to create a shape</p>
                  <p>• Click points to define the perimeter</p>
                  <p>• Double-click to close the shape</p>
                  <p>• Perimeter will be calculated automatically</p>
                </div>
              )}
              {activeTool === 'area' && (
                <div className="text-sm text-ios-gray">
                  <p className="mb-2">📐 Click points to define an area</p>
                  <p>• Click points to create a polygon</p>
                  <p>• Double-click to close the area</p>
                  <p>• Area will be calculated in square units</p>
                </div>
              )}
            </div>
          )}

          {/* Measurement Settings */}
          <div className="bg-white border border-ios-gray-light rounded-lg p-4">
            <h3 className="font-semibold text-ios-gray-dark mb-3">Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                  Measurement Units
                </label>
                <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                  <option>Feet</option>
                  <option>Meters</option>
                  <option>Yards</option>
                  <option>Inches</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                  Line Style
                </label>
                <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                  <option>Solid</option>
                  <option>Dashed</option>
                  <option>Dotted</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                  Line Color
                </label>
                <div className="flex space-x-2">
                  <button className="w-8 h-8 bg-red-500 rounded border-2 border-gray-300"></button>
                  <button className="w-8 h-8 bg-blue-500 rounded border-2 border-gray-300"></button>
                  <button className="w-8 h-8 bg-green-500 rounded border-2 border-gray-300"></button>
                  <button className="w-8 h-8 bg-yellow-500 rounded border-2 border-gray-300"></button>
                  <button className="w-8 h-8 bg-purple-500 rounded border-2 border-gray-300"></button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Measurements */}
          <div className="bg-white border border-ios-gray-light rounded-lg p-4">
            <h3 className="font-semibold text-ios-gray-dark mb-3">Current Measurements</h3>
            <div className="text-center text-ios-gray py-6">
              <div className="text-3xl mb-2">📏</div>
              <p className="text-sm">No measurements yet</p>
              <p className="text-xs mt-1">Select a tool and click on the canvas</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="
              w-full py-2 px-4 bg-ios-orange text-white
              rounded-lg font-medium hover:bg-orange-600 transition-colors
            ">
              Clear All Measurements
            </button>
            
            <button className="
              w-full py-2 px-4 bg-ios-gray-light text-ios-gray-dark
              rounded-lg font-medium hover:bg-gray-200 transition-colors
            ">
              Export Measurements
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
