-- ============================================================================
-- EXOSELF MIGRATION: Phase 2 → Phase 3
-- Upgrade existing database to production architecture
-- ============================================================================
-- ⚠️  IMPORTANT: Backup your database before running this migration!
-- ⚠️  This migration is IDEMPOTENT - safe to run multiple times
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Enable pgvector Extension
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "vector";

SELECT 'Step 1: pgvector extension enabled ✅' as status;

-- ============================================================================
-- STEP 2: Enhance Existing Tables
-- ============================================================================

-- Add embedding_status column to uploaded_files
ALTER TABLE uploaded_files
ADD COLUMN IF NOT EXISTS embedding_status TEXT
  CHECK (embedding_status IN ('pending', 'processing', 'completed', 'error'))
  DEFAULT 'pending';

-- Add metadata JSONB column if not exists
ALTER TABLE uploaded_files
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Enhance chat_messages table for Phase 3
-- Note: Foreign key to echo_models will be added after echo_models table is created
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS echo_version_id UUID;

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS embedding vector(384);

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS context_used TEXT[];

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS user_feedback TEXT
  CHECK (user_feedback IN ('thumbs_up', 'thumbs_down'));

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS feedback_note TEXT;

-- Change sender column to use 'role' naming convention (but keep backward compatible)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'sender'
  ) THEN
    -- Rename sender to role if not already done
    ALTER TABLE chat_messages RENAME COLUMN sender TO role;
  END IF;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Enhance echo_stats table
ALTER TABLE echo_stats
ADD COLUMN IF NOT EXISTS total_embeddings INTEGER DEFAULT 0;

ALTER TABLE echo_stats
ADD COLUMN IF NOT EXISTS active_echo_version INTEGER;

SELECT 'Step 2: Existing tables enhanced ✅' as status;

-- ============================================================================
-- STEP 3: Create New Phase 3 Tables
-- ============================================================================

-- Echo Models Table - Persistent Personality Versions
CREATE TABLE IF NOT EXISTS echo_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  model_type TEXT DEFAULT 'base' CHECK (model_type IN ('base', 'lora-fine-tuned', 'full-fine-tuned')),

  -- Personality snapshot
  personality_traits JSONB NOT NULL DEFAULT '{}'::jsonb,
  communication_style JSONB NOT NULL DEFAULT '{}'::jsonb,
  common_phrases TEXT[] DEFAULT '{}',

  -- Training metadata
  training_data_snapshot JSONB DEFAULT '{}'::jsonb,
  messages_processed INTEGER DEFAULT 0,
  training_duration_seconds INTEGER,

  -- Model configuration
  system_prompt TEXT NOT NULL,
  lora_adapter_path TEXT,
  embedding_model TEXT DEFAULT 'all-MiniLM-L6-v2',

  -- Status & metadata
  is_active BOOLEAN DEFAULT true,
  training_logs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

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
  source TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  sender TEXT NOT NULL,
  thread_id TEXT,

  -- Vector embedding
  embedding vector(384) NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  file_id UUID REFERENCES uploaded_files(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector
  ON message_embeddings USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_message_embeddings_user_id ON message_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_timestamp ON message_embeddings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_source ON message_embeddings(source);

-- Training Jobs Table
CREATE TABLE IF NOT EXISTS training_jobs (
  id TEXT PRIMARY KEY,
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

-- Echo Evolution Log
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

SELECT 'Step 3: New Phase 3 tables created ✅' as status;

-- Add foreign key constraint to chat_messages now that echo_models exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_messages_echo_version_id_fkey'
    AND table_name = 'chat_messages'
  ) THEN
    ALTER TABLE chat_messages
    ADD CONSTRAINT chat_messages_echo_version_id_fkey
    FOREIGN KEY (echo_version_id) REFERENCES echo_models(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Update Row Level Security Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE echo_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_evolution_log ENABLE ROW LEVEL SECURITY;

-- Echo Models Policies
DROP POLICY IF EXISTS "Users can view their own echo models" ON echo_models;
DROP POLICY IF EXISTS "Users can insert their own echo models" ON echo_models;
DROP POLICY IF EXISTS "Users can update their own echo models" ON echo_models;

CREATE POLICY "Users can view their own echo models" ON echo_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own echo models" ON echo_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own echo models" ON echo_models
  FOR UPDATE USING (auth.uid() = user_id);

-- Message Embeddings Policies
DROP POLICY IF EXISTS "Users can view their own embeddings" ON message_embeddings;
DROP POLICY IF EXISTS "Users can insert their own embeddings" ON message_embeddings;

CREATE POLICY "Users can view their own embeddings" ON message_embeddings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own embeddings" ON message_embeddings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Training Jobs Policies
DROP POLICY IF EXISTS "Users can view their own training jobs" ON training_jobs;
DROP POLICY IF EXISTS "Users can insert their own training jobs" ON training_jobs;
DROP POLICY IF EXISTS "Users can update their own training jobs" ON training_jobs;

CREATE POLICY "Users can view their own training jobs" ON training_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training jobs" ON training_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training jobs" ON training_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Echo Evolution Log Policies
DROP POLICY IF EXISTS "Users can view their own evolution log" ON echo_evolution_log;
DROP POLICY IF EXISTS "Users can insert their own evolution log" ON echo_evolution_log;

CREATE POLICY "Users can view their own evolution log" ON echo_evolution_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evolution log" ON echo_evolution_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update chat_messages policies for new columns
DROP POLICY IF EXISTS "Users can update their own chat messages" ON chat_messages;

CREATE POLICY "Users can update their own chat messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

SELECT 'Step 4: Row Level Security policies updated ✅' as status;

-- ============================================================================
-- STEP 5: Create Helper Functions
-- ============================================================================

-- Function: Search semantic memories
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

-- Function: Get active echo
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

-- Function: Set active echo
CREATE OR REPLACE FUNCTION set_active_echo(
  user_uuid UUID,
  echo_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE echo_models SET is_active = false WHERE user_id = user_uuid;
  UPDATE echo_models SET is_active = true WHERE id = echo_id AND user_id = user_uuid;
  RETURN FOUND;
END;
$$;

SELECT 'Step 5: Helper functions created ✅' as status;

-- ============================================================================
-- STEP 6: Create Schema Version Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

INSERT INTO schema_version (version, description)
VALUES
  ('2.0.0', 'Phase 2 - Three-tier architecture (legacy)'),
  ('3.0.0', 'Phase 3 - Vector embeddings, echo versioning, async jobs')
ON CONFLICT (version) DO NOTHING;

SELECT 'Step 6: Schema versioning added ✅' as status;

-- ============================================================================
-- STEP 7: Additional Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_message_embeddings_user_timestamp
  ON message_embeddings(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_timestamp
  ON chat_messages(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_vector
  ON chat_messages USING hnsw (embedding vector_cosine_ops) WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_training_jobs_user_status
  ON training_jobs(user_id, status, queued_at DESC);

SELECT 'Step 7: Performance indexes created ✅' as status;

-- ============================================================================
-- STEP 8: Migration Complete
-- ============================================================================

COMMIT;

SELECT '🚀 Migration Complete!' as status;
SELECT 'Your database is now Phase 3 ready!' as message;
SELECT 'Next steps:' as next_step,
       '1. Verify pgvector is working: SELECT * FROM pg_extension WHERE extname = ''vector'';' as step_1,
       '2. Test vector similarity: Run a sample search_memories() query' as step_2,
       '3. Set up Celery workers for async job processing' as step_3,
       '4. Start generating embeddings for existing messages' as step_4;