'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Brain, Globe, Check, Settings } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../context/LanguageContext'

export default function Header() {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const { selectedLanguage, setSelectedLanguage, t, languages } = useLanguage()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false)
      }
    }

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLanguageDropdown])

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link href={`/${selectedLanguage.toLowerCase()}`} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-semibold text-black">Exoself</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href={`/${selectedLanguage.toLowerCase()}#features`} className="text-gray-600 hover:text-black transition-colors">
              {t.nav.features}
            </Link>
            <Link href={`/${selectedLanguage.toLowerCase()}#how-it-works`} className="text-gray-600 hover:text-black transition-colors">
              {t.nav.howItWorks}
            </Link>
            <Link href={`/${selectedLanguage.toLowerCase()}/robots`} className="text-gray-600 hover:text-black transition-colors">
              {t.nav.robotBodies}
            </Link>
            <Link href={`/${selectedLanguage.toLowerCase()}/dashboard`} className="text-gray-600 hover:text-black transition-colors">
              {t.nav.dashboard}
            </Link>
            <Link href={`/${selectedLanguage.toLowerCase()}/chat`} className="text-gray-600 hover:text-black transition-colors">
              {t.nav.chat}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative" ref={languageDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-full hover:bg-gray-50"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedLanguage}</span>
              </motion.button>

              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[160px]"
                >
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setSelectedLanguage(language.code)
                        setShowLanguageDropdown(false)
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                      </div>
                      {selectedLanguage === language.code && (
                        <Check className="w-4 h-4 text-black" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <Link href={`/${selectedLanguage.toLowerCase()}/auth/signin`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {t.nav.getStarted}
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}