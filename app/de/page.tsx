'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import HomePage from '../page'

export default function GermanPage() {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    setSelectedLanguage('DE')
  }, [setSelectedLanguage])

  return <HomePage />
}
