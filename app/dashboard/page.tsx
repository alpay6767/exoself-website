'use client'

import { motion } from 'framer-motion'
import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../context/LanguageContext'
import { supabase, getCurrentUser, uploadFile, getUploadedFiles, signOut, getEchoStats } from '../../lib/supabase'
import AuthGuard, { useAuthGuard } from '../../components/AuthGuard'
import Header from '../../components/Header'
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
  ChevronRight,
  Image
} from 'lucide-react'

interface DataSource {
  id: string
  type: 'whatsapp' | 'sms' | 'email' | 'social' | 'image'
  name: string
  messages: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  uploadedAt: string
  errorMessage?: string
  lastTrainedAt?: string
  needsTraining?: boolean
}

function DashboardPageContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthGuard()
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isTraining, setIsTraining] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [echoStats, setEchoStats] = useState<any>(null)

  // Check if there are new files that need training
  const hasNewFilesToTrain = dataSources.some(source => source.needsTraining)
  const hasAnyCompletedFiles = dataSources.some(source => source.status === 'completed')
  const canTrain = hasAnyCompletedFiles && !isTraining

  // Load user data function (moved here so pollProcessingStatus can access it)
  const loadUserData = async () => {
    if (!user) return

    try {
      // Load uploaded files for the current user
      const { data: files, error: filesError } = await getUploadedFiles(user.id)
      if (!filesError && files) {
        const formattedFiles: DataSource[] = files.map(file => {
          const isCompleted = file.processing_status === 'completed'
          const hasBeenTrained = file.last_trained_at != null
          const needsTraining = isCompleted && !hasBeenTrained

          return {
            id: file.id,
            type: file.source_type as any,
            name: file.original_name,
            messages: file.message_count || 0,
            status: file.processing_status as any,
            uploadedAt: new Date(file.created_at).toLocaleDateString(),
            errorMessage: file.error_message || undefined,
            lastTrainedAt: file.last_trained_at,
            needsTraining
          }
        })
        setDataSources(formattedFiles)
      }

      // Load echo statistics for the current user
      const { data: stats, error: statsError } = await getEchoStats(user.id)
      if (!statsError && stats) {
        setEchoStats(stats)
      } else {
        // Create default stats if none exist
        setEchoStats({
          total_messages: 0,
          accuracy_score: 0,
          last_trained: null,
          data_sources: []
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load user-specific data
  useEffect(() => {
    if (user && !authLoading) {
      loadUserData()
    }
  }, [user, authLoading])

  // Always call useCallback at the top level
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return

    for (const file of acceptedFiles) {
      // Determine file type based on MIME type
      const isImage = file.type.startsWith('image/')
      const fileType = isImage ? 'image' : 'whatsapp' // Default to whatsapp for non-images

      // Create temporary UI entry
      const tempId = Date.now().toString()
      const newSource: DataSource = {
        id: tempId,
        type: fileType,
        name: file.name,
        messages: isImage ? 1 : 0, // Images count as 1 "message" initially
        status: 'processing',
        uploadedAt: 'Just now'
      }

      setDataSources(prev => [...prev, newSource])

      try {
        // Upload to Supabase Storage and Database (this will also trigger processing)
        const { uploadData, fileRecord } = await uploadFile(file, user.id)

        // Update UI with real database ID and initial status
        setDataSources(prev => prev.map(source =>
          source.id === tempId
            ? {
                ...source,
                id: fileRecord.id,
                name: fileRecord.original_name,
                status: fileRecord.processing_status as any,
                uploadedAt: new Date(fileRecord.created_at).toLocaleDateString()
              }
            : source
        ))

        // Set up polling to check processing status
        pollProcessingStatus(fileRecord.id)

      } catch (error) {
        console.error('File upload error:', error)

        // Update UI to show error
        setDataSources(prev => prev.map(source =>
          source.id === tempId
            ? {
                ...source,
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Upload failed'
              }
            : source
        ))
      }
    }
  }, [user])

  // Function to poll processing status
  const pollProcessingStatus = async (fileId: string) => {
    const maxAttempts = 30 // Poll for up to 5 minutes (30 attempts * 10 seconds)
    let attempts = 0

    const poll = async () => {
      try {
        const { data: file, error } = await supabase
          .from('uploaded_files')
          .select('processing_status, message_count, error_message')
          .eq('id', fileId)
          .single()

        if (error) {
          console.error('Error polling status:', error)
          return
        }

        // Update UI with current status
        setDataSources(prev => prev.map(source =>
          source.id === fileId
            ? {
                ...source,
                status: file.processing_status as any,
                messages: file.message_count || 0,
                errorMessage: file.error_message || undefined
              }
            : source
        ))

        // If processing is complete or failed, stop polling
        if (file.processing_status === 'completed' || file.processing_status === 'error') {
          if (file.processing_status === 'completed') {
            // Refresh echo stats when processing completes
            loadUserData()
          }
          return
        }

        // Continue polling if still processing
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000) // Poll every 2 seconds
        } else {
          // Timeout - mark as error
          setDataSources(prev => prev.map(source =>
            source.id === fileId
              ? {
                  ...source,
                  status: 'error',
                  errorMessage: 'Processing timeout'
                }
              : source
          ))
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    // Start polling after a short delay
    setTimeout(poll, 1000)
  }

  // Handle echo training
  const handleTrainEcho = async () => {
    if (!user || isTraining) return

    setIsTraining(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/train-echo-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Training failed')
      }

      const result = await response.json()

      if (result.success) {
        // Update echo stats with training results
        await loadUserData()
        alert(`🎉 Echo training completed!\n\n📊 Processed ${result.messagesProcessed} messages\n🧠 Identified personality traits: ${result.personalityTraits?.join(', ') || 'None'}`)
      } else {
        throw new Error(result.error || 'Training failed')
      }

    } catch (error) {
      console.error('Echo training error:', error)
      alert(`❌ Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTraining(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic']
    }
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />
      case 'sms': return <Smartphone className="w-5 h-5" />
      case 'email': return <Mail className="w-5 h-5" />
      case 'social': return <Instagram className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
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

  // Calculate metrics from real data
  const totalMessages = echoStats?.total_messages || dataSources.reduce((sum, source) => sum + source.messages, 0)
  const accuracyScore = echoStats?.accuracy_score ? `${Math.round(echoStats.accuracy_score * 100)}%` : '0%'
  const echoStatus = totalMessages > 0 ? 'Active' : 'Training'
  const lastTrained = echoStats?.last_trained ? new Date(echoStats.last_trained).toLocaleDateString() : 'Never'

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Use consistent header */}
      <Header />

      {/* Main Content */}
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
              {t.dashboard.title.replace('{name}', user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User')}
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
              { label: 'Accuracy Score', value: accuracyScore, icon: Zap },
              { label: 'Echo Status', value: echoStatus, icon: Brain }
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
                  Chat logs, Photos & Images (.txt, .json, .csv, .jpg, .png, .heic)
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
                  whileHover={{ scale: canTrain ? 1.02 : 1 }}
                  whileTap={{ scale: canTrain ? 0.98 : 1 }}
                  onClick={handleTrainEcho}
                  disabled={!canTrain}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                    isTraining
                      ? 'bg-purple-100 text-purple-700 cursor-not-allowed'
                      : !canTrain
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : hasNewFilesToTrain
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg animate-pulse'
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isTraining ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full"
                      />
                    ) : hasNewFilesToTrain ? (
                      <Zap className="w-5 h-5" />
                    ) : (
                      <Brain className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {isTraining
                        ? 'Training Echo...'
                        : !canTrain
                        ? 'No Data Available'
                        : hasNewFilesToTrain
                        ? 'Train Echo with New Data!'
                        : 'Retrain Echo'
                      }
                    </span>
                  </div>
                  {hasNewFilesToTrain && !isTraining && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        NEW
                      </span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                  {!hasNewFilesToTrain && canTrain && <ChevronRight className="w-5 h-5" />}
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
                  className={`flex items-center justify-between p-6 rounded-xl transition-colors ${
                    source.needsTraining
                      ? 'bg-orange-50 border-2 border-orange-200 hover:bg-orange-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {getIcon(source.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-black font-semibold">{source.name}</h3>
                        {source.needsTraining && (
                          <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {source.messages.toLocaleString()} messages • {source.uploadedAt}
                        {source.lastTrainedAt && (
                          <span className="text-green-600 ml-2">
                            • Trained {new Date(source.lastTrainedAt).toLocaleDateString()}
                          </span>
                        )}
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

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardPageContent />
    </AuthGuard>
  )
}