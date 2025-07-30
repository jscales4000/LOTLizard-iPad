'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the Konva component with no SSR
// This ensures Konva only loads in the browser environment
const DynamicKonvaDragDropPOC = dynamic(
  () => import('@/components/KonvaDragDropPOC'),
  { ssr: false, loading: () => <LoadingFallback /> }
)

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading Konva Canvas...</p>
      </div>
    </div>
  )
}

export default function KonvaTestPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold">Konva.js iPad Drag-and-Drop POC</h1>
        <p className="text-sm text-gray-600">
          Testing touch-optimized drag-and-drop with native Konva.js functionality
        </p>
      </div>
      
      <div className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <DynamicKonvaDragDropPOC width={800} height={600} />
        </Suspense>
      </div>
    </div>
  )
}
