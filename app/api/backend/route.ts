import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { spawn } from 'child_process'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Backend Python script paths (adjust these to match your setup)
const PYTHON_BACKEND_PATH = process.env.PYTHON_BACKEND_PATH || '/Users/alpaykucuk/Documents/App Projects/Exoself'
const INGESTION_SCRIPT = 'exoself_engine.py'
const CHAT_SCRIPT = 'exoself_chat.py'

export async function POST(request: NextRequest) {
  try {
    // Check authentication using Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, data } = await request.json()

    switch (action) {
      case 'ingest':
        return await handleIngestion(data)
      case 'chat':
        return await handleChat(data)
      case 'status':
        return await handleStatus()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Backend API error:', error)
    return NextResponse.json(
      { error: 'Backend communication failed' },
      { status: 500 }
    )
  }
}

async function handleIngestion(data: any): Promise<NextResponse> {
  return new Promise<NextResponse>((resolve) => {
    const process = spawn('python3', [
      path.join(PYTHON_BACKEND_PATH, INGESTION_SCRIPT),
      '--file', data.filepath || '',
      '--source', data.source || 'unknown'
    ])

    let output = ''
    let error = ''

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.stderr.on('data', (data) => {
      error += data.toString()
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve(NextResponse.json({
          success: true,
          output,
          message: 'Data ingestion completed'
        }))
      } else {
        resolve(NextResponse.json({
          success: false,
          error: error || 'Ingestion failed',
          code
        }, { status: 500 }))
      }
    })
  })
}

async function handleChat(data: any): Promise<NextResponse> {
  return new Promise<NextResponse>((resolve) => {
    const process = spawn('python3', [
      path.join(PYTHON_BACKEND_PATH, CHAT_SCRIPT),
      '--message', data.message || '',
      '--mode', 'api'
    ])

    let output = ''
    let error = ''

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.stderr.on('data', (data) => {
      error += data.toString()
    })

    process.on('close', (code) => {
      if (code === 0) {
        try {
          // Try to parse JSON response from Python script
          const response = JSON.parse(output.trim())
          resolve(NextResponse.json({
            success: true,
            response: response.message || output.trim(),
            metadata: response.metadata || {}
          }))
        } catch {
          // Fallback to plain text response
          resolve(NextResponse.json({
            success: true,
            response: output.trim()
          }))
        }
      } else {
        resolve(NextResponse.json({
          success: false,
          error: error || 'Chat failed',
          code
        }, { status: 500 }))
      }
    })
  })
}

async function handleStatus(): Promise<NextResponse> {
  // Check if Python backend is accessible
  try {
    return new Promise<NextResponse>((resolve) => {
      const process = spawn('python3', ['-c', 'print("Backend accessible")'])

      process.on('close', (code) => {
        resolve(NextResponse.json({
          success: code === 0,
          status: code === 0 ? 'Backend online' : 'Backend offline',
          pythonPath: PYTHON_BACKEND_PATH
        }))
      })
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'Backend unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}