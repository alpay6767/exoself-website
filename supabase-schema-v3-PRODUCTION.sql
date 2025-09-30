-- ============================================================================
-- EXOSELF PHASE 3 - PRODUCTION DATABASE SCHEMA
-- Digital Consciousness Preservation with Vector Embeddings
-- ============================================================================
-- Run this in Supabase SQL Editor for a FRESH installation
-- For upgrading from Phase 2, use migration-v2-to-v3.sql instead
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector for semantic search

-- ============================================================================
-- PHASE 2 TABLES (Enhanced)
-- ============================================================================

-- User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded Files Table (Enhanced with embedding_status)
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,

  -- Processing status
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')) DEFAULT 'pending',
  embedding_status TEXT CHECK (embedding_status IN ('pending', 'processing', 'completed', 'error')) DEFAULT 'pending',

  -- Metadata
  message_count INTEGER DEFAULT 0,
  source_type TEXT CHECK (source_type IN ('whatsapp', 'sms', 'email', 'social', 'notes', 'other')) DEFAULT 'other',
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON uploaded_files(processing_status, embedding_status);

-- ============================================================================
-- PHASE 3 NEW TABLES - CORE CONSCIOUSNESS FEATURES
-- ============================================================================

-- Echo Models Table - Persistent Personality Versions
CREATE TABLE IF NOT EXISTS echo_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  model_type TEXT DEFAULT 'base' CHECK (model_type IN ('base', 'lora-fine-tuned', 'full-fine-tuned')),

  -- Personality snapshot (immutable once created)
  personality_traits JSONB NOT NULL DEFAULT '{}'::jsonb,
  communication_style JSONB NOT NULL DEFAULT '{}'::jsonb,
  common_phrases TEXT[] DEFAULT '{}',

  -- Training metadata
  training_data_snapshot JSONB DEFAULT '{}'::jsonb, -- Which files/messages were used
  messages_processed INTEGER DEFAULT 0,
  training_duration_seconds INTEGER,

  -- Model configuration
  system_prompt TEXT NOT NULL,
  lora_adapter_path TEXT, -- Path to fine-tuned weights in storage
  embedding_model TEXT DEFAULT 'all-MiniLM-L6-v2',

  -- Status & metadata
  is_active BOOLEAN DEFAULT true,
  training_logs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one version number per user
  UNIQUE(user_id, version)
);

CREATE INDEX IF NOT EXISTS idx_echo_models_user_id ON echo_models(user_id);
CREATE INDEX IF NOT EXISTS idx_echo_models_active ON echo_models(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_echo_models_version ON echo_models(user_id, version DESC);

-- Message Embeddings Table - Semantic Memory
CREATE TABLE IF NOT EXISTS message_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- Original message data
  content TEXT NOT NULL,
  source TEXT NOT NULL, -- 'whatsapp', 'email', 'notes', etc.
  timestamp TIMESTAMPTZ NOT NULL,
  sender TEXT NOT NULL,
  thread_id TEXT, -- For group chats or email threads

  -- Vector embedding (384 dimensions for sentence-transformers/all-MiniLM-L6-v2)
  embedding vector(384) NOT NULL,

  -- Metadata & relationships
  metadata JSONB DEFAULT '{}'::jsonb,
  file_id UUID REFERENCES uploaded_files(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector
  ON message_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_message_embeddings_user_id ON message_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_timestamp ON message_embeddings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_source ON message_embeddings(source);

-- Chat Messages Table - Episodic Memory (Enhanced from Phase 2)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  echo_version_id UUID REFERENCES echo_models(id) ON DELETE SET NULL,

  -- Message content
  content TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,

  -- Context & memory
  embedding vector(384), -- For semantic search of past conversations
  context_used TEXT[], -- Array of message_embedding IDs used for context

  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb, -- tokens, model, latency, etc.

  -- Learning signal
  user_feedback TEXT CHECK (user_feedback IN ('thumbs_up', 'thumbs_down')),
  feedback_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_echo_version ON chat_messages(echo_version_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_vector
  ON chat_messages USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;

-- Training Jobs Table - Async Job Queue Tracking
CREATE TABLE IF NOT EXISTS training_jobs (
  id TEXT PRIMARY KEY, -- Celery task ID
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN (
    'file_processing',
    'embedding_generation',
    'echo_training',
    'lora_fine_tuning'
  )),

  -- Status tracking
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Job details
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,

  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Resource usage
  processing_time_seconds INTEGER,
  tokens_used INTEGER
);

CREATE INDEX IF NOT EXISTS idx_training_jobs_user_id ON training_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status) WHERE status IN ('queued', 'processing');
CREATE INDEX IF NOT EXISTS idx_training_jobs_created ON training_jobs(queued_at DESC);

-- Echo Evolution Log - Track Personality Changes Over Time
CREATE TABLE IF NOT EXISTS echo_evolution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  from_version INTEGER,
  to_version INTEGER NOT NULL,

  -- What changed
  change_summary TEXT,
  personality_diff JSONB DEFAULT '{}'::jsonb,
  new_phrases_learned TEXT[] DEFAULT '{}',

  -- Trigger metadata
  trigger_type TEXT CHECK (trigger_type IN ('scheduled_retraining', 'user_requested', 'new_data_threshold')),
  messages_added_since_last INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_echo_evolution_user_id ON echo_evolution_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_echo_evolution_versions ON echo_evolution_log(user_id, to_version DESC);

-- Echo Statistics Table (Enhanced from Phase 2)
CREATE TABLE IF NOT EXISTS echo_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,

  -- Current stats
  total_messages INTEGER DEFAULT 0,
  total_embeddings INTEGER DEFAULT 0,
  active_echo_version INTEGER,

  -- Quality metrics
  accuracy_score NUMERIC(3,2) DEFAULT 0.0,
  last_trained TIMESTAMPTZ,

  -- Data sources
  data_sources TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create user-files bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_evolution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_stats ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Uploaded Files Policies
DROP POLICY IF EXISTS "Users can view their own files" ON uploaded_files;
DROP POLICY IF EXISTS "Users can upload their own files" ON uploaded_files;
DROP POLICY IF EXISTS "Users can update their own files" ON uploaded_files;
DROP POLICY IF EXISTS "Users can delete their own files" ON uploaded_files;

CREATE POLICY "Users can view their own files" ON uploaded_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own files" ON uploaded_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" ON uploaded_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" ON uploaded_files
  FOR DELETE USING (auth.uid() = user_id);

-- Echo Models Policies (New)
CREATE POLICY "Users can view their own echo models" ON echo_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own echo models" ON echo_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own echo models" ON echo_models
  FOR UPDATE USING (auth.uid() = user_id);

-- Message Embeddings Policies (New)
CREATE POLICY "Users can view their own embeddings" ON message_embeddings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own embeddings" ON message_embeddings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat Messages Policies
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;

CREATE POLICY "Users can view their own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Training Jobs Policies (New)
CREATE POLICY "Users can view their own training jobs" ON training_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training jobs" ON training_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training jobs" ON training_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Echo Evolution Log Policies (New)
CREATE POLICY "Users can view their own evolution log" ON echo_evolution_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evolution log" ON echo_evolution_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Echo Stats Policies
DROP POLICY IF EXISTS "Users can view their own echo stats" ON echo_stats;
DROP POLICY IF EXISTS "Users can update their own echo stats" ON echo_stats;

CREATE POLICY "Users can view their own echo stats" ON echo_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own echo stats" ON echo_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own echo stats" ON echo_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage Policies
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Search semantic memories using vector similarity
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(384),
  user_uuid UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  "timestamp" TIMESTAMPTZ,
  source TEXT,
  sender TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    message_embeddings.id,
    message_embeddings.content,
    1 - (message_embeddings.embedding <=> query_embedding) as similarity,
    message_embeddings."timestamp",
    message_embeddings.source,
    message_embeddings.sender,
    message_embeddings.metadata
  FROM message_embeddings
  WHERE
    message_embeddings.user_id = user_uuid
    AND 1 - (message_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY message_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Get active echo model for a user
CREATE OR REPLACE FUNCTION get_active_echo(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  version INTEGER,
  model_type TEXT,
  personality_traits JSONB,
  communication_style JSONB,
  system_prompt TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    echo_models.id,
    echo_models.version,
    echo_models.model_type,
    echo_models.personality_traits,
    echo_models.communication_style,
    echo_models.system_prompt,
    echo_models.created_at
  FROM echo_models
  WHERE
    echo_models.user_id = user_uuid
    AND echo_models.is_active = true
  ORDER BY echo_models.version DESC
  LIMIT 1;
END;
$$;

-- Function: Deactivate all echo models except the specified one
CREATE OR REPLACE FUNCTION set_active_echo(
  user_uuid UUID,
  echo_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate all echo models for this user
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

-- Function: Get echo evolution statistics
CREATE OR REPLACE FUNCTION get_echo_evolution_stats(user_uuid UUID)
RETURNS TABLE (
  total_versions INTEGER,
  latest_version INTEGER,
  total_retrainings INTEGER,
  last_retrain_date TIMESTAMPTZ,
  personality_stability FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  version_count INTEGER;
  latest_ver INTEGER;
  retrain_count INTEGER;
  last_train TIMESTAMPTZ;
BEGIN
  -- Count total versions
  SELECT COUNT(*), MAX(version) INTO version_count, latest_ver
  FROM echo_models
  WHERE user_id = user_uuid;

  -- Count retraining events
  SELECT COUNT(*), MAX(created_at) INTO retrain_count, last_train
  FROM echo_evolution_log
  WHERE user_id = user_uuid;

  RETURN QUERY
  SELECT
    COALESCE(version_count, 0),
    COALESCE(latest_ver, 0),
    COALESCE(retrain_count, 0),
    last_train,
    0.0::FLOAT; -- Placeholder for personality stability metric
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to create user profile and stats when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create echo stats
  INSERT INTO echo_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_echo_stats_updated_at ON echo_stats;
CREATE TRIGGER update_echo_stats_updated_at
  BEFORE UPDATE ON echo_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_message_embeddings_user_timestamp
  ON message_embeddings(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_timestamp
  ON chat_messages(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_training_jobs_user_status
  ON training_jobs(user_id, status, queued_at DESC);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE echo_models IS 'Versioned personality snapshots - core of digital consciousness';
COMMENT ON TABLE message_embeddings IS 'Vector embeddings for semantic memory search using pgvector';
COMMENT ON TABLE chat_messages IS 'Episodic memory - all conversations between user and echo';
COMMENT ON TABLE training_jobs IS 'Async job queue tracking for Celery workers';
COMMENT ON TABLE echo_evolution_log IS 'Tracks personality changes between echo versions';

COMMENT ON COLUMN echo_models.system_prompt IS 'Injected personality prompt for LLM';
COMMENT ON COLUMN echo_models.lora_adapter_path IS 'Path to fine-tuned LoRA weights in storage';
COMMENT ON COLUMN message_embeddings.embedding IS '384-dim vector from sentence-transformers/all-MiniLM-L6-v2';
COMMENT ON COLUMN chat_messages.context_used IS 'Array of message_embedding IDs used for RAG context';

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

INSERT INTO schema_version (version, description)
VALUES ('3.0.0', 'Phase 3 Production Schema - Vector embeddings, echo versioning, async jobs')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

SELECT 'Exoself Phase 3 Schema Installation Complete! 🚀' as status;
SELECT 'Next steps:' as next_step,
       '1. Verify pgvector extension is enabled' as step_1,
       '2. Test vector similarity search with sample data' as step_2,
       '3. Set up Celery workers for async processing' as step_3;