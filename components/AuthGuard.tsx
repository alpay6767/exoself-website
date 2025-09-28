'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getCurrentUser } from '../lib/supabase'
import { Brain } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, redirectTo = '/auth/signin' }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser()

        if (error || !user) {
          setIsAuthenticated(false)
          router.push(redirectTo)
          return
        }

        setUser(user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        router.push(redirectTo)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show redirecting message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-black mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Redirecting to sign in...</p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto"
          />
        </div>
      </div>
    )
  }

  // Authenticated - render children with user context
  return <>{children}</>
}

// Hook to access current user in protected components
export function useAuthGuard() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { user } = await getCurrentUser()
      setUser(user)
      setIsLoading(false)
    }
    getUser()
  }, [])

  return { user, isLoading }
}