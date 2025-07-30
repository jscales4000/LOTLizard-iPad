'use client'

import { useState } from 'react'

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'display' | 'units'>('canvas')

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
            <h2 className="text-lg font-semibold">⚙️ Settings</h2>
            <p className="text-blue-100 text-sm">Canvas and display options</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 text-xl font-light"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ios-gray-light">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`
              flex-1 py-2 px-3 text-xs font-medium
              ${activeTab === 'canvas'
                ? 'bg-ios-blue text-white'
                : 'bg-white text-ios-gray-dark hover:bg-ios-gray-light'
              }
            `}
          >
            📐 Canvas
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`
              flex-1 py-2 px-3 text-xs font-medium
              ${activeTab === 'display'
                ? 'bg-ios-blue text-white'
                : 'bg-white text-ios-gray-dark hover:bg-ios-gray-light'
              }
            `}
          >
            👁️ Display
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`
              flex-1 py-2 px-3 text-xs font-medium
              ${activeTab === 'units'
                ? 'bg-ios-blue text-white'
                : 'bg-white text-ios-gray-dark hover:bg-ios-gray-light'
              }
            `}
          >
            📏 Units
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {activeTab === 'canvas' && (
            <>
              {/* Canvas Size */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Canvas Size</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Total Area (sq ft)
                    </label>
                    <input
                      type="number"
                      defaultValue="250000"
                      className="w-full px-3 py-2 border border-ios-gray-light rounded-lg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                        Width (ft)
                      </label>
                      <input
                        type="number"
                        defaultValue="500"
                        className="w-full px-3 py-2 border border-ios-gray-light rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                        Height (ft)
                      </label>
                      <input
                        type="number"
                        defaultValue="500"
                        className="w-full px-3 py-2 border border-ios-gray-light rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Canvas Scale */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Canvas Scale</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Pixels per Foot
                    </label>
                    <input
                      type="number"
                      defaultValue="2"
                      step="0.1"
                      className="w-full px-3 py-2 border border-ios-gray-light rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Scale Ratio
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>1:100</option>
                      <option>1:200</option>
                      <option>1:500</option>
                      <option>1:1000</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid Settings */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Grid Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Grid Size (ft)
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Grid Style
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>Lines</option>
                      <option>Dots</option>
                      <option>Crosses</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'display' && (
            <>
              {/* Visibility Options */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Show/Hide Elements</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Grid</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Equipment Labels</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Clearance Zones</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Measurements</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show Coordinates</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Appearance</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Background Color
                    </label>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 bg-white rounded border-2 border-gray-300"></button>
                      <button className="w-8 h-8 bg-gray-100 rounded border-2 border-gray-300"></button>
                      <button className="w-8 h-8 bg-gray-200 rounded border-2 border-gray-300"></button>
                      <button className="w-8 h-8 bg-blue-50 rounded border-2 border-gray-300"></button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Grid Opacity
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="30"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Equipment Opacity
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="100"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'units' && (
            <>
              {/* Measurement Units */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Measurement Units</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Primary Unit
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
                      Area Unit
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>Square Feet</option>
                      <option>Square Meters</option>
                      <option>Square Yards</option>
                      <option>Acres</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Decimal Places
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>0</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Unit Conversion */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Quick Conversion</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="Enter value"
                        className="w-full px-3 py-2 border border-ios-gray-light rounded-lg"
                      />
                    </div>
                    <div>
                      <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                        <option>Feet</option>
                        <option>Meters</option>
                        <option>Yards</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="text-center text-ios-gray">
                    <span className="text-sm">↓ Converts to ↓</span>
                  </div>
                  
                  <div className="bg-ios-gray-light rounded-lg p-3 text-center">
                    <span className="font-medium">-- Select units above --</span>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Unit Presets</h3>
                <div className="space-y-2">
                  <button className="w-full p-2 text-left bg-ios-gray-light rounded-lg hover:bg-gray-200">
                    <div className="font-medium">US Imperial</div>
                    <div className="text-sm text-ios-gray">Feet, inches, square feet</div>
                  </button>
                  
                  <button className="w-full p-2 text-left bg-ios-gray-light rounded-lg hover:bg-gray-200">
                    <div className="font-medium">Metric</div>
                    <div className="text-sm text-ios-gray">Meters, centimeters, square meters</div>
                  </button>
                  
                  <button className="w-full p-2 text-left bg-ios-gray-light rounded-lg hover:bg-gray-200">
                    <div className="font-medium">Mixed</div>
                    <div className="text-sm text-ios-gray">Feet for distance, acres for area</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Reset Settings */}
          <div className="pt-4 border-t border-ios-gray-light">
            <button className="
              w-full py-2 px-4 bg-ios-red text-white
              rounded-lg font-medium hover:bg-red-600 transition-colors
            ">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
