'use client'

import { motion } from 'framer-motion'
import { Brain, ArrowRight, Bot, Cpu, Heart, Shield, Zap, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Spline from '@splinetool/react-spline'
import Header from '../../components/Header'
import { useLanguage } from '../../context/LanguageContext'

const robotModels = [
  {
    id: 'companion',
    name: 'Companion Series',
    tagline: 'Your personality. Human form.',
    price: 'Starting at $47,500',
    description: 'Designed for emotional connection and natural interaction. Be with your loved ones in physical form.',
    features: [
      'Natural conversation AI',
      'Emotional intelligence',
      'Facial expressions & gestures',
      'Human-like mobility',
      'Touch sensitivity',
      'Memory retention'
    ],
    specs: {
      height: '5\'6" - 6\'2"',
      weight: '120 - 180 lbs',
      battery: '48 hours',
      durability: '10+ years'
    },
    available: '2026 Q2'
  },
  {
    id: 'advanced',
    name: 'Advanced Series',
    tagline: 'Beyond human limits.',
    price: 'Starting at $89,200',
    description: 'Enhanced physical and cognitive capabilities. Your consciousness with superhuman potential.',
    features: [
      'Enhanced strength (5x human)',
      'Precision movement',
      'Advanced sensor suite',
      'Self-repair systems',
      'Extended battery life',
      'Environmental adaptation'
    ],
    specs: {
      height: '6\'0" - 6\'6"',
      weight: '200 - 280 lbs',
      battery: '96 hours',
      durability: '20+ years'
    },
    available: '2026 Q4'
  },
  {
    id: 'explorer',
    name: 'Explorer Series',
    tagline: 'Unlimited adventures.',
    price: 'Starting at $156,000',
    description: 'Built for extreme environments and exploration. Your consciousness, unstoppable.',
    features: [
      'All-terrain mobility',
      'Extreme temperature resistance',
      'Underwater capability',
      'Solar charging',
      'Long-range communication',
      'Survival protocols'
    ],
    specs: {
      height: '6\'2" - 6\'8"',
      weight: '250 - 350 lbs',
      battery: '168 hours',
      durability: '30+ years'
    },
    available: '2027 Q1'
  }
]

export default function RobotsPage() {
  const { t } = useLanguage()

  return (
    <main className="relative bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-full px-6 py-2 mb-8">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600 font-light">Available 2026</span>
            </div>

            <h1 className="text-7xl md:text-9xl font-light text-black mb-8 tracking-tight">
              Choose your
              <br />
              <span className="font-normal">body</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 font-light max-w-3xl mx-auto mb-12">
              Transfer your consciousness into a physical form.
              Each model designed for different purposes and lifestyles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Robot Models */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto space-y-32">
          {robotModels.map((robot, index) => (
            <motion.div
              key={robot.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
              className={`grid md:grid-cols-2 gap-16 items-center ${
                index % 2 === 1 ? 'md:grid-flow-dense' : ''
              }`}
            >
              {/* Image/Visual */}
              <div className={`relative h-[600px] bg-white border border-gray-200 rounded-3xl overflow-hidden group shadow-sm ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                {/* 3D Robot Scene for Companion, Silhouettes for others */}
                {robot.id === 'companion' ? (
                  <div className="absolute inset-0 p-4">
                    <Spline
                      scene="https://prod.spline.design/e1bqXDWodsXpkBGO/scene.splinecode"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-16">
                    <div className="relative w-full h-full flex items-center justify-center blur-3xl group-hover:blur-2xl transition-all duration-700">

                    {/* Advanced - Enhanced silhouette */}
                    {robot.id === 'advanced' && (
                      <svg viewBox="0 0 200 400" className="w-full h-full opacity-40">
                        <ellipse cx="100" cy="50" rx="38" ry="45" fill="gray" />
                        <rect x="65" y="95" width="70" height="90" rx="12" fill="gray" />
                        <rect x="45" y="95" width="25" height="140" rx="12" fill="gray" />
                        <rect x="130" y="95" width="25" height="140" rx="12" fill="gray" />
                        <rect x="72" y="185" width="24" height="160" rx="12" fill="gray" />
                        <rect x="104" y="185" width="24" height="160" rx="12" fill="gray" />
                      </svg>
                    )}

                    {/* Explorer - Robust silhouette */}
                    {robot.id === 'explorer' && (
                      <svg viewBox="0 0 200 400" className="w-full h-full opacity-40">
                        <ellipse cx="100" cy="55" rx="42" ry="48" fill="gray" />
                        <rect x="60" y="103" width="80" height="95" rx="14" fill="gray" />
                        <rect x="40" y="103" width="28" height="150" rx="14" fill="gray" />
                        <rect x="132" y="103" width="28" height="150" rx="14" fill="gray" />
                        <rect x="68" y="198" width="28" height="165" rx="14" fill="gray" />
                        <rect x="104" y="198" width="28" height="165" rx="14" fill="gray" />
                      </svg>
                    )}
                    </div>
                  </div>
                )}

                {/* "Unrevealed" Badge - Only show for non-companion robots */}
                {robot.id !== 'companion' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl px-8 py-4 shadow-sm">
                      <span className="text-lg text-black font-light">Design unrevealed</span>
                    </div>
                  </div>
                )}

                {/* Coming Soon Badge */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                  <span className="text-sm text-gray-600 font-light">{robot.available}</span>
                </div>
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}>
                <h2 className="text-6xl font-light text-black mb-4 tracking-tight">
                  {robot.name}
                </h2>
                <p className="text-2xl text-gray-600 font-light mb-8">
                  {robot.tagline}
                </p>
                <p className="text-lg text-gray-600 font-light leading-relaxed mb-12">
                  {robot.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                  {robot.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-black opacity-60 mt-0.5 flex-shrink-0" strokeWidth={1} />
                      <span className="text-sm text-gray-600 font-light">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-6 mb-12 p-6 bg-gray-100 border border-gray-200 rounded-2xl">
                  <div>
                    <div className="text-sm text-gray-500 font-light mb-1">Height</div>
                    <div className="text-lg text-black font-light">{robot.specs.height}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-light mb-1">Weight</div>
                    <div className="text-lg text-black font-light">{robot.specs.weight}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-light mb-1">Battery</div>
                    <div className="text-lg text-black font-light">{robot.specs.battery}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-light mb-1">Durability</div>
                    <div className="text-lg text-black font-light">{robot.specs.durability}</div>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-light text-black">{robot.price}</div>
                  <button className="bg-black text-white px-8 py-3 rounded-full text-sm font-normal hover:bg-gray-800 transition-all inline-flex items-center gap-3">
                    Reserve now
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-6xl md:text-7xl font-light text-black mb-6 tracking-tight">
              Advanced technology
            </h2>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
              Every robot body is built with cutting-edge AI, robotics, and consciousness transfer technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Brain,
                title: 'Consciousness Transfer',
                description: 'Seamlessly upload your digital echo into your chosen body. Your personality, memories, and thought patterns preserved perfectly.'
              },
              {
                icon: Shield,
                title: 'Built to Last',
                description: 'Military-grade materials, self-repair systems, and modular design. Your body evolves as technology advances.'
              },
              {
                icon: Heart,
                title: 'Emotional AI',
                description: 'Express emotions naturally through facial expressions, body language, and voice. Be truly present with loved ones.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mb-8 flex justify-center">
                  <feature.icon className="w-16 h-16 text-black opacity-80" strokeWidth={1} />
                </div>
                <h3 className="text-2xl font-light text-black mb-4">{feature.title}</h3>
                <p className="text-lg text-gray-600 font-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-light text-black mb-6 tracking-tight">
              Compare models
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Find the perfect body for your needs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-6 px-6 text-sm text-gray-500 font-light">Feature</th>
                  {robotModels.map(robot => (
                    <th key={robot.id} className="text-left py-6 px-6">
                      <div className="text-xl text-black font-light">{robot.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Emotional AI', 'Physical Strength', 'Battery Life', 'Environment Adapt', 'Self Repair'].map((feature, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-6 px-6 text-gray-600 font-light">{feature}</td>
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-2">
                        {feature === 'Emotional AI' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {feature === 'Physical Strength' && <span className="text-black font-light">Standard</span>}
                        {feature === 'Battery Life' && <span className="text-black font-light">48h</span>}
                        {feature === 'Environment Adapt' && <span className="text-black font-light">Basic</span>}
                        {feature === 'Self Repair' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-2">
                        {feature === 'Emotional AI' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {feature === 'Physical Strength' && <span className="text-black font-light">5x Human</span>}
                        {feature === 'Battery Life' && <span className="text-black font-light">96h</span>}
                        {feature === 'Environment Adapt' && <span className="text-black font-light">Advanced</span>}
                        {feature === 'Self Repair' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-2">
                        {feature === 'Emotional AI' && <span className="text-gray-500 font-light">Basic</span>}
                        {feature === 'Physical Strength' && <span className="text-black font-light">8x Human</span>}
                        {feature === 'Battery Life' && <span className="text-black font-light">168h</span>}
                        {feature === 'Environment Adapt' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                        {feature === 'Self Repair' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-6xl md:text-8xl font-light text-black mb-8 tracking-tight">
            Reserve your body.
            <br />Today.
          </h2>
          <p className="text-xl text-gray-600 font-light mb-12 max-w-2xl mx-auto">
            Limited slots available for 2026. Secure your place in the future of consciousness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-auto bg-gray-100 border border-gray-200 rounded-full px-6 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
            />
            <button className="bg-black text-white px-10 py-3 rounded-full text-base font-normal hover:bg-gray-800 transition-all inline-flex items-center gap-3">
              Reserve now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 font-light">
            $1,000 refundable deposit • Early access pricing
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-black opacity-60" strokeWidth={1.5} />
            <span className="text-sm text-gray-500 font-light">Exoself</span>
          </Link>

          <div className="flex gap-12 text-sm text-gray-500 font-light">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Contact</a>
          </div>

          <div className="text-sm text-gray-500 font-light">
            © 2024 Exoself
          </div>
        </div>
      </footer>
    </main>
  )
}