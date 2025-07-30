'use client'

import { useState } from 'react'

interface ProjectsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProjectsDrawer({ isOpen, onClose }: ProjectsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'manage' | 'export'>('manage')

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
            <h2 className="text-lg font-semibold">📁 Projects</h2>
            <p className="text-blue-100 text-sm">Manage and export projects</p>
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
            onClick={() => setActiveTab('manage')}
            className={`
              flex-1 py-3 px-4 text-sm font-medium
              ${activeTab === 'manage'
                ? 'bg-ios-blue text-white'
                : 'bg-white text-ios-gray-dark hover:bg-ios-gray-light'
              }
            `}
          >
            📂 Manage
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`
              flex-1 py-3 px-4 text-sm font-medium
              ${activeTab === 'export'
                ? 'bg-ios-blue text-white'
                : 'bg-white text-ios-gray-dark hover:bg-ios-gray-light'
              }
            `}
          >
            📤 Export
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {activeTab === 'manage' && (
            <>
              {/* Current Project */}
              <div className="bg-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-2">Current Project</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Untitled Project</p>
                    <p className="text-sm text-ios-gray">Last saved: Never</p>
                  </div>
                  <div className="w-3 h-3 bg-ios-orange rounded-full" title="Unsaved changes"></div>
                </div>
              </div>

              {/* Project Actions */}
              <div className="space-y-3">
                <button className="
                  w-full py-3 px-4 bg-ios-green text-white
                  rounded-lg font-medium hover:bg-green-600 transition-colors
                  flex items-center justify-center
                ">
                  <span className="mr-2">💾</span>
                  Save Project
                </button>
                
                <button className="
                  w-full py-3 px-4 bg-ios-blue text-white
                  rounded-lg font-medium hover:bg-blue-600 transition-colors
                  flex items-center justify-center
                ">
                  <span className="mr-2">🆕</span>
                  New Project
                </button>
                
                <button className="
                  w-full py-3 px-4 bg-ios-gray-light text-ios-gray-dark
                  rounded-lg font-medium hover:bg-gray-200 transition-colors
                  flex items-center justify-center
                ">
                  <span className="mr-2">📂</span>
                  Open Project
                </button>
              </div>

              {/* Import/Export Files */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Import/Export</h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="file"
                      accept=".json,.lotplan"
                      className="hidden"
                      id="project-import"
                    />
                    <label
                      htmlFor="project-import"
                      className="
                        w-full py-2 px-4 bg-white border border-ios-gray-light
                        rounded-lg font-medium hover:bg-ios-gray-light transition-colors
                        cursor-pointer flex items-center justify-center
                      "
                    >
                      <span className="mr-2">📥</span>
                      Import Project
                    </label>
                  </div>
                  
                  <button className="
                    w-full py-2 px-4 bg-white border border-ios-gray-light
                    rounded-lg font-medium hover:bg-ios-gray-light transition-colors
                    flex items-center justify-center
                  ">
                    <span className="mr-2">📤</span>
                    Export Project
                  </button>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Recent Projects</h3>
                <div className="text-center text-ios-gray py-6">
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm">No recent projects</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'export' && (
            <>
              {/* PDF Export */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">PDF Export</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Page Size
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>Letter (8.5" × 11")</option>
                      <option>Legal (8.5" × 14")</option>
                      <option>Tabloid (11" × 17")</option>
                      <option>A4 (210mm × 297mm)</option>
                      <option>A3 (297mm × 420mm)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Orientation
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>Landscape</option>
                      <option>Portrait</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-ios-gray-dark mb-1">
                      Scale
                    </label>
                    <select className="w-full px-3 py-2 border border-ios-gray-light rounded-lg">
                      <option>Fit to Page</option>
                      <option>Actual Size</option>
                      <option>Custom Scale</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Include</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Equipment Layout</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">Equipment Labels</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Grid Lines</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Measurements</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Background Image</span>
                  </label>
                </div>
              </div>

              {/* Export Actions */}
              <div className="space-y-3">
                <button className="
                  w-full py-3 px-4 bg-ios-red text-white
                  rounded-lg font-medium hover:bg-red-600 transition-colors
                  flex items-center justify-center
                ">
                  <span className="mr-2">📄</span>
                  Export as PDF
                </button>
                
                <button className="
                  w-full py-2 px-4 bg-ios-gray-light text-ios-gray-dark
                  rounded-lg font-medium hover:bg-gray-200 transition-colors
                  flex items-center justify-center
                ">
                  <span className="mr-2">🖼️</span>
                  Export as Image
                </button>
              </div>

              {/* Export History */}
              <div className="bg-white border border-ios-gray-light rounded-lg p-4">
                <h3 className="font-semibold text-ios-gray-dark mb-3">Export History</h3>
                <div className="text-center text-ios-gray py-6">
                  <div className="text-3xl mb-2">📤</div>
                  <p className="text-sm">No exports yet</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
