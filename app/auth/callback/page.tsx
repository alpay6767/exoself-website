'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session after OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/signin?error=auth_failed')
          return
        }

        if (session) {
          // Successfully authenticated - redirect to dashboard on current domain
          router.push('/dashboard')
        } else {
          // No session - redirect to signin
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/signin?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}