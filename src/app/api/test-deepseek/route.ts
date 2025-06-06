import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing DeepSeek API connection...')
    
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com'
    })

    // Test 1: Simple deepseek-chat call
    console.log('🔵 Testing deepseek-chat...')
    try {
      const chatResponse = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Say "chat works"' }],
        max_tokens: 10
      })
      
      console.log('✅ deepseek-chat response:', chatResponse.choices[0].message.content)
    } catch (chatError) {
      console.error('❌ deepseek-chat error:', chatError)
      return NextResponse.json({
        success: false,
        error: 'deepseek-chat failed',
        details: chatError.message,
        timestamp: new Date().toISOString()
      })
    }

    // Test 2: deepseek-reasoner call
    console.log('🟡 Testing deepseek-reasoner...')
    try {
      const reasonerResponse = await client.chat.completions.create({
        model: 'deepseek-reasoner',
        messages: [{ role: 'user', content: 'Say "reasoner works"' }],
        max_tokens: 10
      })
      
      const reasoning = reasonerResponse.choices[0].message.reasoning_content
      const content = reasonerResponse.choices[0].message.content
      
      console.log('✅ deepseek-reasoner content:', content)
      console.log('🧠 deepseek-reasoner reasoning length:', reasoning?.length || 0)
      
      return NextResponse.json({
        success: true,
        tests: {
          chat: { status: 'success' },
          reasoner: { 
            status: 'success',
            content: content,
            reasoning_length: reasoning?.length || 0,
            has_reasoning: !!reasoning
          }
        },
        environment: {
          api_key_configured: !!process.env.DEEPSEEK_API_KEY,
          api_key_length: process.env.DEEPSEEK_API_KEY?.length || 0
        },
        timestamp: new Date().toISOString()
      })
      
    } catch (reasonerError) {
      console.error('❌ deepseek-reasoner error:', reasonerError)
      
      return NextResponse.json({
        success: false,
        error: 'deepseek-reasoner failed',
        details: reasonerError.message,
        tests: {
          chat: { status: 'success' },
          reasoner: { status: 'failed', error: reasonerError.message }
        },
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('💥 Complete API test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Complete test failed',
      details: error.message,
      environment: {
        api_key_configured: !!process.env.DEEPSEEK_API_KEY
      },
      timestamp: new Date().toISOString()
    })
  }
}