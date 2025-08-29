import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface GPTResults {
  [key: string]: string | undefined
  salesPlan?: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, openaiToken, context, chatHistory } = await request.json() as {
      message: string
      openaiToken: string
      context: GPTResults
      chatHistory?: ChatMessage[]
    }

    if (!openaiToken) {
      return NextResponse.json({ error: 'OpenAI token is required' }, { status: 400 })
    }

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey: openaiToken,
    })

    // Prepare context from previous GPT results
    const allGPTOutputs = Object.entries(context)
      .filter(([key, value]) => key !== 'salesPlan' && value)
      .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
      .join('\n\n')
    
    const contextString = `RESEARCH ANALYSIS:\n${allGPTOutputs}\n\nSALES PLAN:\n${context.salesPlan || 'No sales plan available'}`

    // Build conversation messages
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      {
        role: "system" as const,
        content: `You are an expert sales assistant with access to current market intelligence and comprehensive prospect research. You have access to the complete analysis and sales plan for this prospect.

RESEARCH CONTEXT:
${contextString}

Your role is to:
1. Answer questions about the research and analysis
2. Provide clarifications and deeper insights
3. Suggest improvements to the sales strategy
4. Help refine the approach based on new information
5. Engage in natural conversation about the prospect and sales strategy

Be conversational, helpful, and reference specific details from the research when relevant. If asked about specific aspects of the analysis, quote and reference the relevant sections.`
      }
    ]

    // Add conversation history if it exists
    if (chatHistory && chatHistory.length > 0) {
      messages.push(...chatHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })))
    }

    // Add current message
    messages.push({
      role: "user" as const,
      content: message
    })

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
    })

    return NextResponse.json({
      response: response.choices[0]?.message?.content,
    })
  } catch (error) {
    console.error('Error processing chat:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}