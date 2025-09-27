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
    const { lang } = params
    const langUpper = lang?.toUpperCase()
    if (langUpper && ['EN', 'DE', 'JA'].includes(langUpper)) {
      setSelectedLanguage(langUpper as any)
    }
  }, [params, setSelectedLanguage])

  return <SignInPage />
}