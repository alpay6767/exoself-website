'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import DashboardPage from '../../dashboard/page'

export default function GermanDashboardPage() {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    setSelectedLanguage('DE')
  }, [setSelectedLanguage])

  return <DashboardPage />
}
