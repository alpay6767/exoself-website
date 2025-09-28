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

// File upload helpers
export const uploadFile = async (file: File, userId: string) => {
  const filename = `${Date.now()}-${file.name}`
  const filePath = `uploads/${userId}/${filename}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('user-files')
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  // Insert file record into database
  const { data: fileRecord, error: dbError } = await supabase
    .from('uploaded_files')
    .insert({
      user_id: userId,
      filename,
      original_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: filePath,
      processing_status: 'pending',
      source_type: 'whatsapp' // TODO: Auto-detect from file content
    })
    .select()
    .single()

  if (dbError) {
    throw dbError
  }

  return { uploadData, fileRecord }
}

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
  const { data, error } = await supabase
    .from('echo_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}