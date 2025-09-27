'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { translations, languages, LanguageCode, TranslationKey } from '../lib/translations'

interface LanguageContextType {
  selectedLanguage: LanguageCode
  setSelectedLanguage: (lang: LanguageCode) => void
  t: TranslationKey
  languages: typeof languages
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('EN')
  const pathname = usePathname()
  const router = useRouter()

  // Extract language from URL path
  const getLanguageFromPath = (path: string): LanguageCode => {
    const segments = path.split('/').filter(Boolean)
    const possibleLang = segments[0]?.toUpperCase() as LanguageCode
    return translations[possibleLang] ? possibleLang : 'EN'
  }

  // Get clean path without language prefix
  const getCleanPath = (path: string): string => {
    const segments = path.split('/').filter(Boolean)
    const possibleLang = segments[0]?.toUpperCase() as LanguageCode
    if (translations[possibleLang]) {
      return '/' + segments.slice(1).join('/')
    }
    return path
  }

  // Initialize language from URL on mount
  useEffect(() => {
    const langFromPath = getLanguageFromPath(pathname)
    const savedLang = localStorage.getItem('exoself-language') as LanguageCode

    // Priority: URL > localStorage > default
    if (langFromPath !== 'EN') {
      setSelectedLanguage(langFromPath)
      localStorage.setItem('exoself-language', langFromPath)
    } else if (savedLang && translations[savedLang]) {
      setSelectedLanguage(savedLang)
      // Update URL to include language
      const cleanPath = getCleanPath(pathname)
      const newPath = savedLang === 'EN' ? cleanPath : `/${savedLang.toLowerCase()}${cleanPath}`
      if (newPath !== pathname) {
        router.replace(newPath)
      }
    } else {
      setSelectedLanguage('EN')
      localStorage.setItem('exoself-language', 'EN')
    }
  }, [pathname, router])

  // Handle language change
  const handleLanguageChange = (lang: LanguageCode) => {
    setSelectedLanguage(lang)
    localStorage.setItem('exoself-language', lang)

    // Update URL - Always include language prefix now
    const cleanPath = getCleanPath(pathname)
    const newPath = `/${lang.toLowerCase()}${cleanPath || ''}`

    router.push(newPath)
  }

  const t = translations[selectedLanguage]

  return (
    <LanguageContext.Provider value={{
      selectedLanguage,
      setSelectedLanguage: handleLanguageChange,
      t,
      languages
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}