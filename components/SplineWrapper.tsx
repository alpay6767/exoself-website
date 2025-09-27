'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'

// Dynamically import Spline with no SSR
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse">
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-2 border-purple-400/50 border-t-transparent rounded-full animate-spin"></div>
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
  const [isClient, setIsClient] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleError = () => {
    setHasError(true)
  }

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-2 border-purple-400/50 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-indigo-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 bg-purple-400 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500">3D Experience Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="w-full h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-2 border-purple-400/50 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <div className={className} style={style}>
        <Spline
          scene={scene}
          onError={handleError}
          onLoad={() => console.log('Spline scene loaded successfully')}
        />
      </div>
    </Suspense>
  )
}