import type { Metadata } from 'next'
import { translations } from '../../lib/translations'

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'de' },
    { lang: 'ja' }
  ]
}

export default async function LanguageLayout({ children, params }: Props) {
  // Validate language parameter
  const { lang } = await params
  const langUpper = lang?.toUpperCase()
  if (!langUpper || !translations[langUpper as keyof typeof translations]) {
    return <div>Invalid language</div>
  }

  return <>{children}</>
}