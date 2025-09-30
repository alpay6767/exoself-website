import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (will be auto-generated from Supabase)
export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UploadedFile {
  id: string
  user_id: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  storage_path: string
  processing_status: 'pending' | 'processing' | 'completed' | 'error'
  message_count?: number
  source_type: 'whatsapp' | 'sms' | 'email' | 'social' | 'other'
  created_at: string
  processed_at?: string
  error_message?: string
  last_trained_at?: string
}

export interface ChatMessage {
  id: string
  user_id: string
  content: string
  sender: 'user' | 'echo'
  timestamp: string
  metadata?: Record<string, any>
}

export interface EchoStats {
  id: string
  user_id: string
  total_messages: number
  accuracy_score: number
  last_trained: string
  data_sources: string[]
  created_at: string
  updated_at: string
}

// Auth helpers
export const signInWithGoogle = async () => {
  // Store the current domain before OAuth to preserve it after callback
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth_origin_domain', window.location.origin)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'https://exoself.me/auth/callback',
      queryParams: {
        prompt: 'select_account',
      },
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// File upload helpers - Updated to use new v2 API
export const uploadFile = async (file: File, userId: string) => {
  // Get current session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  // Use the new v2 API endpoint which handles everything
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/process-file-v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  const result = await response.json()

  // Return in the expected format
  return {
    uploadData: { path: `${userId}/${result.fileName}` },
    fileRecord: {
      id: result.fileId,
      original_name: result.fileName,
      processing_status: 'pending',
      created_at: new Date().toISOString()
    }
  }
}

// Note: triggerFileProcessing is now handled directly by uploadFile via /api/process-file-v2
// This function is no longer needed as the new API handles everything in one call

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

export const getUploadedFiles = async (userId: string) => {
  const { data, error } = await supabase
    .from('uploaded_files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const getChatHistory = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  return { data, error }
}

export const saveChatMessage = async (message: Omit<ChatMessage, 'id'>) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select()
    .single()

  return { data, error }
}

export const getEchoStats = async (userId: string) => {
  try {
    // Get Echo model info (for last_trained timestamp and accuracy)
    const { data: echoData, error: echoError } = await supabase
      .from('echo_models')
      .select('created_at, personality_traits, version')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    // Get total message count
    const { count: messageCount, error: countError } = await supabase
      .from('message_embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get uploaded files for data sources
    const { data: files, error: filesError } = await supabase
      .from('uploaded_files')
      .select('source_type, original_name')
      .eq('user_id', userId)

    if (echoError || countError) {
      return {
        data: {
          total_messages: messageCount || 0,
          accuracy_score: 0,
          last_trained: null,
          data_sources: []
        },
        error: null
      }
    }

    // Calculate a rough accuracy score based on conscientiousness trait
    const traits = echoData?.personality_traits as any
    const accuracy_score = traits?.conscientiousness || 0.5

    return {
      data: {
        total_messages: messageCount || 0,
        accuracy_score: accuracy_score,
        last_trained: echoData?.created_at || null,
        data_sources: files?.map(f => f.source_type) || [],
        echo_version: echoData?.version || 1
      },
      error: null
    }
  } catch (error: any) {
    return {
      data: {
        total_messages: 0,
        accuracy_score: 0,
        last_trained: null,
        data_sources: []
      },
      error
    }
  }
}