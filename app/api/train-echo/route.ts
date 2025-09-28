import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Start echo training using Python engine
    const result = await trainEchoWithPython(user.id)

    if (result.success) {
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        messagesProcessed: result.messagesProcessed,
        personalityTraits: result.personalityTraits
      })
    } else {
      return NextResponse.json({
        error: result.error || 'Training failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Echo training error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function trainEchoWithPython(userId: string): Promise<any> {
  const { spawn } = await import('child_process')
  const path = await import('path')
  const fs = await import('fs')
  const os = await import('os')

  return new Promise((resolve, reject) => {
    try {
      // Prepare data for Python script
      const requestData = {
        userId: userId
      }

      // Create temporary file for the request data
      const tempFilePath = path.join(os.tmpdir(), `train_echo_${Date.now()}_${userId}.json`)
      fs.writeFileSync(tempFilePath, JSON.stringify(requestData))

      // Call Python API bridge (server-side)
      const pythonProcess = spawn('/usr/bin/python3', [
        'server/python/api_bridge.py',
        'train_echo_file',
        tempFilePath
      ], {
        stdio: ['pipe', 'pipe', 'pipe'], // Capture stderr separately
        cwd: process.cwd() // Ensure correct working directory
      })

      if (!pythonProcess || !pythonProcess.stdout || !pythonProcess.stderr) {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath)
        }
        reject(new Error('Failed to spawn Python process'))
        return
      }

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      pythonProcess.on('close', (code) => {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath)
        }

        if (code !== 0) {
          console.error('Python training process error:', stderr)
          resolve({ success: false, error: `Training process failed: ${stderr}` })
          return
        }

        try {
          const result = JSON.parse(stdout)
          resolve(result)
        } catch (parseError) {
          console.error('Failed to parse Python training response:', stdout)
          resolve({ success: false, error: `Failed to parse training response: ${parseError}` })
        }
      })

      pythonProcess.on('error', (error) => {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath)
        }
        resolve({ success: false, error: `Failed to start training process: ${error.message}` })
      })
    } catch (error) {
      reject(error)
    }
  })
}