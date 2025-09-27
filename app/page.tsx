'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Brain, Upload, Sparkles, ArrowRight, MessageSquare, ChevronRight, Bot, Heart, Zap, Shield, Cpu, Network } from 'lucide-react'
import Link from 'next/link'
import Spline from '@splinetool/react-spline'
import { useLanguage } from '../context/LanguageContext'
import Header from '../components/Header'

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const { selectedLanguage, t } = useLanguage()

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="relative bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section - Apple Style with 3D Robot Background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 pb-20 overflow-hidden">
        {/* 3D Robot Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 backdrop-blur-[1px]">
            <Spline
              scene="https://prod.spline.design/e1bqXDWodsXpkBGO/scene.splinecode"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pointer-events-none">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="text-center"
          >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-2xl"
          >
            {t.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-100 font-normal max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-lg"
          >
            {t.hero.subtitle}
            <br />
            {t.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto"
          >
            <Link href={`/${selectedLanguage.toLowerCase()}/auth/signin`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all shadow-xl backdrop-blur-sm"
              >
{t.hero.startButton}
              </motion.button>
            </Link>

            <Link href="#features">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-white border-2 border-white/30 px-8 py-4 rounded-full text-lg font-medium hover:border-white transition-all backdrop-blur-sm"
              >
{t.hero.learnMore}
              </motion.button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-sm text-gray-200 mt-8 font-medium drop-shadow-lg"
          >
            {t.hero.privacyNote}
          </motion.p>
          </motion.div>
        </div>

        {/* Subtle Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none z-5" />

        {/* Floating Elements - Very Subtle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-2 h-2 bg-gray-300 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section - Apple Style */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
              {t.features.title}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 mb-20">
            {[
              {
                title: t.features.privacyFirst.title,
                description: t.features.privacyFirst.description,
                icon: Shield,
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                title: t.features.authenticPersonality.title,
                description: t.features.authenticPersonality.description,
                icon: Brain,
                gradient: 'from-purple-500 to-indigo-600'
              },
              {
                title: t.features.alwaysLearning.title,
                description: t.features.alwaysLearning.description,
                icon: Network,
                gradient: 'from-blue-500 to-cyan-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-black mb-4">{feature.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Apple Style */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
              {t.howItWorks.title}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                number: '01',
                title: t.howItWorks.step1.title,
                description: t.howItWorks.step1.description,
                icon: Upload
              },
              {
                number: '02',
                title: t.howItWorks.step2.title,
                description: t.howItWorks.step2.description,
                icon: Brain
              },
              {
                number: '03',
                title: t.howItWorks.step3.title,
                description: t.howItWorks.step3.description,
                icon: Sparkles
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <div className="text-sm font-semibold text-gray-500 mb-3 tracking-wider uppercase">{step.number}</div>
                <h3 className="text-2xl font-semibold text-black mb-4">{step.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision - Robot Bodies */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
              {t.sections.physicalFuture.title}
            </h2>
            <p className="text-xl text-gray-600 font-normal max-w-3xl mx-auto leading-relaxed">
              {t.sections.physicalFuture.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Bot className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-3xl font-semibold text-black mb-6">{t.sections.physicalFuture.comingSoon}</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t.sections.physicalFuture.description}
            </p>
            <Link href={`/${selectedLanguage.toLowerCase()}/robots`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-black border-2 border-gray-300 px-8 py-3 rounded-full font-medium hover:border-black transition-all inline-flex items-center gap-2"
              >
                {t.sections.physicalFuture.exploreButton}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Apple Style */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
              {t.sections.cta.title.split('\\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-xl text-gray-600 font-normal mb-12 max-w-2xl mx-auto leading-relaxed">
              {t.sections.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={`/${selectedLanguage.toLowerCase()}/auth/signin`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-black text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all shadow-lg inline-flex items-center gap-3"
                >
                  {t.sections.cta.getStartedButton}
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
              <Link href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-gray-600 hover:text-black transition-colors font-medium text-lg"
                >
                  {t.sections.cta.learnHowButton}
                </motion.button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-8">
              {t.sections.cta.disclaimer}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer - Apple Style */}
      <footer className="border-t border-gray-200 py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-xl font-semibold text-black">Exoself</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.sections.footer.tagline}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-black mb-4">{t.sections.footer.product}</h4>
              <div className="space-y-3 text-sm">
                <Link href="#features" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.features}</Link>
                <Link href="#how-it-works" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.howItWorks}</Link>
                <Link href={`/${selectedLanguage.toLowerCase()}/robots`} className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.robotBodies}</Link>
                <Link href={`/${selectedLanguage.toLowerCase()}/dashboard`} className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.dashboard}</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-black mb-4">{t.sections.footer.company}</h4>
              <div className="space-y-3 text-sm">
                <Link href="/privacy" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.privacy}</Link>
                <Link href="/terms" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.terms}</Link>
                <a href="mailto:support@exoself.com" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.support}</a>
                <a href="mailto:hello@exoself.com" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.contact}</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-black mb-4">{t.sections.footer.connect}</h4>
              <div className="space-y-3 text-sm">
                <a href="#" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.twitter}</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.linkedin}</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors">{t.sections.footer.links.github}</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              {t.sections.footer.copyright}
            </div>
            <div className="text-sm text-gray-500">
              {t.sections.footer.madeWith}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}