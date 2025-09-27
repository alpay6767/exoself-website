'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import {
  Brain,
  Send,
  ArrowLeft,
  Bot,
  User,
  Sparkles,
  Zap,
  MessageSquare,
  Settings,
  Copy,
  Share,
  MoreVertical,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react'
import Link from 'next/link'
import { apiService, checkBackendConnection } from '../../lib/api'

interface Message {
  id: string
  content: string
  sender: 'user' | 'echo'
  timestamp: Date
  isTyping?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey! I'm your digital echo, created from your WhatsApp conversations and personal data. I'm here to chat just like the real you would. What's on your mind?",
      sender: 'echo',
      timestamp: new Date()
    }
  ])

  const [inputMessage, setInputMessage] = useState('')
  const [isEchoTyping, setIsEchoTyping] = useState(false)
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkBackendConnection()
        setIsBackendConnected(connected)
        if (!connected) {
          setConnectionError('Backend server not running. Please start the Python server.')
        }
      } catch (error) {
        setIsBackendConnected(false)
        setConnectionError('Failed to connect to backend server.')
      }
    }

    checkConnection()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isEchoTyping])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsEchoTyping(true)
    setConnectionError(null)

    try {
      if (isBackendConnected) {
        // Use real API
        const response = await apiService.sendChatMessage(userMessage.content)

        const echoResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          sender: 'echo',
          timestamp: new Date()
        }

        setIsEchoTyping(false)
        setMessages(prev => [...prev, echoResponse])
      } else {
        // Fallback to simulated response
        setTimeout(() => {
          const echoResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: generateEchoResponse(userMessage.content),
            sender: 'echo',
            timestamp: new Date()
          }

          setIsEchoTyping(false)
          setMessages(prev => [...prev, echoResponse])
        }, 1500 + Math.random() * 2000)
      }
    } catch (error) {
      setIsEchoTyping(false)
      setConnectionError('Failed to get response from echo. Please try again.')

      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to my brain right now. The response might be simulated.",
        sender: 'echo',
        timestamp: new Date()
      }

      // Still provide fallback response
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage, {
          id: (Date.now() + 2).toString(),
          content: generateEchoResponse(userMessage.content),
          sender: 'echo',
          timestamp: new Date()
        }])
      }, 1000)
    }
  }

  // Simulate echo responses (replace with actual API call)
  const generateEchoResponse = (userMessage: string): string => {
    const responses = [
      "That's interesting! Based on your previous conversations, I can see you often think about this topic. What specifically draws you to it?",
      "Hmm, that reminds me of something you mentioned in your WhatsApp chats. You tend to approach things with that same thoughtful perspective.",
      "I can sense that familiar tone of yours! From analyzing your messages, I know you like to dig deeper into these kinds of questions.",
      "You know, that's very characteristic of your communication style. I've learned that you often balance logic with intuition in your thinking.",
      "Based on your conversation patterns, I think you might find it helpful to consider the broader context here. What do you think?",
      "That's such a 'you' thing to say! I can see echoes of similar thoughts from your past messages. Want to explore this further?"
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex">
      {/* Chat Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard">
            <motion.button
              whileHover={{ x: -5 }}
              className="text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>

          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-black">Your Echo</h2>
            <p className="text-sm text-gray-600">Digital consciousness</p>
          </div>
        </div>

        {/* Echo Stats */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
          <h3 className="text-black font-medium mb-3">Echo Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Training Data</span>
              <span className="text-black">20,688 messages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accuracy</span>
              <span className="text-green-600">94%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="text-black">2 hours ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full text-left p-3 text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-all flex items-center gap-3"
          >
            <Settings className="w-4 h-4" />
            Echo Settings
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full text-left p-3 text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-all flex items-center gap-3"
          >
            <Share className="w-4 h-4" />
            Share Echo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full text-left p-3 text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-all flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4" />
            Retrain Model
          </motion.button>
        </div>

        {/* Status */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Echo is online and ready
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-black">Chat with Your Echo</h1>

                {/* Connection Status */}
                <div className="flex items-center gap-1">
                  {isBackendConnected === null ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                    />
                  ) : isBackendConnected ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-gray-600">Your digital consciousness, trained on your data</p>
                {connectionError && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs text-yellow-600">Offline mode</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button className="text-gray-600 hover:text-black transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'echo'
                    ? 'bg-black'
                    : 'bg-blue-500'
                }`}>
                  {message.sender === 'echo' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message */}
                <div className={`flex-1 max-w-2xl ${message.sender === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-2xl ${
                    message.sender === 'echo'
                      ? 'bg-gray-100 border border-gray-200 text-black'
                      : 'bg-blue-500 text-white'
                  }`}>
                    <p className="leading-relaxed">{message.content}</p>
                  </div>

                  <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 ${
                    message.sender === 'user' ? 'justify-end' : ''
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.sender === 'echo' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Echo Typing Indicator */}
          {isEchoTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-600 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-600 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message your echo..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors resize-none"
                disabled={isEchoTyping}
              />

              {/* Character count or other indicators */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isEchoTyping && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                  />
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isEchoTyping}
              className="bg-black hover:bg-gray-800 text-white p-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Your echo is powered by AI trained on your personal data. Responses may not always be perfect.
          </p>
        </div>
      </div>
    </main>
  )
}