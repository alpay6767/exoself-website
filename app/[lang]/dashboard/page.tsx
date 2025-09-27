'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import DashboardPage from '../../dashboard/page'

type Props = {
  params: Promise<{ lang: string }>
}

export default function LanguageDashboardPage({ params }: Props) {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    params.then(({ lang }) => {
      const langUpper = lang?.toUpperCase()
      if (langUpper && ['EN', 'DE', 'JA'].includes(langUpper)) {
        setSelectedLanguage(langUpper as any)
      }
    })
  }, [params, setSelectedLanguage])

  return <DashboardPage />
}