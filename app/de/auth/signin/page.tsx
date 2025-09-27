'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import SignInPage from '../../../auth/signin/page'

type Props = {
  params: { lang: string }
}

export default function LanguageSignInPage({ params }: Props) {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    const lang = params.lang?.toUpperCase()
    if (lang && ['EN', 'DE', 'JA'].includes(lang)) {
      setSelectedLanguage(lang as any)
    }
  }, [params.lang, setSelectedLanguage])

  return <SignInPage />
}