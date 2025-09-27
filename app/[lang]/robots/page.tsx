'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import RobotsPage from '../../robots/page'

type Props = {
  params: { lang: string }
}

export default function LanguageRobotsPage({ params }: Props) {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    const { lang } = params
    const langUpper = lang?.toUpperCase()
    if (langUpper && ['EN', 'DE', 'JA'].includes(langUpper)) {
      setSelectedLanguage(langUpper as any)
    }
  }, [params, setSelectedLanguage])

  return <RobotsPage />
}