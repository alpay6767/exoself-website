'use client'

import { motion } from 'framer-motion'
import { Brain, ArrowLeft, Shield, Lock, Eye, Server, UserX, Download } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5"
      >
        <div className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
            <span className="text-xl font-light text-white tracking-tight">Exoself</span>
          </Link>

          <Link href="/">
            <motion.button
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-400 font-light">
              Your consciousness, your data, your control
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: September 23, 2024
            </p>
          </motion.div>

          {/* Privacy Principles */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {[
              {
                icon: Lock,
                title: 'Local-First',
                description: 'Your data is processed and stored locally on your device by default'
              },
              {
                icon: Eye,
                title: 'Transparent',
                description: 'You can see exactly what data we collect and how it\'s used'
              },
              {
                icon: UserX,
                title: 'No Tracking',
                description: 'We don\'t sell, share, or monetize your personal information'
              }
            ].map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <principle.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{principle.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{principle.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Policy Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 space-y-8"
          >
            <div>
              <h2 className="text-3xl font-light text-white mb-4">What We Collect</h2>
              <div className="text-gray-300 space-y-4">
                <p>Exoself is designed to create your digital consciousness from your personal data. Here's what we collect:</p>

                <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl text-white mb-3">Personal Communication Data</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>• WhatsApp chat exports (.txt files)</li>
                    <li>• Email conversations (when you provide them)</li>
                    <li>• Social media messages (with your permission)</li>
                    <li>• Personal notes and documents you upload</li>
                  </ul>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl text-white mb-3">Account Information</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Google account information (name, email) for authentication</li>
                    <li>• Usage statistics and preferences</li>
                    <li>• Chat interactions with your Echo</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">How We Use Your Data</h2>
              <div className="text-gray-300 space-y-4">
                <p>Your data has one primary purpose: creating and improving your digital Echo.</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                    <h4 className="text-lg text-white mb-2">Echo Creation</h4>
                    <p className="text-gray-400 text-sm">We analyze your communication patterns, writing style, and personality traits to build your digital consciousness.</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                    <h4 className="text-lg text-white mb-2">Model Training</h4>
                    <p className="text-gray-400 text-sm">Your data trains AI models to respond authentically as your digital Echo would.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Data Storage & Security</h2>
              <div className="text-gray-300 space-y-4">
                <div className="bg-black/20 rounded-xl p-6 border border-green-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Server className="w-5 h-5 text-green-400" />
                    <h3 className="text-xl text-white">Local-First Architecture</h3>
                  </div>
                  <p className="text-gray-400 mb-4">By default, your data is processed and stored locally:</p>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• SQLite database on your device</li>
                    <li>• AI processing using local Ollama models</li>
                    <li>• No data transmitted to external servers unless you opt-in</li>
                  </ul>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl text-white mb-3">Optional Cloud Sync</h3>
                  <p className="text-gray-400 text-sm">If you choose cloud sync for multi-device access:</p>
                  <ul className="space-y-2 text-gray-400 text-sm mt-2">
                    <li>• Data encrypted end-to-end before transmission</li>
                    <li>• Stored on secure, SOC 2 compliant servers</li>
                    <li>• You can disable cloud sync anytime</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Your Rights</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl text-white mb-3">Data Control</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• View all your stored data</li>
                    <li>• Download your complete data archive</li>
                    <li>• Delete specific conversations or sources</li>
                    <li>• Permanently delete your entire Echo</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl text-white mb-3">Privacy Settings</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• Choose local-only or cloud sync</li>
                    <li>• Control what data trains your Echo</li>
                    <li>• Set data retention periods</li>
                    <li>• Opt out of usage analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">What We DON'T Do</h2>
              <div className="bg-red-950/20 rounded-xl p-6 border border-red-500/20">
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <UserX className="w-5 h-5 text-red-400" />
                    <span>We never sell or share your personal data</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <UserX className="w-5 h-5 text-red-400" />
                    <span>We don't use your data to train public AI models</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <UserX className="w-5 h-5 text-red-400" />
                    <span>We don't track you across other websites</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <UserX className="w-5 h-5 text-red-400" />
                    <span>We don't monetize your digital consciousness</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Contact & Updates</h2>
              <div className="text-gray-300 space-y-4">
                <p>Questions about your privacy or this policy?</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="mailto:privacy@exoself.ai" className="text-purple-400 hover:text-purple-300 transition-colors">
                    privacy@exoself.ai
                  </Link>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">We'll notify you of policy changes via email</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-full font-light transition-all inline-flex items-center gap-3"
              >
                <Download className="w-5 h-5" />
                Start Creating Your Echo
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  )
}