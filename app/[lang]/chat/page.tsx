'use client'

import { useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import ChatPage from '../../chat/page'

type Props = {
  params: { lang: string }
}

export default function LanguageChatPage({ params }: Props) {
  const { setSelectedLanguage } = useLanguage()

  useEffect(() => {
    const lang = params.lang?.toUpperCase()
    if (lang && ['EN', 'DE', 'JA'].includes(lang)) {
      setSelectedLanguage(lang as any)
    }
  }, [params.lang, setSelectedLanguage])

  return <ChatPage />
}