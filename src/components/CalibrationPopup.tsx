'use client'

import { useState } from 'react'

interface CalibrationPopupProps {
  isOpen: boolean
  pixelDistance: number
  onSave: (realWorldDistance: number, unit: string) => void
  onEdit: () => void
  onReset: () => void
  onCancel: () => void
}

export default function CalibrationPopup({
  isOpen,
  pixelDistance,
  onSave,
  onEdit,
  onReset,
  onCancel
}: CalibrationPopupProps) {
  const [distance, setDistance] = useState('')
  const [unit, setUnit] = useState('feet')

  if (!isOpen) return null

  const handleSave = () => {
    const numDistance = parseFloat(distance)
    if (numDistance > 0) {
      onSave(numDistance, unit)
      setDistance('')
    }
  }

  const handleReset = () => {
    setDistance('')
    onReset()
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="bg-ios-blue text-white p-6">
            <h2 className="text-xl font-semibold">Calibrate Scale</h2>
            <p className="text-blue-100 text-sm mt-1">
              Set the real-world distance for accurate measurements
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-ios-gray-dark text-sm mb-4">
                You've drawn a line of <span className="font-semibold">{Math.round(pixelDistance)} pixels</span>.
                Enter the real-world distance this represents:
              </p>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-ios-gray-dark mb-2">
                    Distance
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Enter distance"
                    className="
                      w-full px-4 py-3 border border-ios-gray-light rounded-lg
                      focus:ring-2 focus:ring-ios-blue focus:border-ios-blue
                      text-lg font-medium
                    "
                    autoFocus
                  />
                </div>
                
                <div className="w-24">
                  <label className="block text-sm font-medium text-ios-gray-dark mb-2">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="
                      w-full px-3 py-3 border border-ios-gray-light rounded-lg
                      focus:ring-2 focus:ring-ios-blue focus:border-ios-blue
                      text-sm
                    "
                  >
                    <option value="feet">ft</option>
                    <option value="meters">m</option>
                    <option value="yards">yd</option>
                    <option value="inches">in</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onEdit}
                className="
                  flex-1 py-3 px-4 bg-ios-gray-light text-ios-gray-dark
                  rounded-lg font-medium hover:bg-gray-200 transition-colors
                "
              >
                Edit Line
              </button>
              
              <button
                onClick={handleReset}
                className="
                  flex-1 py-3 px-4 bg-ios-orange text-white
                  rounded-lg font-medium hover:bg-orange-600 transition-colors
                "
              >
                Reset
              </button>
              
              <button
                onClick={handleSave}
                disabled={!distance || parseFloat(distance) <= 0}
                className="
                  flex-1 py-3 px-4 bg-ios-blue text-white
                  rounded-lg font-medium hover:bg-blue-600 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Save
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="
                w-full mt-3 py-2 text-ios-gray hover:text-ios-gray-dark
                text-sm transition-colors
              "
            >
              Cancel Calibration
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
