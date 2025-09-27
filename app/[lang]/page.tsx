'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import HomePage from '../page'

type Props = {
  params: { lang: string }
}

export default function LanguagePage({ params }: Props) {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    const lang = params.lang?.toUpperCase()
    if (lang && ['EN', 'DE', 'JA'].includes(lang)) {
      setSelectedLanguage(lang as any)
    }
  }, [params.lang, setSelectedLanguage])

  return <HomePage />
}