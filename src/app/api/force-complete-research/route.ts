import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json()
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 })
    }

    const supabase = createClient()
    
    // Check current state
    const { data: current, error: fetchError } = await supabase
      .from('klassenarbeiten')
      .select('id, title, quiz_data')
      .eq('subdomain', subdomain)
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ 
        error: 'Entry not found',
        subdomain 
      }, { status: 404 })
    }

    // FORCE COMPLETION: Mark as failed and clear progress to reset workflow
    const { data: updated, error: updateError } = await supabase
      .from('klassenarbeiten')
      .update({
        quiz_data: {
          status: 'failed',
          error: 'Manually reset - workflow was stuck',
          step: 'Workflow reset - please retry creation',
          progress: 0
        }
      })
      .eq('subdomain', subdomain)
      .select()

    if (updateError) {
      return NextResponse.json({
        error: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: 'workflow_reset',
      subdomain,
      message: 'Research workflow has been reset. The entry is now marked as failed.',
      next_steps: [
        'User should create a new quiz entry',
        'Old stuck entry is now cleared',
        'New workflow will start fresh'
      ]
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Internal error',
      details: error.message
    }, { status: 500 })
  }
}