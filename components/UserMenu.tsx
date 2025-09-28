'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Brain,
  MessageCircle,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from '../lib/supabase'

interface UserMenuProps {
  user: any
  showName?: boolean
}

export default function UserMenu({ user, showName = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      setIsOpen(false) // Close menu immediately
      await signOut()

      // Clear any stored auth state
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_origin_domain')
        localStorage.clear() // Clear any cached auth state
      }

      // Force a hard refresh to clear all state
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: still redirect even if signOut fails
      window.location.href = '/'
    }
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''

  // Multiple ways Google might provide the avatar URL
  const avatarUrl = user?.user_metadata?.avatar_url ||
                   user?.user_metadata?.picture ||
                   user?.identities?.[0]?.identity_data?.avatar_url ||
                   user?.identities?.[0]?.identity_data?.picture

  // Debug: Log user data to console (remove this in production)
  if (typeof window !== 'undefined' && user) {
    console.log('User data for avatar:', {
      user_metadata: user.user_metadata,
      identities: user.identities,
      avatarUrl: avatarUrl
    })
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-full hover:bg-gray-50"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-100">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide broken image and show fallback
                e.currentTarget.style.display = 'none'
                if (e.currentTarget.nextSibling) {
                  (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'
                }
              }}
            />
          ) : null}
          <div
            className={`w-full h-full bg-black flex items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}
          >
            <User className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Name (optional) */}
        {showName && (
          <span className="text-sm font-medium hidden md:block">{displayName}</span>
        )}

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[280px]"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken image and show fallback
                        e.currentTarget.style.display = 'none'
                        if (e.currentTarget.nextSibling) {
                          (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full bg-black flex items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{displayName}</p>
                  <p className="text-xs text-gray-600 truncate">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ backgroundColor: 'rgb(249, 250, 251)' }}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-black transition-colors text-left"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </motion.button>
              </Link>

              <Link href="/chat">
                <motion.button
                  whileHover={{ backgroundColor: 'rgb(249, 250, 251)' }}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-black transition-colors text-left"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with Echo
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ backgroundColor: 'rgb(249, 250, 251)' }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-black transition-colors text-left"
              >
                <Settings className="w-4 h-4" />
                Settings
              </motion.button>
            </div>

            {/* Sign Out */}
            <div className="border-t border-gray-100">
              <motion.button
                whileHover={{ backgroundColor: 'rgb(254, 242, 242)' }}
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:text-red-700 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simplified login prompt for unauthenticated users
export function LoginPrompt() {
  return (
    <Link href="/auth/signin">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-full hover:bg-gray-50"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <span className="text-sm font-medium hidden md:block">Sign in</span>
      </motion.button>
    </Link>
  )
}