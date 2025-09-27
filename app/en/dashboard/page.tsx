'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import DashboardPage from '../../dashboard/page'

export default function EnglishDashboardPage() {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    setSelectedLanguage('EN')
  }, [setSelectedLanguage])

  return <DashboardPage />
}
