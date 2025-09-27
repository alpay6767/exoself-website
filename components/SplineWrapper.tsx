'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import Spline with no SSR
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-pulse">
      <div className="flex items-center justify-center h-full">
        <div className="w-32 h-32 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )
})

interface SplineWrapperProps {
  scene: string
  style?: React.CSSProperties
  className?: string
}

export default function SplineWrapper({ scene, style, className }: SplineWrapperProps) {
  return (
    <Suspense fallback={
      <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="w-32 h-32 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <Spline scene={scene} style={style} className={className} />
    </Suspense>
  )
}