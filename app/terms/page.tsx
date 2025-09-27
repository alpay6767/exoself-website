'use client'

import { motion } from 'framer-motion'
import { Brain, ArrowLeft, FileText, AlertTriangle, CheckCircle, Scale } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
              <Scale className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-400 font-light">
              The legal framework for digital consciousness
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: September 23, 2024
            </p>
          </motion.div>

          {/* Key Points */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {[
              {
                icon: FileText,
                title: 'Simple Terms',
                description: 'No legal jargon. Clear, understandable language for everyone'
              },
              {
                icon: CheckCircle,
                title: 'Fair Use',
                description: 'Reasonable usage limits and transparent pricing'
              },
              {
                icon: AlertTriangle,
                title: 'Your Responsibility',
                description: 'Guidelines for ethical use of digital consciousness technology'
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

          {/* Terms Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 space-y-8"
          >
            <div>
              <h2 className="text-3xl font-light text-white mb-4">Acceptance of Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>By using Exoself, you agree to these terms. If you don't agree, please don't use our service.</p>
                <p>We may update these terms occasionally. We'll notify you of significant changes via email or through the service.</p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">What Exoself Is</h2>
              <div className="text-gray-300 space-y-4">
                <p>Exoself is a digital consciousness preservation system that:</p>
                <ul className="space-y-2 text-gray-400 ml-6">
                  <li>• Creates AI-powered digital replicas ("Echos") of your personality</li>
                  <li>• Analyzes your personal communication data to build personality models</li>
                  <li>• Enables you to chat with your digital Echo</li>
                  <li>• Plans to offer robot embodiment in the future</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Your Responsibilities</h2>
              <div className="space-y-6">
                <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl text-white mb-3">Data You Provide</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• Only upload data you have the legal right to use</li>
                    <li>• Don't upload other people's private conversations without permission</li>
                    <li>• Ensure your data doesn't contain illegal content</li>
                    <li>• Be truthful about the source and ownership of your data</li>
                  </ul>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl text-white mb-3">Using Your Echo</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• Don't use your Echo to impersonate the real you for fraud</li>
                    <li>• Don't share Echo access for commercial purposes without permission</li>
                    <li>• Remember that Echos are AI approximations, not perfect replicas</li>
                    <li>• Use the technology ethically and responsibly</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Our Responsibilities</h2>
              <div className="space-y-4 text-gray-300">
                <div className="bg-green-950/20 rounded-xl p-6 border border-green-500/20">
                  <h3 className="text-xl text-white mb-3">What We Promise</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• Protect your data with industry-standard security</li>
                    <li>• Be transparent about how we process your information</li>
                    <li>• Provide reasonable service uptime and availability</li>
                    <li>• Continuously improve the Echo accuracy and capabilities</li>
                  </ul>
                </div>

                <div className="bg-yellow-950/20 rounded-xl p-6 border border-yellow-500/20">
                  <h3 className="text-xl text-white mb-3">Important Limitations</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• Echos are AI approximations, not perfect consciousness transfers</li>
                    <li>• Service may occasionally be unavailable for maintenance</li>
                    <li>• We can't guarantee 100% data accuracy or Echo responses</li>
                    <li>• Future robot body features are planned but not guaranteed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Usage Limits & Pricing</h2>
              <div className="space-y-4 text-gray-300">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                    <h3 className="text-xl text-white mb-3">Free Tier</h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li>• Up to 50,000 messages processed</li>
                      <li>• Basic Echo creation and chat</li>
                      <li>• Local-only processing</li>
                      <li>• Community support</li>
                    </ul>
                  </div>
                  <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                    <h3 className="text-xl text-white mb-3">Premium Features</h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li>• Unlimited message processing</li>
                      <li>• Cloud sync across devices</li>
                      <li>• Advanced personality analysis</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Intellectual Property</h2>
              <div className="text-gray-300 space-y-4">
                <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl text-white mb-3">Your Content</h3>
                  <p className="text-gray-400 text-sm mb-2">You retain ownership of all data you provide to Exoself:</p>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• Your conversations and personal data remain yours</li>
                    <li>• Your Echo personality model belongs to you</li>
                    <li>• You can export or delete your data anytime</li>
                  </ul>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-purple-500/10">
                  <h3 className="text-xl text-white mb-3">Our Technology</h3>
                  <p className="text-gray-400 text-sm mb-2">Exoself's core technology and platform remain our property:</p>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• AI models and processing algorithms</li>
                    <li>• Website, app, and user interface</li>
                    <li>• Brand name, logos, and trademarks</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Account Termination</h2>
              <div className="space-y-4 text-gray-300">
                <div className="bg-black/20 rounded-xl p-6 border border-red-500/20">
                  <h3 className="text-xl text-white mb-3">If You Want to Leave</h3>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• Delete your account anytime from settings</li>
                    <li>• Export your data before deletion</li>
                    <li>• We'll permanently delete your data within 30 days</li>
                  </ul>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-red-500/20">
                  <h3 className="text-xl text-white mb-3">If We Need to Suspend Your Account</h3>
                  <p className="text-gray-400 text-sm mb-2">We may suspend accounts for:</p>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li>• Violation of these terms</li>
                    <li>• Illegal activity or content</li>
                    <li>• Non-payment of premium services</li>
                    <li>• We'll give you 30 days notice when possible</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Disclaimers & Legal Stuff</h2>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-500/20 text-gray-400 text-sm space-y-4">
                <p><strong>Service "As Is":</strong> Exoself is provided as-is. We make no warranties about service availability, Echo accuracy, or fitness for specific purposes.</p>

                <p><strong>Limitation of Liability:</strong> Our liability is limited to the amount you've paid us in the last 12 months. We're not responsible for indirect damages or lost data (though we try our best to prevent issues).</p>

                <p><strong>Governing Law:</strong> These terms are governed by Delaware state law. Any disputes will be resolved in Delaware courts or through arbitration.</p>

                <p><strong>Changes to Terms:</strong> We may update these terms. Significant changes will be communicated via email with 30 days notice.</p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-light text-white mb-4">Questions?</h2>
              <div className="text-gray-300 space-y-4">
                <p>We're here to help explain anything that's unclear.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="mailto:legal@exoself.ai" className="text-purple-400 hover:text-purple-300 transition-colors">
                    legal@exoself.ai
                  </Link>
                  <span className="text-gray-500">•</span>
                  <Link href="mailto:support@exoself.ai" className="text-purple-400 hover:text-purple-300 transition-colors">
                    support@exoself.ai
                  </Link>
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
            <Link href="/auth/signin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-full font-light transition-all inline-flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5" />
                I Agree - Create My Echo
              </motion.button>
            </Link>
            <p className="text-xs text-gray-500 mt-4">
              By clicking this button, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  )
}