import type { Metadata } from 'next'
import { translations } from '../../lib/translations'

type Props = {
  children: React.ReactNode
  params: { lang: string }
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'de' },
    { lang: 'ja' }
  ]
}

export default function LanguageLayout({ children, params }: Props) {
  // Validate language parameter
  const lang = params.lang?.toUpperCase()
  if (!lang || !translations[lang as keyof typeof translations]) {
    return <div>Invalid language</div>
  }

  return <>{children}</>
}