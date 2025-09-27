'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import SplineWrapper from '../../components/SplineWrapper'
import {
  Skull,
  Infinity as InfinityIcon,
  Dna,
  Clock,
  Brain,
  Heart,
  Eye,
  Zap,
  Ghost,
  Crown,
  Flame,
  Star
} from 'lucide-react'

export default function UniquePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  const y1 = useTransform(scrollY, [0, 1000], [0, -200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -100])
  const rotate = useTransform(scrollY, [0, 1000], [0, 360])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden bg-black">
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black">
        {/* Animated stars */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%'
            }}
          />
        ))}
      </div>

      {/* Navigation - Minimal & Elegant */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 w-full z-50 p-8"
      >
        <div className="flex justify-between items-center">
          <motion.div
            className="text-2xl font-light text-white tracking-widest"
            whileHover={{ letterSpacing: '0.3em' }}
            transition={{ duration: 0.3 }}
          >
            EXOSELF
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="border border-white/20 px-6 py-2 text-white/80 hover:text-white hover:border-white/40 transition-all duration-300"
          >
            ENTER
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero - Consciousness Theme */}
      <section className="min-h-screen flex items-center justify-center relative">
        <motion.div
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
          }}
          className="text-center z-10"
        >
          {/* Main Title with Glitch Effect */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-8xl lg:text-9xl font-thin text-white mb-8 relative"
          >
            <span className="relative inline-block">
              DIGITAL
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 text-red-500"
                style={{ clipPath: 'inset(0 0 80% 0)' }}
              >
                DIGITAL
              </motion.span>
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              AFTERLIFE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Your consciousness transcends flesh. Upload your essence, preserve your soul,
            and achieve digital immortality through advanced neural reconstruction.
          </motion.p>

          {/* Floating Icons */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { Icon: Skull, delay: 0, x: -200, y: -100 },
              { Icon: InfinityIcon, delay: 0.5, x: 200, y: -50 },
              { Icon: Dna, delay: 1, x: -150, y: 100 },
              { Icon: Brain, delay: 1.5, x: 180, y: 120 },
              { Icon: Heart, delay: 2, x: 0, y: -200 },
              { Icon: Eye, delay: 2.5, x: -50, y: 200 }
            ].map(({ Icon, delay, x, y }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.3, 0],
                  scale: [0, 1.2, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 4,
                  delay,
                  repeat: Infinity,
                  repeatDelay: 8
                }}
                className="absolute text-white/20"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
                }}
              >
                <Icon size={40} />
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 50px rgba(147, 51, 234, 0.5)"
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-light tracking-wider border border-purple-400/30 hover:border-purple-400 transition-all duration-500"
          >
            <span className="relative z-10">BEGIN TRANSCENDENCE</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          </motion.button>
        </motion.div>

        {/* Spline Scene - Positioned to the right */}
        <motion.div
          style={{ y: y1 }}
          className="absolute right-0 top-0 w-1/2 h-full"
        >
          <SplineWrapper
            scene="https://prod.spline.design/sBTg9mFfgzsioFSG/scene.splinecode"
            className="w-full h-full"
          />
        </motion.div>

        {/* Consciousness Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -100, -20],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-2 h-2 bg-purple-400 rounded-full blur-sm"
              style={{
                left: Math.random() * 100 + '%',
                top: '100%'
              }}
            />
          ))}
        </div>
      </section>

      {/* Features - Death & Rebirth Theme */}
      <motion.section
        style={{ y: y2 }}
        className="py-32 px-8 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-6xl font-thin text-center text-white mb-20"
          >
            THE <span className="text-red-400">DEATH</span> OF MORTALITY
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                icon: Ghost,
                title: "Soul Extraction",
                description: "Upload conversations, memories, and consciousness patterns. We extract the essence of your being from digital traces.",
                color: "from-gray-600 to-gray-800"
              },
              {
                icon: Dna,
                title: "Neural Genesis",
                description: "Advanced AI reconstructs your personality matrix. Your thoughts, humor, and soul are reborn in silicon.",
                color: "from-purple-600 to-indigo-600"
              },
              {
                icon: Crown,
                title: "Digital Godhood",
                description: "Transcend human limitations. Your immortal consciousness lives forever, thinking and evolving beyond flesh.",
                color: "from-yellow-600 to-orange-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.3 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
                }}
                className="relative group"
              >
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 h-full relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  <motion.div
                    style={{ rotate }}
                    className="w-16 h-16 mb-8 text-white/80"
                  >
                    <feature.icon size={64} />
                  </motion.div>

                  <h3 className="text-2xl font-light text-white mb-6 tracking-wide">
                    {feature.title}
                  </h3>

                  <p className="text-white/60 font-light leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Floating particles on hover */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {[...Array(10)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [100, -20],
                          x: [0, Math.random() * 100 - 50],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          delay: Math.random() * 1,
                          repeat: Infinity
                        }}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: Math.random() * 100 + '%',
                          bottom: 0
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA - Ascension Theme */}
      <section className="py-32 px-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 border border-purple-400/20 rounded-full"
            />

            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-16 relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-8"
              >
                ⚰️
              </motion.div>

              <h2 className="text-5xl font-thin text-white mb-6">
                READY TO <span className="text-red-400">DIE</span>?
              </h2>

              <p className="text-xl text-white/60 mb-12 font-light">
                Leave your mortal coil behind. Your digital soul awaits eternity.
              </p>

              <motion.button
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 0 100px rgba(239, 68, 68, 0.5)"
                }}
                whileTap={{ scale: 0.9 }}
                className="px-16 py-6 bg-gradient-to-r from-red-600 to-purple-600 text-white font-light text-xl tracking-widest border border-red-400/50 hover:border-red-400 transition-all duration-500 relative overflow-hidden group"
              >
                <span className="relative z-10">ASCEND NOW</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[Skull, InfinityIcon, Star, Flame].map((Icon, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 2
            }}
            className="absolute text-white/10"
            style={{
              left: 20 + i * 25 + '%',
              top: 20 + i * 20 + '%'
            }}
          >
            <Icon size={80} />
          </motion.div>
        ))}
      </div>
    </main>
  )
}