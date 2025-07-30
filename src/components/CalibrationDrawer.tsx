'use client'

import { useState } from 'react'
import { CalibrationState } from '@/lib/useCalibration'

interface CalibrationDrawerProps {
  isOpen: boolean
  calibrationState: CalibrationState
  onClose: () => void
  onSave: (realWorldDistance: number, unit: string) => void
  onEdit: () => void
  onReset: () => void
  onCancel: () => void
}

export default function CalibrationDrawer({
  isOpen,
  calibrationState,
  onClose,
  onSave,
  onEdit,
  onReset,
  onCancel
}: CalibrationDrawerProps) {
  const [distance, setDistance] = useState('')
  const [unit, setUnit] = useState('feet')

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

  const handleCancel = () => {
    setDistance('')
    onCancel()
  }

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
            <h2 className="text-lg font-semibold">📐 Calibration Scale</h2>
            <p className="text-blue-100 text-sm">Set measurement scale</p>
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
          {/* Status */}
          <div className="bg-ios-gray-light rounded-lg p-4">
            <h3 className="font-semibold text-ios-gray-dark mb-2">Status</h3>
            {calibrationState.isWaitingForFirstPoint && (
              <div className="flex items-center text-ios-blue">
                <span className="w-2 h-2 bg-ios-blue rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm">Click to place first point</span>
              </div>
            )}
            {calibrationState.isWaitingForSecondPoint && (
              <div className="flex items-center text-ios-blue">
                <span className="w-2 h-2 bg-ios-blue rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm">Click to place second point</span>
              </div>
            )}
            {calibrationState.showPopup && (
              <div className="flex items-center text-ios-orange">
                <span className="w-2 h-2 bg-ios-orange rounded-full mr-2"></span>
                <span className="text-sm">Enter real-world distance</span>
              </div>
            )}
            {calibrationState.isEditing && (
              <div className="flex items-center text-ios-green">
                <span className="w-2 h-2 bg-ios-green rounded-full mr-2"></span>
                <span className="text-sm">Drag points to adjust</span>
              </div>
            )}
            {calibrationState.line && !calibrationState.isActive && (
              <div className="flex items-center text-ios-green">
                <span className="w-2 h-2 bg-ios-green rounded-full mr-2"></span>
                <span className="text-sm">Calibration complete</span>
              </div>
            )}
          </div>

          {/* Line Info */}
          {calibrationState.line && (
            <div className="bg-white border border-ios-gray-light rounded-lg p-4">
              <h3 className="font-semibold text-ios-gray-dark mb-3">Measurement Line</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ios-gray">Pixel Distance:</span>
                  <span className="font-medium">{Math.round(calibrationState.line.pixelDistance)} px</span>
                </div>
                {calibrationState.line.realWorldDistance && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-ios-gray">Real Distance:</span>
                      <span className="font-medium">
                        {calibrationState.line.realWorldDistance} {calibrationState.line.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ios-gray">Scale:</span>
                      <span className="font-medium">
                        {(calibrationState.scale).toFixed(2)} px/{calibrationState.line.unit}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Distance Input */}
          {calibrationState.showPopup && (
            <div className="bg-white border border-ios-gray-light rounded-lg p-4">
              <h3 className="font-semibold text-ios-gray-dark mb-3">Real-World Distance</h3>
              <p className="text-sm text-ios-gray mb-4">
                Enter the actual distance this line represents:
              </p>
              
              <div className="flex gap-3 mb-4">
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
                      w-full px-3 py-2 border border-ios-gray-light rounded-lg
                      focus:ring-2 focus:ring-ios-blue focus:border-ios-blue
                      text-sm
                    "
                    autoFocus
                  />
                </div>
                
                <div className="w-20">
                  <label className="block text-sm font-medium text-ios-gray-dark mb-2">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="
                      w-full px-2 py-2 border border-ios-gray-light rounded-lg
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

              <button
                onClick={handleSave}
                disabled={!distance || parseFloat(distance) <= 0}
                className="
                  w-full py-2 px-4 bg-ios-blue text-white
                  rounded-lg font-medium hover:bg-blue-600 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Save Calibration
              </button>
            </div>
          )}

          {/* Actions */}
          {calibrationState.line && !calibrationState.showPopup && (
            <div className="space-y-3">
              <button
                onClick={onEdit}
                className="
                  w-full py-2 px-4 bg-ios-gray-light text-ios-gray-dark
                  rounded-lg font-medium hover:bg-gray-200 transition-colors
                "
              >
                Edit Line
              </button>
              
              <button
                onClick={handleReset}
                className="
                  w-full py-2 px-4 bg-ios-orange text-white
                  rounded-lg font-medium hover:bg-orange-600 transition-colors
                "
              >
                Reset Calibration
              </button>
            </div>
          )}

          {/* Cancel */}
          {calibrationState.isActive && (
            <button
              onClick={handleCancel}
              className="
                w-full py-2 text-ios-gray hover:text-ios-gray-dark
                text-sm transition-colors
              "
            >
              Cancel Calibration
            </button>
          )}
        </div>
      </div>
    </>
  )
}
