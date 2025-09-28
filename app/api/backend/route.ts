import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'status':
        // Health check endpoint for compatibility
        try {
          const trainingServerUrl = process.env.TRAINING_SERVER_URL || 'http://localhost:8000'
          const response = await fetch(`${trainingServerUrl}/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            return NextResponse.json({
              success: true,
              status: 'Backend online',
              training_server: 'connected'
            })
          } else {
            return NextResponse.json({
              success: false,
              status: 'Backend degraded',
              training_server: 'disconnected'
            })
          }
        } catch (error) {
          return NextResponse.json({
            success: false,
            status: 'Backend offline',
            training_server: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }

      case 'chat':
        // Handle chat requests by forwarding to training server
        try {
          const message = data?.message
          if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
          }

          const trainingServerUrl = process.env.TRAINING_SERVER_URL || 'http://localhost:8000'
          const response = await fetch(`${trainingServerUrl}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader
            },
            body: JSON.stringify({
              user_id: user.id,
              message: message
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            return NextResponse.json({
              success: false,
              error: errorData.detail || 'Chat request failed'
            }, { status: response.status })
          }

          const chatResponse = await response.json()
          return NextResponse.json({
            success: true,
            response: chatResponse.response || chatResponse.message || 'No response received',
            metadata: chatResponse.metadata || {}
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Failed to process chat request',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Backend API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}