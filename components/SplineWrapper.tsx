'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'

// Dynamically import Spline with no SSR and proper error boundary
const Spline = dynamic(async () => {
  try {
    const module = await import('@splinetool/react-spline')
    return { default: module.default }
  } catch (error) {
    console.warn('Spline import error, using fallback:', error)
    // Return a fallback component that shows our loading state
    return {
      default: ({ scene, onError, onLoad, ...props }: any) => {
        useEffect(() => {
          onError && onError(new Error('Spline component unavailable'))
        }, [onError])
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
    }
  }
}, {
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

    // Add global error handler for Spline runtime issues
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('ReactCurrentOwner') ||
          event.error?.message?.includes('Cannot read properties of undefined')) {
        console.warn('Spline React compatibility issue detected, using fallback')
        setHasError(true)
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleGlobalError)

    return () => {
      window.removeEventListener('error', handleGlobalError)
    }
  }, [])

  const handleError = (error?: any) => {
    console.warn('Spline loading error:', error)
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