import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface ProcessingResult {
  success: boolean
  messageCount: number
  patterns: {
    avgMessageLength: number
    commonStarters: string[]
    punctuationStyle: Record<string, number>
  }
  imageAnalysis?: {
    description: string
    objects: string[]
    locations: string[]
    people: string[]
    activities: string[]
    emotions: string[]
  }
  error?: string
}

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    // Get file record from database
    const { data: fileRecord, error: fileError } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single()

    if (fileError || !fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Update status to processing
    await supabase
      .from('uploaded_files')
      .update({ processing_status: 'processing' })
      .eq('id', fileId)

    try {
      // Download file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('user-files')
        .download(fileRecord.storage_path)

      if (downloadError || !fileData) {
        throw new Error('Failed to download file')
      }

      // Process the file using Python training engine
      let result: ProcessingResult

      try {
        result = await processwithPythonEngine(fileRecord, user.id, fileData)
      } catch (error) {
        console.error('Python engine processing failed:', error)
        // For now, don't fall back to TypeScript - we need Python storage for training
        throw new Error(`Python processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      if (result.success) {
        // Update file record with processing results
        await supabase
          .from('uploaded_files')
          .update({
            processing_status: 'completed',
            processed_at: new Date().toISOString(),
            message_count: result.messageCount
          })
          .eq('id', fileId)

        // Update or create echo stats
        await updateEchoStats(supabase, user.id, result.messageCount, result.patterns)

        return NextResponse.json({
          success: true,
          messageCount: result.messageCount,
          patterns: result.patterns
        })
      } else {
        // Update status to error
        await supabase
          .from('uploaded_files')
          .update({
            processing_status: 'error',
            error_message: result.error || 'Processing failed'
          })
          .eq('id', fileId)

        return NextResponse.json({
          success: false,
          error: result.error || 'Processing failed'
        }, { status: 500 })
      }

    } catch (processingError) {
      // Update status to error
      await supabase
        .from('uploaded_files')
        .update({
          processing_status: 'error',
          error_message: processingError instanceof Error ? processingError.message : 'Unknown error'
        })
        .eq('id', fileId)

      throw processingError
    }

  } catch (error) {
    console.error('File processing error:', error)
    return NextResponse.json(
      { error: 'File processing failed' },
      { status: 500 }
    )
  }
}

async function processWhatsAppFile(text: string, userId: string): Promise<ProcessingResult> {
  try {
    // WhatsApp message pattern - matches format: [DD.MM.YY, HH:MM:SS] Sender: Message
    const messagePattern = /\[(\d{2}\.\d{2}\.\d{2},\s\d{2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)/g
    const messages: Array<{ timestamp: string, sender: string, content: string }> = []

    let match
    while ((match = messagePattern.exec(text)) !== null) {
      const [, timestamp, sender, content] = match
      messages.push({
        timestamp: timestamp.trim(),
        sender: sender.trim(),
        content: content.trim()
      })
    }

    if (messages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No messages found in the file. Please check the format.'
      }
    }

    // Detect main user (user with most messages)
    const senderCounts: Record<string, number> = {}
    messages.forEach(msg => {
      senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1
    })

    const mainUser = Object.entries(senderCounts)
      .sort(([,a], [,b]) => b - a)[0][0]

    // Filter messages from the main user
    const userMessages = messages.filter(msg => msg.sender === mainUser)

    // Analyze patterns
    const patterns = analyzeWritingPatterns(userMessages.map(m => m.content))

    return {
      success: true,
      messageCount: messages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: error instanceof Error ? error.message : 'Unknown processing error'
    }
  }
}

async function processJSONFile(text: string, userId: string, filename: string): Promise<ProcessingResult> {
  try {
    const data = JSON.parse(text)

    // Detect JSON format type
    if (data.messages && Array.isArray(data.messages)) {
      // WhatsApp JSON format
      return await processWhatsAppJSON(data, userId)
    } else if (data.inbox_data || (Array.isArray(data) && data[0]?.participants)) {
      // Instagram JSON format
      return await processInstagramJSON(data, userId)
    } else if (data.chats || data.messages) {
      // Telegram JSON format
      return await processTelegramJSON(data, userId)
    } else if (data.tweet || data.account) {
      // Twitter/X JSON format
      return await processTwitterJSON(data, userId)
    } else if (data.messages && data.channel) {
      // Discord JSON format
      return await processDiscordJSON(data, userId)
    } else {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'Unknown JSON format. Please check if this is a supported chat export.'
      }
    }
  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'Invalid JSON format or corrupted file.'
    }
  }
}

async function processWhatsAppJSON(data: any, userId: string): Promise<ProcessingResult> {
  try {
    const messages = data.messages || []

    if (messages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No messages found in WhatsApp JSON file.'
      }
    }

    // Extract messages with sender and content
    const extractedMessages: Array<{ sender: string, content: string }> = []

    messages.forEach((msg: any) => {
      // WhatsApp JSON structure: { sender_name: "Name", content: "message", timestamp_ms: 123456 }
      if (msg.sender_name && (msg.content || msg.text)) {
        extractedMessages.push({
          sender: msg.sender_name,
          content: msg.content || msg.text || ''
        })
      }
    })

    if (extractedMessages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No valid messages found in WhatsApp JSON.'
      }
    }

    // Detect main user (most messages)
    const senderCounts: Record<string, number> = {}
    extractedMessages.forEach(msg => {
      senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1
    })

    const mainUser = Object.entries(senderCounts)
      .sort(([,a], [,b]) => b - a)[0][0]

    // Filter messages from main user
    const userMessages = extractedMessages
      .filter(msg => msg.sender === mainUser)
      .map(msg => msg.content)

    // Analyze patterns
    const patterns = analyzeWritingPatterns(userMessages)

    return {
      success: true,
      messageCount: extractedMessages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: error instanceof Error ? error.message : 'WhatsApp JSON processing error'
    }
  }
}

async function processInstagramJSON(data: any, userId: string): Promise<ProcessingResult> {
  try {
    // Instagram format can be array of conversations or single conversation
    let conversations = Array.isArray(data) ? data : [data]
    let allMessages: Array<{ sender: string, content: string }> = []

    conversations.forEach(conversation => {
      const messages = conversation.messages || []
      messages.forEach((msg: any) => {
        // Instagram structure: { sender_name: "Name", content: "message", timestamp_ms: 123456 }
        if (msg.sender_name && msg.content) {
          allMessages.push({
            sender: msg.sender_name,
            content: msg.content
          })
        }
      })
    })

    if (allMessages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No messages found in Instagram JSON file.'
      }
    }

    // Find main user
    const senderCounts: Record<string, number> = {}
    allMessages.forEach(msg => {
      senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1
    })

    const mainUser = Object.entries(senderCounts)
      .sort(([,a], [,b]) => b - a)[0][0]

    const userMessages = allMessages
      .filter(msg => msg.sender === mainUser)
      .map(msg => msg.content)

    const patterns = analyzeWritingPatterns(userMessages)

    return {
      success: true,
      messageCount: allMessages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'Instagram JSON processing error'
    }
  }
}

async function processTelegramJSON(data: any, userId: string): Promise<ProcessingResult> {
  try {
    const messages = data.messages || []

    if (messages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No messages found in Telegram JSON file.'
      }
    }

    const extractedMessages: Array<{ sender: string, content: string }> = []

    messages.forEach((msg: any) => {
      // Telegram structure: { from: "Name", text: "message" } or { from: "Name", text: [{"type": "plain", "text": "message"}] }
      if (msg.from && (msg.text || msg.message)) {
        let content = ''

        if (typeof msg.text === 'string') {
          content = msg.text
        } else if (Array.isArray(msg.text)) {
          content = msg.text.map((part: any) => part.text || '').join('')
        } else if (msg.message) {
          content = msg.message
        }

        if (content.trim()) {
          extractedMessages.push({
            sender: msg.from,
            content: content.trim()
          })
        }
      }
    })

    if (extractedMessages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No valid messages found in Telegram JSON.'
      }
    }

    // Find main user
    const senderCounts: Record<string, number> = {}
    extractedMessages.forEach(msg => {
      senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1
    })

    const mainUser = Object.entries(senderCounts)
      .sort(([,a], [,b]) => b - a)[0][0]

    const userMessages = extractedMessages
      .filter(msg => msg.sender === mainUser)
      .map(msg => msg.content)

    const patterns = analyzeWritingPatterns(userMessages)

    return {
      success: true,
      messageCount: extractedMessages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'Telegram JSON processing error'
    }
  }
}

async function processTwitterJSON(data: any, userId: string): Promise<ProcessingResult> {
  try {
    // Twitter archive can have different structures
    let tweets: any[] = []

    if (data.tweet) {
      tweets = [data]
    } else if (Array.isArray(data)) {
      tweets = data
    } else if (data.tweets) {
      tweets = data.tweets
    }

    const extractedMessages: string[] = []

    tweets.forEach((tweet: any) => {
      const tweetData = tweet.tweet || tweet
      if (tweetData.full_text || tweetData.text) {
        const text = tweetData.full_text || tweetData.text
        // Filter out retweets and replies for better personality analysis
        if (!text.startsWith('RT @') && !text.startsWith('@')) {
          extractedMessages.push(text)
        }
      }
    })

    if (extractedMessages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No tweets found in Twitter JSON file.'
      }
    }

    const patterns = analyzeWritingPatterns(extractedMessages)

    return {
      success: true,
      messageCount: extractedMessages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'Twitter JSON processing error'
    }
  }
}

async function processDiscordJSON(data: any, userId: string): Promise<ProcessingResult> {
  try {
    const messages = data.messages || []

    if (messages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No messages found in Discord JSON file.'
      }
    }

    const extractedMessages: Array<{ sender: string, content: string }> = []

    messages.forEach((msg: any) => {
      // Discord structure: { Author: { Name: "Username" }, Content: "message" }
      if (msg.Author?.Name && msg.Content) {
        extractedMessages.push({
          sender: msg.Author.Name,
          content: msg.Content
        })
      }
    })

    if (extractedMessages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No valid messages found in Discord JSON.'
      }
    }

    // Find main user
    const senderCounts: Record<string, number> = {}
    extractedMessages.forEach(msg => {
      senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1
    })

    const mainUser = Object.entries(senderCounts)
      .sort(([,a], [,b]) => b - a)[0][0]

    const userMessages = extractedMessages
      .filter(msg => msg.sender === mainUser)
      .map(msg => msg.content)

    const patterns = analyzeWritingPatterns(userMessages)

    return {
      success: true,
      messageCount: extractedMessages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'Discord JSON processing error'
    }
  }
}

async function processCSVFile(text: string, userId: string, filename: string): Promise<ProcessingResult> {
  try {
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'Empty CSV file.'
      }
    }

    // Try to detect CSV format (SMS, email, etc.)
    const header = lines[0].toLowerCase()

    if (header.includes('message') && header.includes('sender')) {
      return await processSMSCSV(lines, userId)
    } else if (header.includes('subject') && header.includes('from')) {
      return await processEmailCSV(lines, userId)
    } else {
      return await processGenericCSV(lines, userId)
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'CSV processing error'
    }
  }
}

async function processSMSCSV(lines: string[], userId: string): Promise<ProcessingResult> {
  try {
    const messages: string[] = []

    // Skip header, process data rows
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',')
      if (columns.length >= 2) {
        // Assume message is in last column
        const messageText = columns[columns.length - 1]?.replace(/"/g, '').trim()
        if (messageText && messageText.length > 0) {
          messages.push(messageText)
        }
      }
    }

    if (messages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No valid SMS messages found in CSV.'
      }
    }

    const patterns = analyzeWritingPatterns(messages)

    return {
      success: true,
      messageCount: messages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'SMS CSV processing error'
    }
  }
}

async function processEmailCSV(lines: string[], userId: string): Promise<ProcessingResult> {
  try {
    const messages: string[] = []

    // Skip header, process data rows
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',')
      if (columns.length >= 3) {
        // Combine subject and body for analysis
        const subject = columns[1]?.replace(/"/g, '').trim() || ''
        const body = columns[2]?.replace(/"/g, '').trim() || ''
        const combined = `${subject} ${body}`.trim()

        if (combined.length > 0) {
          messages.push(combined)
        }
      }
    }

    if (messages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No valid emails found in CSV.'
      }
    }

    const patterns = analyzeWritingPatterns(messages)

    return {
      success: true,
      messageCount: messages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'Email CSV processing error'
    }
  }
}

async function processGenericCSV(lines: string[], userId: string): Promise<ProcessingResult> {
  try {
    const messages: string[] = []

    // For generic CSV, try to extract text from all columns
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',')
      const combinedText = columns
        .map(col => col?.replace(/"/g, '').trim())
        .filter(col => col && col.length > 10) // Only meaningful text
        .join(' ')

      if (combinedText.length > 0) {
        messages.push(combinedText)
      }
    }

    if (messages.length === 0) {
      return {
        success: false,
        messageCount: 0,
        patterns: {
          avgMessageLength: 0,
          commonStarters: [],
          punctuationStyle: {}
        },
        error: 'No valid text content found in CSV.'
      }
    }

    const patterns = analyzeWritingPatterns(messages)

    return {
      success: true,
      messageCount: messages.length,
      patterns
    }

  } catch (error) {
    return {
      success: false,
      messageCount: 0,
      patterns: {
        avgMessageLength: 0,
        commonStarters: [],
        punctuationStyle: {}
      },
      error: 'Generic CSV processing error'
    }
  }
}

function analyzeWritingPatterns(messages: string[]) {
  if (messages.length === 0) {
    return {
      avgMessageLength: 0,
      commonStarters: [],
      punctuationStyle: {}
    }
  }

  // Calculate average message length
  const avgMessageLength = messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length

  // Find common message starters
  const starters: Record<string, number> = {}
  messages.forEach(msg => {
    const words = msg.split(' ')
    if (words.length > 0) {
      const firstWord = words[0].toLowerCase().replace(/[^\w]/g, '')
      if (firstWord) {
        starters[firstWord] = (starters[firstWord] || 0) + 1
      }
    }
  })

  const commonStarters = Object.entries(starters)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)

  // Analyze punctuation style
  const total = messages.length
  const punctuationStyle = {
    exclamation: messages.filter(m => m.includes('!')).length / total,
    question: messages.filter(m => m.includes('?')).length / total,
    ellipsis: messages.filter(m => m.includes('...')).length / total,
    caps: messages.filter(m => /[A-Z]{2,}/.test(m)).length / total
  }

  return {
    avgMessageLength: Math.round(avgMessageLength * 100) / 100,
    commonStarters,
    punctuationStyle
  }
}

async function updateEchoStats(supabase: any, userId: string, messageCount: number, patterns: any) {
  // Get existing stats
  const { data: existingStats } = await supabase
    .from('echo_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  const totalMessages = (existingStats?.total_messages || 0) + messageCount

  // Calculate a simple accuracy score based on message count
  // More messages = higher accuracy (max 95%)
  const accuracyScore = Math.min(0.95, Math.max(0.1, Math.log10(totalMessages) / 5))

  if (existingStats) {
    // Update existing stats
    await supabase
      .from('echo_stats')
      .update({
        total_messages: totalMessages,
        accuracy_score: accuracyScore,
        last_trained: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
  } else {
    // Create new stats
    await supabase
      .from('echo_stats')
      .insert({
        user_id: userId,
        total_messages: totalMessages,
        accuracy_score: accuracyScore,
        last_trained: new Date().toISOString(),
        data_sources: ['whatsapp'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
  }
}

async function processwithPythonEngine(fileRecord: any, userId: string, fileData: Blob): Promise<ProcessingResult> {
  const { spawn } = await import('child_process')

  // Read file content and write to temporary file
  const text = await fileData.text()
  const fs = await import('fs')
  const path = await import('path')
  const os = await import('os')

  // Create temporary file with the content
  const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}_${fileRecord.id}.txt`)
  fs.writeFileSync(tempFilePath, text)

  return new Promise((resolve, reject) => {
    // Prepare data for Python script (without large file content)
    const requestData = {
      fileId: fileRecord.id,
      userId: userId,
      fileType: fileRecord.file_type,
      storagePath: fileRecord.storage_path,
      filename: fileRecord.original_name,
      tempFilePath: tempFilePath,  // Pass temp file path instead
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }

    // Create temporary file for the request data
    const requestTempFilePath = path.join(os.tmpdir(), `process_file_${Date.now()}_${fileRecord.id}.json`)
    fs.writeFileSync(requestTempFilePath, JSON.stringify(requestData))

    // Call Python API bridge (server-side)
    const pythonProcess = spawn('/usr/bin/python3', [
      'server/python/api_bridge.py',
      'process_file_file',
      requestTempFilePath
    ], {
      stdio: ['pipe', 'pipe', 'pipe'], // Capture stderr separately
      cwd: process.cwd() // Ensure correct working directory
    })

    if (!pythonProcess || !pythonProcess.stdout || !pythonProcess.stderr) {
      // Clean up temp files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
      if (fs.existsSync(requestTempFilePath)) {
        fs.unlinkSync(requestTempFilePath)
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
      // Clean up temp files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }

      if (code !== 0) {
        console.error('Python process error:', stderr)
        reject(new Error(`Python process failed with code ${code}: ${stderr}`))
        return
      }

      try {
        const result = JSON.parse(stdout)

        if (result.success) {
          // Convert Python result to ProcessingResult format
          resolve({
            success: true,
            messageCount: result.messageCount || 1,
            patterns: {
              avgMessageLength: result.messageCount || 1,
              commonStarters: [result.insights || 'Processed with Python engine'],
              punctuationStyle: { period: 1, comma: 1, exclamation: 0, question: 0, ellipsis: 0, caps: 0 }
            },
            imageAnalysis: result.analysis || undefined
          })
        } else {
          reject(new Error(result.error || 'Python processing failed'))
        }
      } catch (parseError) {
        console.error('Failed to parse Python response:', stdout)
        reject(new Error(`Failed to parse Python response: ${parseError}`))
      }
    })

    pythonProcess.on('error', (error) => {
      // Clean up temp files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
      if (fs.existsSync(requestTempFilePath)) {
        fs.unlinkSync(requestTempFilePath)
      }
      reject(new Error(`Failed to start Python process: ${error.message}`))
    })
  })
}