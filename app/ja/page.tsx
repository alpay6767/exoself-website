'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import HomePage from '../page'

export default function JapanesePage() {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    setSelectedLanguage('JA')
  }, [setSelectedLanguage])

  return <HomePage />
}
