'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import HomePage from '../page'

export default function EnglishPage() {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    setSelectedLanguage('EN')
  }, [setSelectedLanguage])

  return <HomePage />
}