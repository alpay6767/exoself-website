'use client'

import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { useLanguage } from '../../context/LanguageContext'
import {
  Brain,
  Upload,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  Smartphone,
  Mail,
  Instagram,
  Download,
  Trash2,
  Play,
  Pause,
  Zap,
  ChevronRight
} from 'lucide-react'

interface DataSource {
  id: string
  type: 'whatsapp' | 'sms' | 'email' | 'social'
  name: string
  messages: number
  status: 'processing' | 'completed' | 'error'
  uploadedAt: string
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      type: 'whatsapp',
      name: 'WhatsApp Chat - Alpay & Prinzessin',
      messages: 20688,
      status: 'completed',
      uploadedAt: '2 hours ago'
    }
  ])

  const [isTraining, setIsTraining] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const newSource: DataSource = {
        id: Date.now().toString(),
        type: 'whatsapp',
        name: file.name,
        messages: 0,
        status: 'processing',
        uploadedAt: 'Just now'
      }

      setDataSources(prev => [...prev, newSource])

      setTimeout(() => {
        setDataSources(prev => prev.map(source =>
          source.id === newSource.id
            ? { ...source, status: 'completed', messages: Math.floor(Math.random() * 10000) + 1000 }
            : source
        ))
      }, 3000)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'text/csv': ['.csv']
    }
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />
      case 'sms': return <Smartphone className="w-5 h-5" />
      case 'email': return <Mail className="w-5 h-5" />
      case 'social': return <Instagram className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const totalMessages = dataSources.reduce((sum, source) => sum + source.messages, 0)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Apple-style Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-xl font-semibold text-black">Exoself</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-black font-medium border-b-2 border-black pb-1">Dashboard</Link>
              <Link href="/chat" className="text-gray-600 hover:text-black transition-colors">Chat</Link>
              <Link href="/robots" className="text-gray-600 hover:text-black transition-colors">Robot Bodies</Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 font-medium">Echo Online</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="text-gray-600 hover:text-black transition-colors"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
              {t.dashboard.title.replace('{name}', 'Alpay')}
            </h1>
            <p className="text-xl text-gray-600 font-normal">
              {t.dashboard.subtitle.replace('{count}', totalMessages.toLocaleString())}
            </p>
          </div>

          {/* Stats Cards - Apple Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Messages', value: totalMessages.toLocaleString(), icon: MessageCircle },
              { label: 'Data Sources', value: dataSources.length.toString(), icon: Upload },
              { label: 'Accuracy Score', value: '94%', icon: Zap },
              { label: 'Echo Status', value: 'Active', icon: Brain }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-black mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
        </div>

          {/* Main Action Sections */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* File Upload - Apple Style */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-black mb-2">Upload Data</h2>
                <p className="text-gray-600">Import conversations to expand your echo's knowledge</p>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-600" strokeWidth={1.5} />
                </div>
                <p className="text-lg font-medium text-black mb-2">
                  {isDragActive ? 'Drop files here' : 'Drop files to upload'}
                </p>
                <p className="text-gray-600 text-sm">
                  WhatsApp, SMS, Email exports (.txt, .json, .csv)
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  WhatsApp Guide
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  Import Help
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Actions - Apple Style */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-black mb-2">Quick Actions</h2>
                <p className="text-gray-600">Interact with and manage your digital echo</p>
              </div>

              <div className="space-y-4">
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-black hover:bg-gray-800 text-white p-4 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">Chat with Your Echo</span>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsTraining(!isTraining)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-black p-4 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isTraining ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span className="font-medium">{isTraining ? 'Pause Training' : 'Train Echo'}</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-black p-4 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <span className="font-medium">Export Model</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Data Sources - Apple Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-black mb-2">Data Sources</h2>
                <p className="text-gray-600">{dataSources.length} connected sources</p>
              </div>
            </div>

            <div className="space-y-4">
              {dataSources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {getIcon(source.type)}
                    </div>
                    <div>
                      <h3 className="text-black font-semibold">{source.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {source.messages.toLocaleString()} messages • {source.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {source.status === 'processing' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full"
                        />
                      )}
                      {source.status === 'completed' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                      <span className={`text-sm font-medium ${
                        source.status === 'completed' ? 'text-green-600' :
                        source.status === 'processing' ? 'text-gray-600' : 'text-red-600'
                      }`}>
                        {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}