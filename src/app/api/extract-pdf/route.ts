import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function extractTextFromPDF(fileUrl: string): Promise<string> {
  try {
    console.log('📄 Extracting PDF with ScrapeOwl...')
    
    const response = await fetch('https://api.scrapeowl.com/v1/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.SCRAPEOWL_API_KEY}`
      },
      body: JSON.stringify({
        url: fileUrl,
        elements: [
          {
            name: 'text_content',
            selector: 'body',
            output: 'text'
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ScrapeOwl API error: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ PDF text extracted')
    
    return data.elements?.text_content || ''
  } catch (error) {
    console.error('❌ ScrapeOwl API error:', error)
    throw new Error('PDF-Extraktion fehlgeschlagen')
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei gefunden' },
        { status: 400 }
      )
    }

    // For now, return error since we need file upload handling
    // In production, you'd upload to cloud storage first, then extract
    return NextResponse.json(
      { error: 'PDF-Upload wird in der nächsten Version unterstützt. Bitte nutze Text-Eingabe.' },
      { status: 501 }
    )

  } catch (error) {
    console.error('PDF extraction error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der PDF' },
      { status: 500 }
    )
  }
}