'use client'

interface ToolbarProps {
  equipmentLibraryOpen: boolean
  onToggleEquipmentLibrary: () => void
  calibrationOpen: boolean
  onToggleCalibration: () => void
  imageOpen: boolean
  onToggleImage: () => void
  projectsOpen: boolean
  onToggleProjects: () => void
  measureOpen: boolean
  onToggleMeasure: () => void
  settingsOpen: boolean
  onToggleSettings: () => void
}

const drawerToggles = [
  { id: 'equipment', name: 'Equipment Library', icon: '🎪', position: 'left' },
  { id: 'calibration', name: 'Calibration', icon: '📐', position: 'left' },
  { id: 'image', name: 'Image Import', icon: '🖼️', position: 'right' },
  { id: 'projects', name: 'Projects', icon: '📁', position: 'right' },
  { id: 'measure', name: 'Measure Tools', icon: '📏', position: 'right' },
  { id: 'settings', name: 'Settings', icon: '⚙️', position: 'right' },
]

export default function Toolbar({ 
  equipmentLibraryOpen, onToggleEquipmentLibrary,
  calibrationOpen, onToggleCalibration,
  imageOpen, onToggleImage,
  projectsOpen, onToggleProjects,
  measureOpen, onToggleMeasure,
  settingsOpen, onToggleSettings
}: ToolbarProps) {
  return (
    <div className="
      bg-white border-b landscape:border-r landscape:border-b-0 border-ios-gray-light
      landscape:w-20 landscape:h-full portrait:h-16 portrait:w-full
      flex landscape:flex-col portrait:flex-row items-center justify-center
      landscape:py-4 portrait:px-4
      fixed landscape:left-0 landscape:top-0 portrait:top-0 portrait:left-0
      z-50
    ">
      {/* Drawer Toggles */}
      <div className="
        flex landscape:flex-col portrait:flex-row 
        landscape:space-y-3 portrait:space-x-3
        landscape:flex-1 portrait:flex-none
      ">
        {drawerToggles.map((drawer) => {
          let isOpen = false
          let onToggle = () => {}
          
          switch (drawer.id) {
            case 'equipment':
              isOpen = equipmentLibraryOpen
              onToggle = onToggleEquipmentLibrary
              break
            case 'calibration':
              isOpen = calibrationOpen
              onToggle = onToggleCalibration
              break
            case 'image':
              isOpen = imageOpen
              onToggle = onToggleImage
              break
            case 'projects':
              isOpen = projectsOpen
              onToggle = onToggleProjects
              break
            case 'measure':
              isOpen = measureOpen
              onToggle = onToggleMeasure
              break
            case 'settings':
              isOpen = settingsOpen
              onToggle = onToggleSettings
              break
          }
          
          return (
            <button
              key={drawer.id}
              onClick={onToggle}
              className={`
                btn-touch
                ${isOpen
                  ? 'bg-ios-blue text-white'
                  : 'bg-ios-gray-light text-ios-gray-dark hover:bg-gray-100'
                }
              `}
              title={drawer.name}
            >
              <span className="text-lg">{drawer.icon}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
