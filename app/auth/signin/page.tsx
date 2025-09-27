'use client'

import { motion } from 'framer-motion'
import { Brain, ArrowLeft, Mail, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Header from '../../../components/Header'
import { useLanguage } from '../../../context/LanguageContext'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    // Implement Google OAuth here
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to dashboard
      window.location.href = '/dashboard'
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="flex items-center justify-center px-6 py-12 pt-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link href="/">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
        </Link>

        {/* Sign In Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-black mb-2">{t.signin.title}</h1>
            <p className="text-gray-600">{t.signin.subtitle}</p>
          </div>

          {/* Google Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
{t.signin.signInButton}
              </>
            )}
          </motion.button>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>{t.signin.features.secure}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-orange-500" />
              <span>{t.signin.features.quickSetup}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>{t.signin.features.privacy}</span>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-8">
            {t.signin.terms}{' '}
            <a href="/terms" className="text-black hover:text-gray-600 underline">{t.signin.termsLink}</a>
            {' '}{t.signin.and}{' '}
            <a href="/privacy" className="text-black hover:text-gray-600 underline">{t.signin.privacyLink}</a>
          </p>
        </div>
      </motion.div>
      </div>
    </main>
  )
}