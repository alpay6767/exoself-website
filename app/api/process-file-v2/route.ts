import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const trainingServerUrl = process.env.TRAINING_SERVER_URL || 'http://localhost:8000'

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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}_${file.name || 'unnamed_file'}`
    console.log('File details:', { originalName: file.name, fileName, fileType: file.type })
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(`${user.id}/${fileName}`, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Create file record in database
    const { data: fileRecord, error: fileError } = await supabase
      .from('uploaded_files')
      .insert({
        user_id: user.id,
        filename: fileName,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: uploadData.path,
        processing_status: 'pending'
      })
      .select()
      .single()

    if (fileError) {
      console.error('Database error:', fileError)
      return NextResponse.json({ error: 'Failed to create file record' }, { status: 500 })
    }

    // Call Python training server
    const response = await fetch(`${trainingServerUrl}/process-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        file_id: fileRecord.id,
        storage_path: uploadData.path,
        filename: file.name,
        file_type: file.type
      })
    })

    if (!response.ok) {
      throw new Error(`Training server error: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      fileName: file.name,
      fileType: file.type,
      messageCount: result.message_count,
      insights: result.insights,
      analysis: result.analysis
    })

  } catch (error) {
    console.error('File processing error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}