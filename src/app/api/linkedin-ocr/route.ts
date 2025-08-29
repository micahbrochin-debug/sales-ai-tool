import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import PDFParser from 'pdf2json'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const openaiToken = formData.get('openaiToken') as string

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No image file provided' 
      }, { status: 400 })
    }

    if (!openaiToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'OpenAI token required for processing' 
      }, { status: 400 })
    }

    console.log(`Processing file: ${file.name} (${file.type})`)

    const openai = new OpenAI({
      apiKey: openaiToken,
    })

    let extractedText = ''

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      if (file.type.includes('pdf')) {
        // Simple PDF text extraction using pdf2json
        console.log('Extracting text from PDF...')
        
        try {
          const pdfParser = new PDFParser()
          
          // Create promise-based PDF parsing
          const pdfText = await new Promise((resolve, reject) => {
            pdfParser.on('pdfParser_dataError', (errData) => {
              console.error('PDF parsing error:', errData.parserError)
              reject(new Error('Failed to parse PDF'))
            })
            
            pdfParser.on('pdfParser_dataReady', (pdfData) => {
              try {
                // Extract text from all pages
                let allText = ''
                if (pdfData.Pages && pdfData.Pages.length > 0) {
                  for (const page of pdfData.Pages) {
                    if (page.Texts && page.Texts.length > 0) {
                      for (const text of page.Texts) {
                        if (text.R && text.R.length > 0) {
                          for (const run of text.R) {
                            if (run.T) {
                              // Decode URI-encoded text
                              allText += decodeURIComponent(run.T) + ' '
                            }
                          }
                        }
                      }
                    }
                  }
                }
                resolve(allText.trim())
              } catch (parseError) {
                console.error('Text extraction error:', parseError)
                reject(new Error('Failed to extract text from PDF'))
              }
            })
            
            // Parse the PDF buffer
            pdfParser.parseBuffer(buffer)
          })
          
          extractedText = pdfText as string
          console.log(`PDF text extracted successfully. Length: ${extractedText.length}`)
          
          if (!extractedText || extractedText.length < 50) {
            throw new Error('PDF appears to be image-based or contains insufficient text')
          }
          
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError)
          return NextResponse.json({ 
            success: false, 
            error: 'Could not extract text from this PDF. It may be image-based or scanned. Please convert the PDF to a high-quality image (PNG or JPG) and upload that instead.' 
          }, { status: 400 })
        }
        
      } else {
        // Handle regular image files
        console.log('Processing image file with GPT-4o Vision...')
        const base64File = buffer.toString('base64')
        const mimeType = file.type || 'image/jpeg'
        
        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Please extract ALL visible text content from this LinkedIn profile image.

Extract EVERYTHING you can see, including:

BASIC INFORMATION:
- Full name of the person
- Current job title and company
- Location/city
- Number of connections

PROFESSIONAL EXPERIENCE:
- All job positions (current and previous)
- Company names and employment dates
- Detailed job descriptions and responsibilities
- Key achievements and accomplishments

EDUCATION:
- Schools/universities attended
- Degrees and graduation years
- Academic honors or distinctions

SKILLS & EXPERTISE:
- Technical skills
- Professional competencies
- Endorsements

PERSONAL & CONNECTION INFO:
- About/summary section
- Personal interests and hobbies
- Mutual connections mentioned
- Any personal notes or connection context
- Volunteer work or community involvement
- Certifications and licenses
- Languages spoken
- Publications or awards

FORMAT: Provide a comprehensive, detailed extraction of ALL visible text. Don't summarize - extract everything exactly as shown.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64File}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4000
        })
        
        extractedText = visionResponse.choices[0]?.message?.content || ''
        console.log(`Image OCR completed. Text length: ${extractedText.length}`)
      }
      
    } catch (error) {
      console.error('OCR processing error:', error)
      return NextResponse.json({ 
        success: false, 
        error: `Failed to process the file: ${error instanceof Error ? error.message : 'Unknown error'}. Please ensure the file is a valid PDF or image.` 
      }, { status: 500 })
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'No text could be extracted from the document. Please try a clearer image or PDF.' 
      }, { status: 400 })
    }

    // Use the existing OpenAI instance to parse the extracted text

    const parseResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at parsing LinkedIn profile text and extracting comprehensive structured information. Return a JSON object with these fields:
- firstName: string
- lastName: string  
- title: string (current job title)
- company: string (current company)
- location: string
- summary: string (about section or professional summary)
- careerHistory: array of {title, company, duration, location, description} - include ALL work experience with full details
- education: array of {school, degree, field, years, details} - include ALL educational background
- skills: array of strings - extract ALL skills mentioned
- connections: string (number of connections if mentioned)
- industry: string
- licenses: array of {name, issuer, date, details} - professional certifications and licenses
- certifications: array of {name, issuer, date, details} - any certifications
- languages: array of strings - languages spoken
- volunteerWork: array of {organization, role, duration, description} - volunteer experience
- personalDetails: object with {interests, publications, awards, patents, recommendations} - any personal notes, interests, or additional details

Extract ALL available information comprehensively. Pay special attention to:
- Personal connection notes or mutual connections mentioned
- Detailed job descriptions and achievements
- Educational honors or distinctions  
- Professional accomplishments and awards
- Any personal interests or hobbies mentioned

If information is not available, use descriptive placeholders like "Not visible in document" or "Please verify manually".`
        },
        {
          role: "user",
          content: `Please extract LinkedIn profile information from this text:\n\n${extractedText}\n\nReturn only valid JSON.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
    })

    const extractedData = parseResponse.choices[0]?.message?.content
    
    if (!extractedData) {
      throw new Error('Failed to parse OCR text')
    }

    // Parse the JSON response
    let parsedData
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedData = extractedData.trim()
      if (cleanedData.startsWith('```json')) {
        cleanedData = cleanedData.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleanedData.startsWith('```')) {
        cleanedData = cleanedData.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }
      
      parsedData = JSON.parse(cleanedData)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', extractedData.substring(0, 500))
      throw new Error('Invalid JSON response from AI parser')
    }

    return NextResponse.json({
      success: true,
      ...parsedData,
      licenses: [],
      certifications: [],
      languages: [],
      volunteerWork: [],
      personalDetails: {
        interests: [],
        publications: [],
        awards: [],
        patents: [],
        recommendations: []
      },
      additionalData: true,
      extractedAt: new Date().toISOString(),
      extractionMethod: 'OCR + AI Processing',
      ocrText: extractedText.substring(0, 1000) // Include first 1000 chars for debugging
    })

  } catch (error) {
    console.error('LinkedIn OCR extraction error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to process LinkedIn screenshot: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    )
  }
}