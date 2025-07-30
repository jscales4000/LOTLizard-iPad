'use client'

import { useState } from 'react'
import Toolbar from '@/components/Toolbar'
import Sidebar from '@/components/Sidebar'
import DynamicCanvas from '@/components/DynamicCanvas'
import CalibrationDrawer from '@/components/CalibrationDrawer'
import ImageDrawer from '@/components/ImageDrawer'
import ProjectsDrawer from '@/components/ProjectsDrawer'
import MeasureDrawer from '@/components/MeasureDrawer'
import SettingsDrawer from '@/components/SettingsDrawer'
import PropertiesPanel from '@/components/PropertiesPanel'
import { useCalibration } from '@/lib/useCalibration'
import { type EquipmentItem } from '@/lib/equipmentDatabase'

export default function Home() {
  // Drawer states
  const [equipmentLibraryOpen, setEquipmentLibraryOpen] = useState(false)
  const [calibrationOpen, setCalibrationOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [measureOpen, setMeasureOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const [satelliteImageData, setSatelliteImageData] = useState(null)
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null)
  
  // Calibration system
  const {
    calibrationState,
    startCalibration,
    updateCalibration,
    editCalibration,
    resetCalibration,
    cancelCalibration
  } = useCalibration()
  
  // Ensure only one drawer is open at a time
  const closeAllDrawers = () => {
    setEquipmentLibraryOpen(false)
    setCalibrationOpen(false)
    setImageOpen(false)
    setProjectsOpen(false)
    setMeasureOpen(false)
    setSettingsOpen(false)
    setPropertiesOpen(false)
  }
  
  const toggleDrawer = (drawerName: string) => {
    closeAllDrawers()
    switch (drawerName) {
      case 'equipment':
        setEquipmentLibraryOpen(true)
        break
      case 'calibration':
        setCalibrationOpen(true)
        if (!calibrationState.isActive) {
          startCalibration()
        }
        break
      case 'image':
        setImageOpen(true)
        break
      case 'projects':
        setProjectsOpen(true)
        break
      case 'measure':
        setMeasureOpen(true)
        break
      case 'settings':
        setSettingsOpen(true)
        break
    }
  }

  return (
    <div className="h-full bg-ios-gray-light">
      {/* Fixed Toolbar */}
      <Toolbar 
        equipmentLibraryOpen={equipmentLibraryOpen}
        onToggleEquipmentLibrary={() => toggleDrawer('equipment')}
        calibrationOpen={calibrationOpen}
        onToggleCalibration={() => toggleDrawer('calibration')}
        imageOpen={imageOpen}
        onToggleImage={() => toggleDrawer('image')}
        projectsOpen={projectsOpen}
        onToggleProjects={() => toggleDrawer('projects')}
        measureOpen={measureOpen}
        onToggleMeasure={() => toggleDrawer('measure')}
        settingsOpen={settingsOpen}
        onToggleSettings={() => toggleDrawer('settings')}
      />
      
      {/* Main Content Area - offset for fixed toolbar */}
      <div className="
        h-full flex landscape:flex-row portrait:flex-col
        landscape:ml-20 landscape:mt-0 portrait:ml-0 portrait:mt-16
      ">
        {/* Equipment Library Drawer */}
        <Sidebar 
          isOpen={equipmentLibraryOpen}
          onClose={closeAllDrawers}
          onToggleProperties={() => setPropertiesOpen(!propertiesOpen)}
          onEquipmentSelect={setSelectedEquipment}
        />
        
        {/* Main Canvas Area */}
        <div className="flex-1 p-4 landscape:p-6">
          <div className="h-full canvas-container">
            <DynamicCanvas
              selectedTool="select"
              isCalibrating={calibrationState.isActive}
              onCalibrationComplete={() => {
                setCalibrationOpen(false)
              }}
              satelliteImageData={satelliteImageData}
            />
          </div>
        </div>
        
        {/* All Drawers */}
        <CalibrationDrawer
          isOpen={calibrationOpen}
          calibrationState={calibrationState}
          onClose={closeAllDrawers}
          onSave={updateCalibration}
          onEdit={editCalibration}
          onReset={resetCalibration}
          onCancel={() => {
            cancelCalibration()
            closeAllDrawers()
          }}
        />
        
        <ImageDrawer
          isOpen={imageOpen}
          onClose={closeAllDrawers}
          onSatelliteImageLoad={(imageData) => {
            // Pass satellite image data to canvas
            console.log('Satellite image loaded:', imageData)
            setSatelliteImageData(imageData)
          }}
        />
        
        <ProjectsDrawer
          isOpen={projectsOpen}
          onClose={closeAllDrawers}
        />
        
        <MeasureDrawer
          isOpen={measureOpen}
          onClose={closeAllDrawers}
        />
        
        <SettingsDrawer
          isOpen={settingsOpen}
          onClose={closeAllDrawers}
        />
        
        {/* Properties Panel */}
        <PropertiesPanel
          isOpen={equipmentLibraryOpen && propertiesOpen}
          onClose={() => setPropertiesOpen(false)}
          selectedEquipment={selectedEquipment}
        />
      </div>
    </div>
  )
}
