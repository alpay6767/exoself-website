// API service layer for connecting to the Python backend via Next.js API routes

import { supabase } from './supabase'

const API_BASE_URL = '/api'

export interface ExoselfMessage {
  id: string
  source: string
  timestamp: string
  content: string
  sender: string
  recipient?: string
  thread_id?: string
  metadata?: Record<string, any>
}

export interface ChatMessage {
  message: string
  user_id?: string
  context_limit?: number
}

export interface ChatResponse {
  response: string
  context_used: ExoselfMessage[]
  confidence: number
  timestamp: string
}

export interface UploadResponse {
  success: boolean
  message: string
  processed_messages: number
  source_type: string
}

export interface VaultStats {
  total_messages: number
  sources: string[]
  last_updated: string
  accuracy_score: number
}

class ApiService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`
      }
    }

    return {}
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const authHeaders = await this.getAuthHeaders()
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...authHeaders,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${url}`, error)
      throw error
    }
  }

  // Chat with the Echo (non-streaming)
  async sendChatMessage(message: string, userId?: string): Promise<ChatResponse> {
    const response = await this.request<any>('/backend', {
      method: 'POST',
      body: JSON.stringify({
        action: 'chat',
        data: { message }
      })
    })

    return {
      response: response.response || response.output || message,
      context_used: [],
      confidence: 0.8,
      timestamp: new Date().toISOString()
    }
  }

  // Chat with Echo using streaming (Phase 4)
  async *streamChatMessage(
    message: string,
    conversationId?: string
  ): AsyncGenerator<string, void, unknown> {
    const authHeaders = await this.getAuthHeaders()

    // Connect directly to Python backend for streaming
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

    const response = await fetch(`${BACKEND_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        message,
        stream: true,
        conversation_id: conversationId
      }),
    })

    if (!response.ok) {
      throw new Error(`Streaming failed: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body')
    }

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)  // Don't trim - preserves spaces!

            if (data.trim() === '[DONE]') {
              return
            }

            // Yield data even if it's just whitespace (important for spaces between words)
            if (data.length > 0) {
              yield data
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // Get chat history
  async getChatHistory(conversationId?: string, limit: number = 50): Promise<any[]> {
    const authHeaders = await this.getAuthHeaders()
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

    let url = `${BACKEND_URL}/api/v1/chat/history?limit=${limit}`
    if (conversationId) {
      url += `&conversation_id=${conversationId}`
    }

    const response = await fetch(url, {
      headers: authHeaders,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`)
    }

    const data = await response.json()
    return data.messages || []
  }

  // Upload files for processing
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()

    return {
      success: result.success,
      message: 'File uploaded successfully',
      processed_messages: 0, // TODO: Get from backend
      source_type: result.type
    }
  }

  // Get vault statistics
  async getVaultStats(): Promise<VaultStats> {
    return this.request<VaultStats>('/vault/stats')
  }

  // Get all messages (for analysis/debugging)
  async getMessages(limit: number = 100, offset: number = 0): Promise<ExoselfMessage[]> {
    return this.request<ExoselfMessage[]>(`/messages?limit=${limit}&offset=${offset}`)
  }

  // Get messages by source
  async getMessagesBySource(source: string, limit: number = 100): Promise<ExoselfMessage[]> {
    return this.request<ExoselfMessage[]>(`/messages/source/${source}?limit=${limit}`)
  }

  // Delete messages by source
  async deleteMessagesBySource(source: string): Promise<{ success: boolean; deleted_count: number }> {
    return this.request<{ success: boolean; deleted_count: number }>(`/messages/source/${source}`, {
      method: 'DELETE'
    })
  }

  // Retrain the model
  async retrainModel(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/model/retrain', {
      method: 'POST'
    })
  }

  // Get personality analysis
  async getPersonalityAnalysis(): Promise<{
    traits: Record<string, number>
    writing_style: Record<string, any>
    common_phrases: string[]
    conversation_starters: string[]
  }> {
    return this.request('/personality/analysis')
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await this.request<any>('/backend', {
      method: 'POST',
      body: JSON.stringify({
        action: 'status'
      })
    })

    return {
      status: response.success ? 'online' : 'offline',
      version: '1.0.0'
    }
  }
}

// Singleton instance
export const apiService = new ApiService()

// React hooks for easier API usage
export const useApi = () => {
  return {
    sendMessage: (message: string) => apiService.sendChatMessage(message),
    uploadFile: (file: File) => apiService.uploadFile(file),
    getVaultStats: () => apiService.getVaultStats(),
    getMessages: (limit?: number, offset?: number) => apiService.getMessages(limit, offset),
    retrainModel: () => apiService.retrainModel(),
    getPersonalityAnalysis: () => apiService.getPersonalityAnalysis(),
    healthCheck: () => apiService.healthCheck(),
  }
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Utility to check if backend is running
export async function checkBackendConnection(): Promise<boolean> {
  try {
    await apiService.healthCheck()
    return true
  } catch {
    return false
  }
}