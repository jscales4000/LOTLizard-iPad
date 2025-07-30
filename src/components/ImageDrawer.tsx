'use client'

import { useState } from 'react'
import { useSatelliteImagery } from '@/lib/useSatelliteImagery'

interface ImageDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSatelliteImageLoad: (imageData: any) => void
}

export default function ImageDrawer({ isOpen, onClose, onSatelliteImageLoad }: ImageDrawerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'maps'>('upload')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [zoomLevel, setZoomLevel] = useState(16)

  const {
    satelliteImage,
    isLoading,
    error,
    confidence,
    loadSatelliteImage,
    searchLocation,
    clearSatelliteImage
  } = useSatelliteImagery()

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
            <h2 className="text-lg font-semibold">🖼️ Image Import</h2>
            <p className="text-blue-100 text-sm">Add background images</p>
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
            onClick={() => setActiveTab('upload')}
            className={`
              flex-1 py-3 px-4 text-sm font-medium
              ${activeTab === 'upload'
                ? 'bg-ios-blue text-white'
                : 'bg-white text-ios-gray-dark hover:bg-ios-gray-light'
              }
            `}
          >
            📁 Upload Image
          </button>
          <button
            onClick={() => setActiveTab('maps')}
            className={`
              flex-1 py-3 px-4 text-sm font-medium
              ${activeTab === 'maps'
                ? 'bg-ios-blue text-white'
                : 'bg-white text-ios-gray-dark hover:bg-ios-gray-light'
              }
            `}
          >
            🗺️ Google Maps
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {activeTab === 'upload' && (
            <>
              {/* File Upload */}
              <div className="bg-ios-gray-light rounded-lg p-6 text-center border-2 border-dashed border-ios-gray">
                <div className="text-4xl mb-3">📷</div>
                <h3 className="font-semibold text-ios-gray-dark mb-2">Upload Image</h3>
                <p className="text-sm text-ios-gray mb-4">
                  Drag and drop an image file or click to browse
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="
                    inline-block py-2 px-4 bg-ios-blue text-white
                    rounded-lg font-medium hover:bg-blue-600 transition-colors
                    cursor-pointer
                  "
                >
                  Choose Image
                </label>
              </div>

              {/* Image Settings */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Image Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Opacity
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Layer Position
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>Background</option>
                      <option>Foreground</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'maps' && (
            <div className="p-4 space-y-4">
              {/* Location Search */}
              <div className="bg-ios-gray-light rounded-lg p-4">
                <p className="text-sm text-ios-gray mb-3">Search for a location to import satellite imagery</p>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter address or coordinates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border border-ios-gray-light rounded-lg focus:border-ios-blue focus:outline-none"
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        const results = await searchLocation(searchQuery)
                        setSearchResults(results)
                      }
                    }}
                  />
                  
                  <button 
                    onClick={async () => {
                      if (searchQuery.trim()) {
                        const results = await searchLocation(searchQuery)
                        setSearchResults(results)
                      }
                    }}
                    disabled={!searchQuery.trim() || isLoading}
                    className="w-full py-3 bg-ios-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Searching...' : 'Search Location'}
                  </button>
                </div>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                  <h3 className="font-semibold text-ios-gray-dark mb-3">Search Results</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedLocation(result)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedLocation?.formattedAddress === result.formattedAddress
                            ? 'border-ios-blue bg-blue-50'
                            : 'border-ios-gray-light hover:bg-ios-gray-light'
                        }`}
                      >
                        <div className="font-medium text-sm">{result.name}</div>
                        <div className="text-xs text-ios-gray">{result.formattedAddress}</div>
                        <div className="text-xs text-ios-gray mt-1">
                          {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Import Settings */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Import Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-ios-gray mb-1">Zoom Level: {zoomLevel}</label>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-ios-gray mt-1">
                      <span>Low Detail</span>
                      <span>High Detail</span>
                    </div>
                  </div>
                  
                  {selectedLocation && (
                    <div className="bg-ios-gray-light rounded-lg p-3">
                      <div className="text-sm font-medium text-ios-gray-dark mb-2">Selected Location:</div>
                      <div className="text-sm text-ios-gray">{selectedLocation.formattedAddress}</div>
                      <div className="text-xs text-ios-gray mt-1">
                        Coordinates: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Load Satellite Image */}
              {selectedLocation && (
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      await loadSatelliteImage({
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                        zoom: zoomLevel,
                        width: 1024,
                        height: 1024,
                        mapType: 'satellite',
                        scale: 2
                      })
                    }}
                    disabled={isLoading}
                    className="w-full py-3 bg-ios-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading Satellite Image...' : 'Load Satellite Image'}
                  </button>
                  
                  {satelliteImage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-800 mb-1">✅ Satellite Image Loaded</div>
                      <div className="text-xs text-green-700">
                        Scale: {satelliteImage.metersPerPixel.toFixed(2)} meters/pixel
                      </div>
                      <div className="text-xs text-green-700">
                        Confidence: {(confidence * 100).toFixed(1)}%
                      </div>
                      <button
                        onClick={() => {
                          onSatelliteImageLoad(satelliteImage)
                          onClose()
                        }}
                        className="mt-2 w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Apply to Canvas
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-800 mb-1">❌ Error</div>
                  <div className="text-xs text-red-700">{error}</div>
                  <button
                    onClick={() => clearSatelliteImage()}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Clear Error
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Current Images */}
          <div className="bg-white border border-ios-gray-light rounded-lg p-4">
            <h3 className="font-semibold text-ios-gray-dark mb-3">Current Images</h3>
            <div className="text-center text-ios-gray py-8">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm">No images imported yet</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
