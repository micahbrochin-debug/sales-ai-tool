import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { performWebSearch, generateSearchQueries, generateProspectResearchQueries, generateTechStackQueries, generateOrgMappingQueries } from '@/lib/webSearch'

interface ProspectData {
  firstName: string
  lastName: string
  company: string
  title?: string
  email?: string
}

interface CustomGPT {
  id: string
  name: string
  prompt: string
  enabled: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { prospectData, openaiToken, customGPTs } = await request.json() as {
      prospectData: ProspectData
      openaiToken: string
      customGPTs: CustomGPT[]
    }

    if (!openaiToken) {
      return NextResponse.json({ error: 'OpenAI token is required' }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey: openaiToken,
    })

    // Prepare prospect context
    const prospectContext = `
      Name: ${prospectData.firstName} ${prospectData.lastName}
      Company: ${prospectData.company}
      Title: ${prospectData.title || 'Not specified'}
      Email: ${prospectData.email || 'Not specified'}
    `

    // Perform web search for current information
    console.log('Gathering current web intelligence...')
    const searchQueries = generateSearchQueries(prospectData)
    let webSearchContext = ''
    
    try {
      for (const query of searchQueries.slice(0, 2)) { // Limit to 2 searches to avoid rate limits
        const searchResults = await performWebSearch(query, 3)
        if (searchResults) {
          webSearchContext += searchResults + '\n'
        }
      }
    } catch (error) {
      console.error('Web search failed:', error)
      // Continue without web search if it fails
    }

    // Filter enabled GPTs and maintain their original order
    const enabledGPTs = customGPTs.filter(gpt => gpt.enabled)
    
    if (enabledGPTs.length === 0) {
      return NextResponse.json({ error: 'No GPTs enabled for processing' }, { status: 400 })
    }

    // Process each custom GPT sequentially in the order they appear
    const results: Record<string, string> = {}
    let previousContext = ''

    for (let i = 0; i < enabledGPTs.length; i++) {
      const gpt = enabledGPTs[i]
      
      // Special handling for GPT 5 - provide ALL previous GPT outputs
      let contextForThisGPT = ''
      if (i === 4 && enabledGPTs.length >= 5) { // This is GPT 5 (index 4)
        // Provide complete outputs from GPTs 1-4
        const previousGPTOutputs = Object.entries(results)
          .map(([key, value]) => {
            const gptName = enabledGPTs.find(g => `gpt${g.id}` === key)?.name || key
            return `--- ${gptName} Complete Analysis ---\n${value}`
          })
          .join('\n\n')
        contextForThisGPT = previousGPTOutputs ? `COMPLETE ANALYSIS FROM PREVIOUS GPTs:\n\n${previousGPTOutputs}\n\n` : ''
      } else {
        contextForThisGPT = previousContext ? `PREVIOUS ANALYSIS FROM OTHER GPTs:\n${previousContext}\n\n` : ''
      }
      
      // Create detailed prompt that explicitly references prospect information
      let userPrompt = `PROSPECT INFORMATION:
- Name: ${prospectData.firstName} ${prospectData.lastName}
- Company: ${prospectData.company}
- Title: ${prospectData.title || 'Not specified'}
- Email: ${prospectData.email || 'Not specified'}

${contextForThisGPT}`
      
      // Special instructions for GPT #1 (Prospect Research)
      if (gpt.id === '1') {
        userPrompt += `
CRITICAL INSTRUCTIONS FOR PROSPECT RESEARCH:
1. You MUST follow the EXACT 9-section structure from your system prompt
2. Use the comprehensive web research data to populate each numbered section
3. ALWAYS reference ${prospectData.firstName} ${prospectData.lastName} and ${prospectData.company} by name in every section
4. Include specific discovery questions using MEDDPIC, BANT, and Sandler frameworks
5. Focus on PortSwigger/Burp Suite positioning throughout all sections

REQUIRED OUTPUT: Create a comprehensive structured report with sections 1-9 as specified in your system prompt, using the extensive web research data provided above.`
      } else {
        userPrompt += `
CRITICAL INSTRUCTIONS:
1. You must ALWAYS reference the prospect by name (${prospectData.firstName} ${prospectData.lastName}) and their company (${prospectData.company}) throughout your analysis
2. DO NOT repeat what other GPTs have already covered - provide YOUR unique specialized perspective
3. Focus ONLY on your specific role and expertise area
4. Provide distinctly different insights from other GPT analyses

SPECIALIZED TASK FOR YOUR ROLE:
Based on YOUR specific expertise and role (as defined in your system prompt), analyze ${prospectData.firstName} ${prospectData.lastName} from ${prospectData.company}. 

Provide analysis that is:
- Unique to YOUR specialized role and perspective
- Different from what other GPTs would cover
- Focused on your area of expertise
- Specific to ${prospectData.firstName} ${prospectData.lastName} at ${prospectData.company}

Always use ${prospectData.firstName} ${prospectData.lastName} and ${prospectData.company} by name in your response, not generic references.`
      }
      
      // Enhanced web search for each specialized GPT
      let gptSpecificContext = ''
      
      if (gpt.id === '1') {
        // Enhanced prospect research for GPT #1
        console.log('Performing enhanced prospect research...')
        const prospectQueries = generateProspectResearchQueries(prospectData)
        let prospectSearchResults = ''
        
        try {
          // Perform more comprehensive searches for prospect research - increased from 6 to 15 queries
          for (const query of prospectQueries.slice(0, 15)) {
            const searchResults = await performWebSearch(query, 8)
            if (searchResults) {
              prospectSearchResults += searchResults + '\n'
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
          if (prospectSearchResults) {
            gptSpecificContext = `\n\nDETAILED PROSPECT RESEARCH DATA:\n${prospectSearchResults}\n\nGeneral context:\n${webSearchContext}\n\nCRITICAL: You MUST follow the exact structured format in your system prompt with numbered sections 1-9. Use this comprehensive web research data to populate each section with specific, factual information about ${prospectData.firstName} ${prospectData.lastName} and ${prospectData.company}. Include discovery questions using MEDDPIC, BANT, and Sandler methodologies. Focus on PortSwigger/Burp Suite positioning throughout all sections.`
          } else {
            gptSpecificContext = `\n\nGENERAL RESEARCH CONTEXT:\n${webSearchContext}\n\nIMPORTANT: Create detailed prospect and company research reports for sales targeting.`
          }
        } catch (error) {
          console.error('Prospect research failed:', error)
          gptSpecificContext = `\n\nGENERAL CONTEXT:\n${webSearchContext}\n\nIMPORTANT: Focus on comprehensive prospect and company research.`
        }
      } else if (gpt.id === '2') {
        // Enhanced tech stack research for GPT #2
        console.log('Performing enhanced tech stack research...')
        const techQueries = generateTechStackQueries(prospectData)
        let techSearchResults = ''
        
        try {
          // Increased tech stack research - from 3 to 6 queries with more results per query
          for (const query of techQueries.slice(0, 6)) {
            const searchResults = await performWebSearch(query, 6)
            if (searchResults) {
              techSearchResults += searchResults + '\n'
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
          if (techSearchResults) {
            gptSpecificContext = `\n\nTECHNOLOGY STACK RESEARCH DATA:\n${techSearchResults}\n\nGeneral context:\n${webSearchContext}\n\nIMPORTANT: Use this research to identify ${prospectData.company}'s technology stack, security tools, development frameworks, and infrastructure. Focus on finding opportunities for PortSwigger's application security solutions.`
          } else {
            gptSpecificContext = `\n\nGENERAL CONTEXT:\n${webSearchContext}\n\nIMPORTANT: Research and identify ${prospectData.company}'s technology stack and security tools.`
          }
        } catch (error) {
          console.error('Tech stack research failed:', error)
          gptSpecificContext = `\n\nGENERAL CONTEXT:\n${webSearchContext}\n\nIMPORTANT: Focus on technology stack and security tool research.`
        }
      } else if (gpt.id === '3') {
        // Enhanced organizational mapping for GPT #3
        console.log('Performing enhanced organizational mapping research...')
        const orgQueries = generateOrgMappingQueries(prospectData)
        let orgSearchResults = ''
        
        try {
          // Perform more comprehensive searches for organizational mapping - increased from 5 to 10 queries
          for (const query of orgQueries.slice(0, 10)) {
            const searchResults = await performWebSearch(query, 7)
            if (searchResults) {
              orgSearchResults += searchResults + '\n'
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
          if (orgSearchResults) {
            gptSpecificContext = `\n\nORGANIZATIONAL RESEARCH DATA:\n${orgSearchResults}\n\nGeneral context:\n${webSearchContext}\n\nIMPORTANT: Use this organizational research to create comprehensive organizational charts and detailed director research for ${prospectData.company}. For each executive and director, include: full name, title, background, tenure, previous experience, education, and reporting relationships. Map the complete leadership hierarchy including C-suite, VPs, directors, and department heads. Identify decision-making processes and influence networks.`
          } else {
            gptSpecificContext = `\n\nGENERAL CONTEXT:\n${webSearchContext}\n\nIMPORTANT: Create organizational charts for ${prospectData.company} using available information.`
          }
        } catch (error) {
          console.error('Organizational research failed:', error)
          gptSpecificContext = `\n\nGENERAL CONTEXT:\n${webSearchContext}\n\nIMPORTANT: Focus on organizational mapping and leadership structure.`
        }
      } else {
        // Standard context for other GPTs
        gptSpecificContext = webSearchContext 
          ? `\n\nSUPPLEMENTARY CONTEXT:\n${webSearchContext}\n\nIMPORTANT: Focus on your specific role and provide unique analysis.`
          : `\n\nIMPORTANT: Focus on your specific role and provide analysis based on your expertise.`
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: gpt.prompt + gptSpecificContext
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.5,
      })

      const content = response.choices[0]?.message?.content || ''
      results[`gpt${gpt.id}`] = content
      
      // Add this response to the context for next GPT with clear labeling
      previousContext += `\n\n--- ${gpt.name} (Step ${i + 1}) Analysis ---\n${content}`
    }

    // Generate comprehensive sales plan summary using all GPT outputs
    const allGPTOutputs = Object.entries(results)
      .map(([key, value]) => {
        const gptName = enabledGPTs.find(g => `gpt${g.id}` === key)?.name || key
        return `${gptName}:\n${value}`
      })
      .join('\n\n')

    const salesPlanResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an executive sales strategist for PortSwigger, the company behind Burp Suite and other leading application security tools. Synthesize all research and analysis into a comprehensive enterprise sales plan specifically for selling PortSwigger's application security solutions to this prospect and their company. 

PORTSWIGGER PRODUCTS TO CONSIDER:
- Burp Suite Enterprise Edition (web application security testing)
- Burp Suite Professional (manual security testing)  
- Web Security Academy (security training)
- Application security consulting services

INTEGRATION POINTS:
- Use LinkedIn research to personalize approach to the individual
- Use prospect research to understand company background and pain points
- Use tech stack research to identify specific security gaps and integration opportunities
- Use organizational mapping to identify key stakeholders and decision-making process

Consider current market conditions, regulatory requirements, and industry trends affecting application security.${webSearchContext ? `\n\nCURRENT WEB INTELLIGENCE:\n${webSearchContext}\n\nIMPORTANT: Reference specific, current information from the web search results in your synthesis.` : ''}`
        },
        {
          role: "user",
          content: `Create a comprehensive PortSwigger enterprise sales plan by synthesizing all research data for ${prospectData.firstName} ${prospectData.lastName} at ${prospectData.company}.

RESEARCH DATA TO INTEGRATE:
${allGPTOutputs}

LINKEDIN PROFILE INSIGHTS: Reference the prospect's career background, education, and professional experience from the LinkedIn research.

Create a comprehensive PortSwigger sales plan with:

1. EXECUTIVE SUMMARY
   - Opportunity assessment for ${prospectData.firstName} ${prospectData.lastName} at ${prospectData.company}
   - Key insights from prospect research, tech stack analysis, and organizational mapping
   - PortSwigger solution fit and revenue potential

2. PERSONALIZED APPROACH STRATEGY
   - Personal connection points based on ${prospectData.firstName}'s background and interests
   - Role-specific pain points and responsibilities as ${prospectData.title}
   - Career trajectory insights for relationship building

3. TECHNICAL INTEGRATION OPPORTUNITIES  
   - Specific PortSwigger products that align with ${prospectData.company}'s tech stack
   - Security gaps identified in their current tools and processes
   - Integration points with their development and DevOps workflows

4. ORGANIZATIONAL STAKEHOLDER MAPPING
   - Key decision-makers and influencers in the security/development organization
   - Reporting relationships and approval processes
   - Multi-threading strategy for reaching all stakeholders

5. VALUE PROPOSITIONS & ROI JUSTIFICATION
   - Business impact of application security improvements
   - Cost savings from early vulnerability detection
   - Compliance and regulatory benefits

6. ENGAGEMENT STRATEGY & NEXT STEPS
   - Specific talking points for initial outreach to ${prospectData.firstName}
   - Meeting agenda and demo recommendations
   - Follow-up sequence and stakeholder expansion plan

7. OBJECTION HANDLING & SUCCESS PROBABILITY
   - Anticipated objections and prepared responses
   - Competitive positioning against existing tools
   - Deal probability assessment and timeline

Always reference ${prospectData.firstName} ${prospectData.lastName} and ${prospectData.company} specifically throughout your recommendations.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return NextResponse.json({
      ...results,
      salesPlan: salesPlanResponse.choices[0]?.message?.content,
    })
  } catch (error) {
    console.error('Error processing prospect:', error)
    return NextResponse.json(
      { error: 'Failed to process prospect data' },
      { status: 500 }
    )
  }
}