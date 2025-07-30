'use client'

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

// Dynamically import Canvas component to prevent SSR issues with Konva
const Canvas = dynamic(() => import('./Canvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading canvas...</div>
    </div>
  )
})

type CanvasProps = ComponentProps<typeof Canvas>

export default function DynamicCanvas(props: CanvasProps) {
  return <Canvas {...props} />
}
