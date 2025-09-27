import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
}

export default function LanguageLayout({ children }: Props) {
  return <>{children}</>
}