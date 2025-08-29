interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
}

interface TavilyResponse {
  results: TavilySearchResult[]
  query: string
  follow_up_questions?: string[]
  answer?: string
  response_time?: number
}

export async function performWebSearch(query: string, maxResults: number = 5): Promise<string> {
  const tavilyApiKey = process.env.TAVILY_API_KEY
  
  if (!tavilyApiKey) {
    console.log('Tavily API key not configured, skipping web search')
    return ''
  }

  try {
    console.log(`Performing web search for: ${query}`)
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: query,
        search_depth: 'basic',
        include_images: false,
        include_answer: true,
        max_results: maxResults
      })
    })

    if (!response.ok) {
      console.error(`Tavily API error: ${response.status}`)
      return ''
    }

    const data: TavilyResponse = await response.json()
    
    if (!data.results || data.results.length === 0) {
      console.log('No search results found')
      return ''
    }

    // Format search results into context string
    let searchContext = `Current web search results for "${query}":\n\n`
    
    data.results.forEach((result, index) => {
      searchContext += `${index + 1}. ${result.title}\n`
      searchContext += `   ${result.url}\n`
      searchContext += `   ${result.content.substring(0, 300)}...\n\n`
    })

    // Include Tavily's AI answer if available
    if (data.answer) {
      searchContext += `Key insights: ${data.answer}\n\n`
    }

    console.log(`Web search completed, found ${data.results.length} results`)
    return searchContext

  } catch (error) {
    console.error('Web search error:', error)
    return ''
  }
}

export function generateSearchQueries(prospectData: { firstName: string, lastName: string, company: string, title?: string }): string[] {
  const queries = [
    `${prospectData.firstName} ${prospectData.lastName} ${prospectData.company}`,
    `${prospectData.company} recent news 2024 2025`,
    `${prospectData.company} industry trends challenges`,
  ]

  if (prospectData.title) {
    queries.push(`${prospectData.title} ${prospectData.company} responsibilities challenges`)
  }

  return queries
}

export function generateProspectResearchQueries(prospectData: { firstName: string, lastName: string, company: string, title?: string }): string[] {
  const companyDomain = prospectData.company.toLowerCase().replace(/[^a-z0-9]/g, '')
  const queries = [
    // 1. Company Overview Research (Enhanced)
    `${prospectData.company} founded headquarters employees revenue size type industry`,
    `${prospectData.company} business model services products customer base target market`,
    `${prospectData.company} "about us" company overview corporate information mission`,
    `${prospectData.company} annual report financial statements investor relations`,
    `${prospectData.company} company profile crunchbase linkedin company page`,
    
    // 2. Security Certifications & Compliance (Enhanced)
    `${prospectData.company} security certifications SOC ISO 27001 PCI DSS compliance attestation`,
    `site:${companyDomain}.com security trust compliance certifications framework`,
    `${prospectData.company} regulatory compliance standards GDPR HIPAA FedRAMP requirements`,
    `"${prospectData.company}" audit report security assessment penetration testing`,
    `${prospectData.company} trust center security whitepaper compliance documentation`,
    
    // 3. Security Incidents & Vulnerabilities (Enhanced) 
    `"${prospectData.company}" security incident breach CVE vulnerability exploit disclosure`,
    `${prospectData.company} data breach security incident hack cyber attack ransomware`,
    `${prospectData.company} vulnerability disclosure security advisory patch update`,
    `site:cve.mitre.org "${prospectData.company}" vulnerability database`,
    
    // 4. Technical Hiring & Job Openings (Enhanced)
    `${prospectData.company} careers jobs security engineer DevOps AppSec cybersecurity site:linkedin.com`,
    `site:${companyDomain}.com careers security engineering software developer jobs`,
    `${prospectData.company} job openings developer security architect technical roles`,
    `"${prospectData.company}" hiring security team application security positions`,
    
    // 5. Trigger Events & Recent News (Enhanced)
    `"${prospectData.company}" recent news announcements 2024 2025 funding acquisition merger`,
    `${prospectData.company} regulatory filing SEC disclosure compliance update 10-K 10-Q`,
    `${prospectData.company} product launch digital transformation technology initiative expansion`,
    `"${prospectData.company}" executive hire leadership change C-suite appointment`,
    `${prospectData.company} press release partnership acquisition investment round`,
    
    // 6. Personal Research (Enhanced)
    `"${prospectData.firstName} ${prospectData.lastName}" ${prospectData.company} LinkedIn profile career background`,
    `${prospectData.firstName} ${prospectData.lastName} ${prospectData.company} interview presentation conference speaking`,
    `"${prospectData.firstName} ${prospectData.lastName}" education university degree certification`,
    `${prospectData.firstName} ${prospectData.lastName} previous companies career history experience`,
    
    // 7. Industry Context & Risk Analysis (Enhanced)
    `${prospectData.company} industry analysis market position competitive landscape threats`,
    `${prospectData.company} financial performance revenue growth annual report earnings`,
    `${prospectData.company} regulatory requirements compliance risk industry specific`,
    `${prospectData.company} application security risk web application vulnerabilities industry`
  ]

  if (prospectData.title) {
    queries.push(`${prospectData.company} ${prospectData.title} responsibilities decision authority budget`)
    queries.push(`"${prospectData.firstName} ${prospectData.lastName}" ${prospectData.title} leadership management`)
  }

  return queries
}

export function generateTechStackQueries(prospectData: { firstName: string, lastName: string, company: string, title?: string }): string[] {
  const queries = [
    `${prospectData.company} technology stack development tools programming languages`,
    `${prospectData.company} security tools vulnerability management application security`,
    `${prospectData.company} DevOps CI/CD pipeline infrastructure cloud provider`,
    `${prospectData.company} software development framework testing tools databases`,
    `${prospectData.company} API security OWASP penetration testing security scanning`,
    `${prospectData.company} tech stack engineering blog github repositories`,
  ]

  return queries
}

export function generateOrgMappingQueries(prospectData: { firstName: string, lastName: string, company: string, title?: string }): string[] {
  const queries = [
    `${prospectData.company} CEO president executive leadership team`,
    `${prospectData.company} CTO CIO CISO technology leadership directors`,
    `${prospectData.company} board of directors senior management executives`,
    `${prospectData.company} organizational chart management structure hierarchy`,
    `${prospectData.company} vice president VP director leadership team`,
    `${prospectData.company} executive team management bios backgrounds`,
    `${prospectData.company} senior directors department heads leadership`,
    `${prospectData.company} management team LinkedIn executive profiles`,
    `"${prospectData.company}" leadership directory executive bios`,
    `${prospectData.company} annual report executive team management`,
  ]

  if (prospectData.title) {
    queries.push(`${prospectData.company} ${prospectData.title} leadership team reporting structure`)
    queries.push(`${prospectData.company} ${prospectData.title} director manager executives`)
  }

  return queries
}