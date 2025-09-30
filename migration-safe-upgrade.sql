-- ============================================================================
-- EXOSELF PHASE 3 - SAFE UPGRADE MIGRATION
-- Handles existing tables and policies gracefully
-- ============================================================================
-- Run this if you get "already exists" errors
-- ============================================================================

-- Enable required extensions (safe - does nothing if already exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- STEP 1: Create missing tables only
-- ============================================================================

-- User Profiles (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded Files (enhance if exists, create if not)
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  processing_status TEXT DEFAULT 'pending',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Add new columns to uploaded_files if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'uploaded_files' AND column_name = 'embedding_status') THEN
    ALTER TABLE uploaded_files ADD COLUMN embedding_status TEXT DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'uploaded_files' AND column_name = 'source_type') THEN
    ALTER TABLE uploaded_files ADD COLUMN source_type TEXT DEFAULT 'other';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'uploaded_files' AND column_name = 'metadata') THEN
    ALTER TABLE uploaded_files ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Echo Models Table
CREATE TABLE IF NOT EXISTS echo_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  model_type TEXT DEFAULT 'base',

  -- Personality snapshot
  personality_traits JSONB NOT NULL,
  communication_style JSONB NOT NULL,
  common_phrases TEXT[],

  -- Training metadata
  training_data_snapshot JSONB,
  messages_processed INTEGER DEFAULT 0,
  training_duration_seconds INTEGER,

  -- Model storage
  system_prompt TEXT NOT NULL,
  lora_adapter_path TEXT,
  embedding_model TEXT DEFAULT 'all-MiniLM-L6-v2',

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  training_logs JSONB,

  UNIQUE(user_id, version)
);

-- Message Embeddings Table (vector search)
CREATE TABLE IF NOT EXISTS message_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- Original message data
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  sender TEXT NOT NULL,
  thread_id TEXT,

  -- Vector embedding (384 dimensions for MiniLM)
  embedding vector(384) NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  file_id UUID REFERENCES uploaded_files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Jobs Table
CREATE TABLE IF NOT EXISTS training_jobs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  job_type TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'queued',
  progress INTEGER DEFAULT 0,

  -- Data
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,

  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Resources
  processing_time_seconds INTEGER,
  tokens_used INTEGER
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  echo_version_id UUID REFERENCES echo_models(id),

  -- Message content
  content TEXT NOT NULL,
  role TEXT NOT NULL,

  -- Context & memory
  embedding vector(384),
  context_used TEXT[],

  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Feedback
  user_feedback TEXT,
  feedback_note TEXT
);

-- Echo Evolution Log
CREATE TABLE IF NOT EXISTS echo_evolution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  from_version INTEGER,
  to_version INTEGER NOT NULL,

  -- Changes
  change_summary TEXT,
  personality_diff JSONB,
  new_phrases_learned TEXT[],

  -- Trigger
  trigger_type TEXT,
  messages_added_since_last INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Create indexes (if not exists)
-- ============================================================================

-- Create indexes only if they don't exist
DO $$
BEGIN
  -- Echo models index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_echo_models_user_active') THEN
    CREATE INDEX idx_echo_models_user_active ON echo_models(user_id, is_active) WHERE is_active = true;
  END IF;

  -- Message embeddings vector index (HNSW)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_message_embeddings_vector') THEN
    CREATE INDEX idx_message_embeddings_vector ON message_embeddings
    USING hnsw (embedding vector_cosine_ops);
  END IF;

  -- Message embeddings user index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_message_embeddings_user') THEN
    CREATE INDEX idx_message_embeddings_user ON message_embeddings(user_id);
  END IF;

  -- Chat messages indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_user') THEN
    CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, timestamp DESC);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_chat_messages_vector') THEN
    CREATE INDEX idx_chat_messages_vector ON chat_messages
    USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;
  END IF;

  -- Training jobs indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_training_jobs_user_status') THEN
    CREATE INDEX idx_training_jobs_user_status ON training_jobs(user_id, status);
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Enable RLS (if not already enabled)
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_evolution_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Drop and recreate policies (to avoid "already exists" errors)
-- ============================================================================

-- User Profiles
DROP POLICY IF EXISTS "user_profiles_policy" ON user_profiles;
CREATE POLICY "user_profiles_policy" ON user_profiles FOR ALL USING (auth.uid() = id);

-- Uploaded Files
DROP POLICY IF EXISTS "uploaded_files_policy" ON uploaded_files;
CREATE POLICY "uploaded_files_policy" ON uploaded_files FOR ALL USING (auth.uid() = user_id);

-- Echo Models
DROP POLICY IF EXISTS "Users can view their own echo models" ON echo_models;
DROP POLICY IF EXISTS "echo_models_policy" ON echo_models;
CREATE POLICY "echo_models_policy" ON echo_models FOR ALL USING (auth.uid() = user_id);

-- Message Embeddings
DROP POLICY IF EXISTS "message_embeddings_policy" ON message_embeddings;
CREATE POLICY "message_embeddings_policy" ON message_embeddings FOR ALL USING (auth.uid() = user_id);

-- Chat Messages
DROP POLICY IF EXISTS "chat_messages_policy" ON chat_messages;
CREATE POLICY "chat_messages_policy" ON chat_messages FOR ALL USING (auth.uid() = user_id);

-- Training Jobs
DROP POLICY IF EXISTS "training_jobs_policy" ON training_jobs;
CREATE POLICY "training_jobs_policy" ON training_jobs FOR ALL USING (auth.uid() = user_id);

-- Echo Evolution Log
DROP POLICY IF EXISTS "echo_evolution_log_policy" ON echo_evolution_log;
CREATE POLICY "echo_evolution_log_policy" ON echo_evolution_log FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: Create or replace helper functions
-- ============================================================================

-- Drop existing functions to avoid signature conflicts
DROP FUNCTION IF EXISTS search_memories(vector, uuid, double precision, integer);
DROP FUNCTION IF EXISTS search_memories(vector, uuid, float, integer);
DROP FUNCTION IF EXISTS get_active_echo(uuid);
DROP FUNCTION IF EXISTS set_active_echo(uuid, uuid);
DROP FUNCTION IF EXISTS get_echo_evolution_stats(uuid);

-- Function: Search semantic memories
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(384),
  user_uuid UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  content TEXT,
  similarity FLOAT,
  msg_timestamp TIMESTAMPTZ,
  source TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    message_embeddings.content,
    1 - (message_embeddings.embedding <=> query_embedding) as similarity,
    message_embeddings."timestamp",
    message_embeddings.source,
    message_embeddings.metadata
  FROM message_embeddings
  WHERE message_embeddings.user_id = user_uuid
    AND 1 - (message_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY message_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Get active echo
CREATE OR REPLACE FUNCTION get_active_echo(user_uuid UUID)
RETURNS echo_models
LANGUAGE plpgsql
AS $$
DECLARE
  active_echo echo_models;
BEGIN
  SELECT * INTO active_echo
  FROM echo_models
  WHERE user_id = user_uuid AND is_active = true
  ORDER BY version DESC
  LIMIT 1;

  RETURN active_echo;
END;
$$;

-- Function: Set active echo (switch versions)
CREATE OR REPLACE FUNCTION set_active_echo(
  user_uuid UUID,
  echo_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Deactivate all echoes for this user
  UPDATE echo_models
  SET is_active = false
  WHERE user_id = user_uuid;

  -- Activate the specified echo
  UPDATE echo_models
  SET is_active = true
  WHERE id = echo_id AND user_id = user_uuid;

  RETURN FOUND;
END;
$$;

-- Function: Get echo evolution stats
CREATE OR REPLACE FUNCTION get_echo_evolution_stats(user_uuid UUID)
RETURNS TABLE (
  total_versions INTEGER,
  latest_version INTEGER,
  total_messages_processed INTEGER,
  first_trained TIMESTAMPTZ,
  last_trained TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_versions,
    MAX(version)::INTEGER as latest_version,
    SUM(messages_processed)::INTEGER as total_messages_processed,
    MIN(created_at) as first_trained,
    MAX(created_at) as last_trained
  FROM echo_models
  WHERE user_id = user_uuid;
END;
$$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check pgvector extension
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    RAISE NOTICE '✅ pgvector extension: ENABLED';
  ELSE
    RAISE NOTICE '❌ pgvector extension: NOT FOUND';
  END IF;
END $$;

-- Count tables created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'uploaded_files', 'echo_models',
                     'message_embeddings', 'chat_messages', 'training_jobs',
                     'echo_evolution_log');

  RAISE NOTICE '✅ Tables created: % / 7', table_count;
END $$;

-- Count helper functions
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
  AND routine_name IN ('search_memories', 'get_active_echo',
                       'set_active_echo', 'get_echo_evolution_stats');

  RAISE NOTICE '✅ Helper functions: % / 4', func_count;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 MIGRATION COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run verification queries';
  RAISE NOTICE '2. Upload your WhatsApp data';
  RAISE NOTICE '3. Train your echo!';
  RAISE NOTICE '';
END $$;