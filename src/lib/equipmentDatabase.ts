export interface EquipmentItem {
  id: string
  name: string
  category: string
  size: 'Small' | 'Medium' | 'Large' | 'Extra Large'
  dimensions: {
    width: number // feet
    length: number // feet
    height?: number // feet
  }
  capacity?: number
  powerRequirement?: string
  setupTime?: string
  operatorCount?: number
  description: string
  thumbnail: string
  color: string
  popularity: number // 1-10 for sorting
}

export const equipmentCategories = [
  {
    name: 'Rides',
    icon: '🎠',
    description: 'Carnival rides and attractions'
  },
  {
    name: 'Games',
    icon: '🎯',
    description: 'Midway games and skill challenges'
  },
  {
    name: 'Food',
    icon: '🍿',
    description: 'Food stands and concessions'
  },
  {
    name: 'Utilities',
    icon: '⚡',
    description: 'Power, water, and utility equipment'
  },
  {
    name: 'Structures',
    icon: '🏗️',
    description: 'Tents, stages, and temporary structures'
  },
  {
    name: 'Services',
    icon: '🚻',
    description: 'Restrooms, first aid, and services'
  }
]

export const equipmentDatabase: EquipmentItem[] = [
  // RIDES
  {
    id: 'ride-001',
    name: 'Ferris Wheel',
    category: 'Rides',
    size: 'Extra Large',
    dimensions: { width: 80, length: 80, height: 100 },
    capacity: 48,
    powerRequirement: '480V, 100A',
    setupTime: '8-12 hours',
    operatorCount: 2,
    description: 'Classic 100ft Ferris wheel with 24 gondolas, LED lighting package',
    thumbnail: '🎡',
    color: '#FF6B6B',
    popularity: 10
  },
  {
    id: 'ride-002',
    name: 'Carousel',
    category: 'Rides',
    size: 'Large',
    dimensions: { width: 50, length: 50, height: 20 },
    capacity: 36,
    powerRequirement: '240V, 60A',
    setupTime: '4-6 hours',
    operatorCount: 1,
    description: 'Traditional carousel with 36 hand-carved horses, organ music',
    thumbnail: '🎠',
    color: '#FFD93D',
    popularity: 9
  },
  {
    id: 'ride-003',
    name: 'Bumper Cars',
    category: 'Rides',
    size: 'Large',
    dimensions: { width: 60, length: 40, height: 12 },
    capacity: 20,
    powerRequirement: '480V, 80A',
    setupTime: '3-4 hours',
    operatorCount: 1,
    description: 'Electric bumper car arena with 20 cars, padded barriers',
    thumbnail: '🚗',
    color: '#4ECDC4',
    popularity: 8
  },
  {
    id: 'ride-004',
    name: 'Tilt-a-Whirl',
    category: 'Rides',
    size: 'Medium',
    dimensions: { width: 40, length: 40, height: 15 },
    capacity: 21,
    powerRequirement: '240V, 40A',
    setupTime: '2-3 hours',
    operatorCount: 1,
    description: 'Spinning ride with 7 cars, each seating 3 passengers',
    thumbnail: '🌪️',
    color: '#45B7D1',
    popularity: 7
  },
  {
    id: 'ride-005',
    name: 'Zipper',
    category: 'Rides',
    size: 'Large',
    dimensions: { width: 25, length: 80, height: 60 },
    capacity: 24,
    powerRequirement: '480V, 120A',
    setupTime: '6-8 hours',
    operatorCount: 2,
    description: 'High-thrill ride with rotating cars on an oval track',
    thumbnail: '⚡',
    color: '#E74C3C',
    popularity: 6
  },

  // GAMES
  {
    id: 'game-001',
    name: 'Ring Toss',
    category: 'Games',
    size: 'Small',
    dimensions: { width: 8, length: 12, height: 8 },
    powerRequirement: '120V, 15A',
    setupTime: '30 minutes',
    operatorCount: 1,
    description: 'Classic ring toss game with milk bottles and prizes',
    thumbnail: '🎯',
    color: '#F39C12',
    popularity: 8
  },
  {
    id: 'game-002',
    name: 'Duck Pond',
    category: 'Games',
    size: 'Small',
    dimensions: { width: 6, length: 8, height: 4 },
    powerRequirement: '120V, 10A',
    setupTime: '20 minutes',
    operatorCount: 1,
    description: 'Pick-a-duck game with floating ducks and prizes',
    thumbnail: '🦆',
    color: '#3498DB',
    popularity: 9
  },
  {
    id: 'game-003',
    name: 'Basketball Shootout',
    category: 'Games',
    size: 'Medium',
    dimensions: { width: 12, length: 20, height: 12 },
    powerRequirement: '120V, 20A',
    setupTime: '45 minutes',
    operatorCount: 1,
    description: 'Multi-hoop basketball game with automatic ball return',
    thumbnail: '🏀',
    color: '#E67E22',
    popularity: 7
  },
  {
    id: 'game-004',
    name: 'Strongman Test',
    category: 'Games',
    size: 'Medium',
    dimensions: { width: 8, length: 8, height: 20 },
    powerRequirement: '120V, 15A',
    setupTime: '1 hour',
    operatorCount: 1,
    description: 'High striker game with bell and hammer',
    thumbnail: '💪',
    color: '#8E44AD',
    popularity: 6
  },

  // FOOD
  {
    id: 'food-001',
    name: 'Food Truck',
    category: 'Food',
    size: 'Large',
    dimensions: { width: 8, length: 24, height: 10 },
    powerRequirement: '240V, 100A',
    setupTime: '1 hour',
    operatorCount: 3,
    description: 'Mobile kitchen with full cooking equipment and serving window',
    thumbnail: '🚚',
    color: '#27AE60',
    popularity: 9
  },
  {
    id: 'food-002',
    name: 'Cotton Candy Stand',
    category: 'Food',
    size: 'Small',
    dimensions: { width: 6, length: 8, height: 8 },
    powerRequirement: '120V, 20A',
    setupTime: '30 minutes',
    operatorCount: 1,
    description: 'Cotton candy machine with display case and supplies',
    thumbnail: '🍭',
    color: '#FF69B4',
    popularity: 10
  },
  {
    id: 'food-003',
    name: 'Popcorn Stand',
    category: 'Food',
    size: 'Small',
    dimensions: { width: 6, length: 6, height: 8 },
    powerRequirement: '120V, 15A',
    setupTime: '20 minutes',
    operatorCount: 1,
    description: 'Popcorn machine with warmer and serving counter',
    thumbnail: '🍿',
    color: '#F1C40F',
    popularity: 8
  },
  {
    id: 'food-004',
    name: 'Funnel Cake Trailer',
    category: 'Food',
    size: 'Medium',
    dimensions: { width: 8, length: 16, height: 9 },
    powerRequirement: '240V, 60A',
    setupTime: '45 minutes',
    operatorCount: 2,
    description: 'Funnel cake fryer with prep area and serving window',
    thumbnail: '🧇',
    color: '#D35400',
    popularity: 7
  },

  // UTILITIES
  {
    id: 'util-001',
    name: 'Generator 100kW',
    category: 'Utilities',
    size: 'Large',
    dimensions: { width: 8, length: 20, height: 8 },
    powerRequirement: 'Diesel fuel',
    setupTime: '2 hours',
    operatorCount: 1,
    description: '100kW diesel generator with automatic transfer switch',
    thumbnail: '⚡',
    color: '#7F8C8D',
    popularity: 5
  },
  {
    id: 'util-002',
    name: 'Water Tank',
    category: 'Utilities',
    size: 'Medium',
    dimensions: { width: 8, length: 8, height: 12 },
    setupTime: '1 hour',
    operatorCount: 1,
    description: '5000 gallon water storage tank with pump system',
    thumbnail: '💧',
    color: '#3498DB',
    popularity: 4
  },
  {
    id: 'util-003',
    name: 'Electrical Panel',
    category: 'Utilities',
    size: 'Small',
    dimensions: { width: 4, length: 6, height: 8 },
    powerRequirement: 'Main feed',
    setupTime: '2 hours',
    operatorCount: 1,
    description: 'Main electrical distribution panel with breakers',
    thumbnail: '🔌',
    color: '#34495E',
    popularity: 3
  },

  // STRUCTURES
  {
    id: 'struct-001',
    name: 'Main Stage',
    category: 'Structures',
    size: 'Extra Large',
    dimensions: { width: 40, length: 60, height: 25 },
    powerRequirement: '480V, 200A',
    setupTime: '6-8 hours',
    operatorCount: 4,
    description: 'Large outdoor stage with sound system and lighting',
    thumbnail: '🎭',
    color: '#9B59B6',
    popularity: 6
  },
  {
    id: 'struct-002',
    name: 'Merchandise Tent',
    category: 'Structures',
    size: 'Medium',
    dimensions: { width: 20, length: 30, height: 12 },
    powerRequirement: '120V, 30A',
    setupTime: '2 hours',
    operatorCount: 2,
    description: '20x30 tent with tables and display racks',
    thumbnail: '⛺',
    color: '#16A085',
    popularity: 5
  },

  // SERVICES
  {
    id: 'service-001',
    name: 'Restroom Trailer',
    category: 'Services',
    size: 'Large',
    dimensions: { width: 8, length: 32, height: 9 },
    powerRequirement: '240V, 50A',
    setupTime: '1 hour',
    operatorCount: 0,
    description: '8-stall restroom trailer with hand washing stations',
    thumbnail: '🚻',
    color: '#2ECC71',
    popularity: 8
  },
  {
    id: 'service-002',
    name: 'First Aid Station',
    category: 'Services',
    size: 'Small',
    dimensions: { width: 8, length: 12, height: 8 },
    powerRequirement: '120V, 20A',
    setupTime: '30 minutes',
    operatorCount: 1,
    description: 'Medical station with supplies and EMT equipment',
    thumbnail: '🏥',
    color: '#E74C3C',
    popularity: 7
  },
  {
    id: 'service-003',
    name: 'Security Office',
    category: 'Services',
    size: 'Small',
    dimensions: { width: 8, length: 10, height: 8 },
    powerRequirement: '120V, 15A',
    setupTime: '20 minutes',
    operatorCount: 1,
    description: 'Security command center with communications equipment',
    thumbnail: '👮',
    color: '#34495E',
    popularity: 4
  }
]

export function getEquipmentByCategory(category: string): EquipmentItem[] {
  return equipmentDatabase
    .filter(item => item.category === category)
    .sort((a, b) => b.popularity - a.popularity)
}

export function searchEquipment(query: string): EquipmentItem[] {
  const searchTerm = query.toLowerCase()
  return equipmentDatabase
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    )
    .sort((a, b) => b.popularity - a.popularity)
}

export function getEquipmentById(id: string): EquipmentItem | undefined {
  return equipmentDatabase.find(item => item.id === id)
}
