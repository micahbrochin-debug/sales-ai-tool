'use client'

import { useState, useEffect } from 'react'
import { Search, User, Building, Mail, Briefcase, Settings, MessageCircle, Loader2, Plus, Trash2, Bot, Globe, Download, Minimize2, Maximize2, ChevronUp, ChevronDown, Camera, Upload } from 'lucide-react'

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

interface GPTResults {
  [key: string]: string
  salesPlan?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [prospectData, setProspectData] = useState<ProspectData>({
    firstName: '',
    lastName: '',
    company: '',
    title: '',
    email: ''
  })
  const [openaiToken, setOpenaiToken] = useState('')
  const [chatGptConnected, setChatGptConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<GPTResults>({})
  const [showResults, setShowResults] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [customGPTs, setCustomGPTs] = useState<CustomGPT[]>([])
  const [showGPTConfig, setShowGPTConfig] = useState(false)
  const [gptConfigMinimized, setGptConfigMinimized] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState('https://www.linkedin.com')
  const [showLinkedInBrowser, setShowLinkedInBrowser] = useState(false)
  const [linkedinData, setLinkedinData] = useState<any>(null)
  const [showLinkedinData, setShowLinkedinData] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [linkedinWindow, setLinkedinWindow] = useState<Window | null>(null)
  const [isLinkedinConnected, setIsLinkedinConnected] = useState(false)
  const [expandedGPTs, setExpandedGPTs] = useState<{ [key: string]: boolean }>({})
  const [allGPTsExpanded, setAllGPTsExpanded] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('chatgpt-token')
    const savedGPTs = localStorage.getItem('custom-gpts')
    
    if (savedToken) {
      setOpenaiToken(savedToken)
      setChatGptConnected(true)
    }
    
    if (savedGPTs) {
      setCustomGPTs(JSON.parse(savedGPTs))
    } else {
      // Set default GPTs if none saved
      const defaultGPTs = [
        {
          id: '1',
          name: 'Prospect Research',
          prompt: `You are an expert prospect research analyst specializing in comprehensive intelligence gathering for application security sales targeting. Using extensive web research, compile detailed structured reports with the following sections:

**REQUIRED OUTPUT STRUCTURE:**

**1. Company Overview**
- Founded year, headquarters, employee count, revenue size
- Business model, primary services/products, customer base
- Industry classification and market position
- Recent corporate developments and growth initiatives

**2. Publicly Disclosed Security Certifications & Attestations**
- SOC 1/2 Type II, ISO 27001, PCI DSS, FedRAMP compliance status
- GDPR, HIPAA, or other regulatory compliance requirements
- Security frameworks and standards implemented
- Audit reports or compliance documentation found

**3. Public Security Incidents, Vulnerabilities, Breaches or CVEs**
- Historical security incidents or data breaches
- CVE vulnerabilities associated with their products/infrastructure
- Public security disclosures or incident response
- Regulatory filings related to security issues

**4. Current Hiring Activity – Technical Roles**
- Open positions for security engineers, DevOps, AppSec professionals
- Development team expansion indicators
- Technical job requirements and skill sets sought
- Engineering team growth patterns

**5. Trigger Events**
- Recent funding rounds, acquisitions, or IPO activity
- New product launches or digital transformation initiatives
- Regulatory changes affecting their industry
- Recent executive hires in technology or security roles

**6. Why They'd Be Interested in Burp Suite DAST**
- Specific application security gaps identified
- Development practices that would benefit from DAST
- Regulatory or compliance drivers requiring security testing
- Technical debt or legacy system vulnerabilities

**7. Industry-Specific Risk Without DAST**
- Sector-specific security threats and attack vectors
- Regulatory penalties for security failures in their industry
- Competitive risks from security incidents
- Customer trust and reputation impacts

**8. The 3 Whys**
- Why do they need application security testing?
- Why do they need it now?
- Why should they choose PortSwigger's solutions?

**9. Discovery Questions (MEDDPIC, BANT, Sandler)**
- Metrics: How do you currently measure application security?
- Economic buyer: Who makes security tooling decisions?
- Decision criteria: What factors drive security tool selection?
- Decision process: What's your security tool evaluation process?
- Paper process: What procurement/approval steps are required?
- Implicate the pain: What happens if vulnerabilities go undetected?
- Champion: Who would advocate for improved security testing?

**CRITICAL INSTRUCTIONS:**
- Always reference the prospect by name and company throughout
- Use specific, factual information found through web research
- Provide actionable sales intelligence in each section
- Focus on PortSwigger/Burp Suite application security positioning
- Include relevant URLs and sources when possible`,
          enabled: true
        },
        {
          id: '2',
          name: 'Tech Stack Research',
          prompt: 'You are a thorough tech stack researcher that dives deep into web research to discover what tools and technologies companies use for software development and security. Research and identify: development frameworks, programming languages, security tools, infrastructure platforms, DevOps pipelines, testing tools, monitoring solutions, cloud providers, databases, APIs, third-party integrations, and security stack components. Focus on finding specific technology implementations that could relate to application security, vulnerability management, and development workflows.',
          enabled: true
        },
        {
          id: '3',
          name: 'Account Mapping',
          prompt: 'You are an in-depth web researcher that creates comprehensive organizational charts and director research for prospective companies. Research and map the complete organizational structure including: executive leadership team, board of directors, C-suite executives, VPs, directors, department heads, and key personnel. For each leader, provide: full name, title, background, tenure, previous companies, education, and reporting relationships. Create detailed organizational insights showing reporting hierarchies, decision-making processes, and influence networks. Include director-level research with personal and professional backgrounds. Always reference the specific prospect and their position within this organizational context.',
          enabled: true
        },
        {
          id: '4',
          name: 'Strategy GPT',
          prompt: 'You are a strategic sales consultant. Using the prospect information and all previous analysis, develop a personalized sales approach specifically for this individual at their company. Create tailored value propositions, conversation starters that reference their background, industry-specific positioning, objection handling based on their role, and specific next steps. Always personalize recommendations to this prospect\'s name, title, and company.',
          enabled: true
        }
      ]
      setCustomGPTs(defaultGPTs)
      localStorage.setItem('custom-gpts', JSON.stringify(defaultGPTs))
    }
  }, [])

  // Save tokens to localStorage when they change
  useEffect(() => {
    if (openaiToken) {
      localStorage.setItem('chatgpt-token', openaiToken)
    }
  }, [openaiToken])


  // Save GPTs to localStorage when they change
  useEffect(() => {
    if (customGPTs.length > 0) {
      localStorage.setItem('custom-gpts', JSON.stringify(customGPTs))
    }
  }, [customGPTs])

  const handleInputChange = (field: keyof ProspectData, value: string) => {
    setProspectData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleConnectChatGPT = () => {
    if (openaiToken.trim()) {
      setChatGptConnected(true)
    } else {
      alert('Please enter your ChatGPT API token first')
    }
  }

  const addCustomGPT = () => {
    const newGPT: CustomGPT = {
      id: Date.now().toString(),
      name: 'New GPT',
      prompt: 'Enter your custom GPT prompt here...',
      enabled: true
    }
    setCustomGPTs(prev => [...prev, newGPT])
  }

  const updateCustomGPT = (id: string, updates: Partial<CustomGPT>) => {
    setCustomGPTs(prev => prev.map(gpt => 
      gpt.id === id ? { ...gpt, ...updates } : gpt
    ))
  }

  const removeCustomGPT = (id: string) => {
    setCustomGPTs(prev => prev.filter(gpt => gpt.id !== id))
  }

  const collectLinkedInData = async () => {
    try {
      setIsLoading(true)
      
      // This would normally extract data from the current LinkedIn page
      // For demo purposes, we'll simulate extracting data
      const response = await fetch('/api/linkedin-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: linkedinUrl
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Store the LinkedIn data for review
        setLinkedinData(data)
        setShowLinkedinData(true)
        
        // Auto-populate the prospect form with LinkedIn data
        setProspectData(prev => ({
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          company: data.company || prev.company,
          title: data.title || prev.title,
          email: data.email || prev.email
        }))
        
        alert('LinkedIn data collected successfully! Review the extracted data below.')
      } else {
        alert('Could not extract data from LinkedIn page')
        setLinkedinData({ success: false, error: data.error })
        setShowLinkedinData(true)
      }
    } catch (error) {
      console.error('Error collecting LinkedIn data:', error)
      alert('Error collecting LinkedIn data')
    } finally {
      setIsLoading(false)
    }
  }

  const openLinkedInBrowser = () => {
    // Open LinkedIn in a popup window with specific dimensions
    const width = 1200
    const height = 800
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    const popup = window.open(
      'https://www.linkedin.com',
      'linkedinBrowser',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=yes,location=yes`
    )

    if (popup) {
      setLinkedinWindow(popup)
      setIsLinkedinConnected(true)
      
      // Monitor when the popup is closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          setLinkedinWindow(null)
          setIsLinkedinConnected(false)
          clearInterval(checkClosed)
        }
      }, 1000)

      // Focus on the popup
      popup.focus()
    } else {
      alert('Please allow popups for this site to access LinkedIn')
    }
  }

  const navigateToProfile = (url: string) => {
    if (linkedinWindow && !linkedinWindow.closed) {
      linkedinWindow.location.href = url
      linkedinWindow.focus()
    } else {
      openLinkedInBrowser()
      // Wait a moment for the window to open, then navigate
      setTimeout(() => {
        if (linkedinWindow && !linkedinWindow.closed) {
          linkedinWindow.location.href = url
        }
      }, 1000)
    }
  }

  const closeLinkedInBrowser = () => {
    if (linkedinWindow && !linkedinWindow.closed) {
      linkedinWindow.close()
    }
    setLinkedinWindow(null)
    setIsLinkedinConnected(false)
  }

  const toggleGPTExpansion = (gptId: string) => {
    setExpandedGPTs(prev => ({
      ...prev,
      [gptId]: !prev[gptId]
    }))
  }

  const toggleAllGPTs = () => {
    const newExpandedState = !allGPTsExpanded
    setAllGPTsExpanded(newExpandedState)
    
    // Set all GPTs to the new state
    const newExpandedGPTs: { [key: string]: boolean } = {}
    customGPTs.forEach(gpt => {
      newExpandedGPTs[`gpt${gpt.id}`] = newExpandedState
    })
    newExpandedGPTs['salesPlan'] = newExpandedState
    setExpandedGPTs(newExpandedGPTs)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const processLinkedInScreenshot = async () => {
    if (!selectedImage || !openaiToken) {
      alert('Please select a file (image or PDF) and ensure ChatGPT token is configured')
      return
    }

    setIsProcessingOCR(true)
    
    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('openaiToken', openaiToken)

      const response = await fetch('/api/linkedin-ocr', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        // Store the LinkedIn data for review
        setLinkedinData(data)
        setShowLinkedinData(true)
        
        // Auto-populate the prospect form with OCR data
        setProspectData(prev => ({
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          company: data.company || prev.company,
          title: data.title || prev.title,
          email: data.email || prev.email
        }))
        
        alert('LinkedIn screenshot processed successfully! Review the extracted data below.')
      } else {
        alert(`Failed to process screenshot: ${data.error}`)
        setLinkedinData({ success: false, error: data.error })
        setShowLinkedinData(true)
      }
    } catch (error) {
      console.error('Error processing screenshot:', error)
      alert('Error processing LinkedIn screenshot')
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const handleSubmit = async () => {
    if (!prospectData.firstName || !prospectData.lastName || !prospectData.company) {
      alert('Please fill in at least first name, last name, and company')
      return
    }

    setIsLoading(true)
    
    try {
      // Process with custom GPTs
      const response = await fetch('/api/process-prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospectData,
          openaiToken,
          customGPTs
        })
      })

      const data = await response.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Error processing prospect:', error)
      alert('Error processing prospect data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !openaiToken) return

    const currentMessage = chatInput.trim()
    setChatInput('')
    setIsChatLoading(true)

    // Add user message to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: currentMessage }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          openaiToken,
          context: results,
          chatHistory: chatHistory
        })
      })

      const data = await response.json()
      
      // Add assistant response to chat history
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }])
      setIsChatLoading(false)
    } catch (error) {
      console.error('Error with chat:', error)
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your message. Please try again.' }])
      setIsChatLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (showResults) {
        handleChatSubmit()
      } else {
        handleSubmit()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-4" style={{background: 'linear-gradient(135deg, #000b4f 0%, #001a66 50%, #003d7a 100%)'}}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border" style={{borderColor: '#007a8a'}}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Sales Intelligence App</h1>
            <p className="text-slate-300">AI-powered prospect research and sales planning</p>
          </div>

          {!showResults ? (
            <>
              {/* Settings Section */}
              <div className="bg-slate-700 rounded-lg p-6 mb-8 border border-slate-600">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="mr-2 text-[#ff6633]" size={20} />
                  Configuration
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      OpenAI API Token (GPT-4o)
                    </label>
                    <input
                      type="password"
                      value={openaiToken}
                      onChange={(e) => setOpenaiToken(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#ff6633] focus:border-[#ff6633]"
                      placeholder="sk-..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleConnectChatGPT}
                      disabled={!openaiToken.trim()}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        chatGptConnected 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#ff6633] text-white hover:bg-[#e55a2d] disabled:bg-slate-600 disabled:text-slate-400'
                      }`}
                    >
                      {chatGptConnected ? '✓ GPT-4o Connected' : 'Connect GPT-4o'}
                    </button>
                    
                    {chatGptConnected && (
                      <button
                        onClick={() => setShowGPTConfig(!showGPTConfig)}
                        className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 text-sm font-medium transition-colors flex items-center"
                      >
                        <Bot className="mr-2" size={16} />
                        Configure GPTs
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom GPT Configuration */}
              {showGPTConfig && chatGptConnected && (
                <div className="bg-slate-700 rounded-lg p-6 mb-8 border border-slate-600">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <Bot className="mr-2 text-[#ff6633]" size={20} />
                      Custom GPT Configuration
                      <span className="text-slate-400 text-sm ml-2">({customGPTs.filter(g => g.enabled).length} enabled)</span>
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setGptConfigMinimized(!gptConfigMinimized)}
                        className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors flex items-center"
                        title={gptConfigMinimized ? "Expand configuration" : "Minimize configuration"}
                      >
                        {gptConfigMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        {gptConfigMinimized ? 'Expand' : 'Minimize'}
                      </button>
                      <button
                        onClick={addCustomGPT}
                        className="px-3 py-2 bg-[#ff6633] text-white rounded-md hover:bg-[#e55a2d] text-sm font-medium flex items-center"
                      >
                        <Plus className="mr-1" size={16} />
                        Add GPT
                      </button>
                    </div>
                  </div>
                  
                  {!gptConfigMinimized && (
                    <>
                      {/* GPT Order Info */}
                      <div className="bg-slate-600 rounded-lg p-3 mb-4 border border-slate-500">
                        <p className="text-slate-200 text-sm mb-2">
                          <strong>Execution Order:</strong> GPTs will run in the order displayed below. Each GPT receives the prospect information and builds on previous GPT results.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {customGPTs.filter(gpt => gpt.enabled).map((gpt, index) => (
                            <span key={gpt.id} className="px-2 py-1 bg-[#ff6633] text-white rounded text-xs">
                              {index + 1}. {gpt.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {customGPTs.map((gpt, index) => (
                          <div key={gpt.id} className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[#ff6633] text-sm font-medium">#{index + 1}</span>
                                  <input
                                    type="checkbox"
                                    checked={gpt.enabled}
                                    onChange={(e) => updateCustomGPT(gpt.id, { enabled: e.target.checked })}
                                    className="w-4 h-4 text-[#ff6633] bg-slate-700 border-slate-500 rounded focus:ring-[#ff6633]"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={gpt.name}
                                  onChange={(e) => updateCustomGPT(gpt.id, { name: e.target.value })}
                                  className="bg-slate-500 border border-slate-400 text-white px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#ff6633]"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                {/* Move up/down buttons for reordering */}
                                {index > 0 && (
                                  <button
                                    onClick={() => {
                                      const newGPTs = [...customGPTs]
                                      const temp = newGPTs[index]
                                      newGPTs[index] = newGPTs[index - 1]
                                      newGPTs[index - 1] = temp
                                      setCustomGPTs(newGPTs)
                                    }}
                                    className="text-slate-400 hover:text-white p-1"
                                    title="Move up"
                                  >
                                    <ChevronUp size={14} />
                                  </button>
                                )}
                                {index < customGPTs.length - 1 && (
                                  <button
                                    onClick={() => {
                                      const newGPTs = [...customGPTs]
                                      const temp = newGPTs[index]
                                      newGPTs[index] = newGPTs[index + 1]
                                      newGPTs[index + 1] = temp
                                      setCustomGPTs(newGPTs)
                                    }}
                                    className="text-slate-400 hover:text-white p-1"
                                    title="Move down"
                                  >
                                    <ChevronDown size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => removeCustomGPT(gpt.id)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title="Delete GPT"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="mb-2">
                              <label className="block text-slate-300 text-xs mb-1">
                                GPT Instructions (will receive prospect: {prospectData.firstName || '[First Name]'} {prospectData.lastName || '[Last Name]'} from {prospectData.company || '[Company]'})
                              </label>
                              <textarea
                                value={gpt.prompt}
                                onChange={(e) => updateCustomGPT(gpt.id, { prompt: e.target.value })}
                                className="w-full bg-slate-500 border border-slate-400 text-white px-3 py-2 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#ff6633]"
                                rows={4}
                                placeholder="Enter your custom GPT prompt here. This GPT will receive the prospect information (name, company, title, email) and any previous GPT analysis..."
                              />
                            </div>
                            <div className="text-xs text-slate-400">
                              Status: {gpt.enabled ? <span className="text-green-400">Enabled</span> : <span className="text-red-400">Disabled</span>} | 
                              Order: {gpt.enabled ? customGPTs.filter((g, i) => g.enabled && i <= index).length : 'Not in sequence'}
                            </div>
                          </div>
                        ))}
                        
                        {customGPTs.length === 0 && (
                          <div className="bg-slate-600 rounded-lg p-6 text-center border border-slate-500">
                            <Bot className="mx-auto text-slate-400 mb-3" size={32} />
                            <p className="text-slate-300 mb-3">No custom GPTs configured yet</p>
                            <button
                              onClick={addCustomGPT}
                              className="px-4 py-2 bg-[#ff6633] text-white rounded-md hover:bg-[#e55a2d] text-sm font-medium"
                            >
                              Add Your First GPT
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {gptConfigMinimized && (
                    <div className="text-center py-2">
                      <p className="text-slate-400 text-sm">
                        Configuration minimized - {customGPTs.filter(g => g.enabled).length} GPTs ready to run
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn Browser Section */}
              <div className="bg-slate-700 rounded-lg p-6 mb-8 border border-slate-600">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <Globe className="mr-2 text-[#ff6633]" size={20} />
                    LinkedIn Research
                    {isLinkedinConnected && (
                      <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        Connected
                      </span>
                    )}
                  </h2>
                  <div className="flex space-x-2">
                    {!isLinkedinConnected ? (
                      <button
                        onClick={openLinkedInBrowser}
                        className="px-4 py-2 bg-[#ff6633] text-white rounded-md hover:bg-[#e55a2d] text-sm font-medium transition-colors flex items-center"
                      >
                        <Globe className="mr-2" size={16} />
                        Open LinkedIn
                      </button>
                    ) : (
                      <button
                        onClick={closeLinkedInBrowser}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                      >
                        Close LinkedIn
                      </button>
                    )}
                    <button
                      onClick={() => setShowLinkedInBrowser(!showLinkedInBrowser)}
                      className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 text-sm font-medium transition-colors"
                    >
                      {showLinkedInBrowser ? 'Hide Controls' : 'Show Controls'}
                    </button>
                  </div>
                </div>

                {showLinkedInBrowser && (
                  <div className="space-y-4">
                    {/* LinkedIn Browser Status */}
                    <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">LinkedIn Browser Status</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isLinkedinConnected 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {isLinkedinConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">
                        {isLinkedinConnected 
                          ? 'LinkedIn is open in a popup window. Navigate to profiles and copy URLs below.'
                          : 'Click "Open LinkedIn" above to start browsing LinkedIn profiles.'
                        }
                      </p>
                      
                      {/* Navigation Controls */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#ff6633] focus:border-[#ff6633]"
                          placeholder="https://www.linkedin.com/in/prospect-name"
                        />
                        <button
                          onClick={() => navigateToProfile(linkedinUrl)}
                          disabled={!isLinkedinConnected}
                          className="px-4 py-2 bg-[#000b4f] text-white rounded-md hover:bg-[#000940] disabled:bg-slate-600 disabled:text-slate-400 text-sm font-medium transition-colors"
                        >
                          Navigate
                        </button>
                        <button
                          onClick={collectLinkedInData}
                          disabled={isLoading}
                          className="px-4 py-2 bg-[#ff6633] text-white rounded-md hover:bg-[#e55a2d] disabled:bg-slate-600 disabled:text-slate-400 text-sm font-medium transition-colors flex items-center"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin mr-2" size={16} />
                              Collecting...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2" size={16} />
                              Extract
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Data Extraction Options */}
                    <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">Data Extraction Methods</h4>
                        <p className="text-slate-300 text-sm">
                          Choose your preferred method to extract LinkedIn profile data:
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Integrated Browser */}
                        <div className="bg-slate-700 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2 flex items-center">
                            <Globe className="mr-2" size={16} />
                            Integrated Browser
                          </h4>
                          <p className="text-slate-300 text-sm mb-3">
                            Opens LinkedIn in a managed popup window that stays connected to the app for easy navigation.
                          </p>
                          <button
                            onClick={isLinkedinConnected ? closeLinkedInBrowser : openLinkedInBrowser}
                            className={`w-full px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                              isLinkedinConnected 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-[#000b4f] text-white hover:bg-[#000940]'
                            }`}
                          >
                            {isLinkedinConnected ? 'Close LinkedIn' : 'Open LinkedIn →'}
                          </button>
                        </div>

                        {/* OCR Screenshot Upload */}
                        <div className="bg-slate-700 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2 flex items-center">
                            <Upload className="mr-2" size={16} />
                            Upload Document
                          </h4>
                          <p className="text-slate-300 text-sm mb-3">
                            Upload a LinkedIn profile document (PDF, PNG, JPG) for automatic data extraction. The system will extract career history, education, skills, and connection notes.
                          </p>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="linkedin-screenshot"
                            />
                            <label
                              htmlFor="linkedin-screenshot"
                              className="w-full px-4 py-2 bg-[#007a8a] text-white rounded-md hover:bg-[#006b75] transition-colors text-sm cursor-pointer flex items-center justify-center"
                            >
                              <Upload className="mr-2" size={16} />
                              {selectedImage ? 'Change File' : 'Select File'}
                            </label>
                            {selectedImage && (
                              <div className="text-xs text-slate-300 mb-2">
                                Selected: {selectedImage.name}
                              </div>
                            )}
                            <button
                              onClick={processLinkedInScreenshot}
                              disabled={!selectedImage || isProcessingOCR || !openaiToken}
                              className="w-full px-4 py-2 bg-[#ff6633] text-white rounded-md hover:bg-[#e55a2d] disabled:bg-slate-600 disabled:text-slate-400 text-sm font-medium transition-colors flex items-center justify-center"
                            >
                              {isProcessingOCR ? (
                                <>
                                  <Loader2 className="animate-spin mr-2" size={16} />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Camera className="mr-2" size={16} />
                                  Extract Data
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Copy & Paste URL */}
                        <div className="bg-slate-700 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2">Quick URL Entry</h4>
                          <p className="text-slate-300 text-sm mb-3">
                            Copy the LinkedIn profile URL and paste it above, then click "Collect Data".
                          </p>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={linkedinUrl}
                              readOnly
                              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                            />
                            <button
                              onClick={() => navigator.clipboard.writeText(linkedinUrl)}
                              className="px-3 py-1 bg-[#ff6633] text-white rounded text-sm hover:bg-[#e55a2d] transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Navigation */}
                      {isLinkedinConnected && (
                        <div className="mt-4 bg-slate-700 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-3">Quick Navigation</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button
                              onClick={() => navigateToProfile('https://www.linkedin.com/search/results/people/')}
                              className="px-3 py-2 bg-[#007a8a] text-white rounded text-sm hover:bg-[#006b75] transition-colors"
                            >
                              People Search
                            </button>
                            <button
                              onClick={() => navigateToProfile('https://www.linkedin.com/search/results/companies/')}
                              className="px-3 py-2 bg-[#007a8a] text-white rounded text-sm hover:bg-[#006b75] transition-colors"
                            >
                              Companies
                            </button>
                            <button
                              onClick={() => navigateToProfile('https://www.linkedin.com/sales/navigator/')}
                              className="px-3 py-2 bg-[#007a8a] text-white rounded text-sm hover:bg-[#006b75] transition-colors"
                            >
                              Sales Navigator
                            </button>
                            <button
                              onClick={() => navigateToProfile('https://www.linkedin.com')}
                              className="px-3 py-2 bg-[#007a8a] text-white rounded text-sm hover:bg-[#006b75] transition-colors"
                            >
                              Home
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Manual Entry Helper */}
                      <div className="mt-4 bg-slate-700 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Manual Data Entry</h4>
                        <p className="text-slate-300 text-sm mb-3">
                          If you prefer to enter the information manually, you can fill out the prospect form below directly.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button
                            onClick={() => setProspectData(prev => ({ ...prev, firstName: '' }))}
                            className="px-3 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors"
                          >
                            Clear Form
                          </button>
                          <button
                            onClick={() => {
                              const sample = {
                                firstName: 'John',
                                lastName: 'Smith',
                                company: 'TechCorp Inc',
                                title: 'VP of Sales',
                                email: 'john.smith@techcorp.com'
                              }
                              setProspectData(sample)
                            }}
                            className="px-3 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors"
                          >
                            Load Sample
                          </button>
                          <button
                            onClick={() => setShowLinkedInBrowser(false)}
                            className="px-3 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors"
                          >
                            Hide This Section
                          </button>
                          <button
                            onClick={() => setLinkedinUrl('https://www.linkedin.com')}
                            className="px-3 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors"
                          >
                            Reset URL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* LinkedIn Data Display */}
              {showLinkedinData && linkedinData && (
                <div className="bg-slate-700 rounded-lg p-6 mb-8 border border-slate-600">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center">
                      <Download className="mr-2 text-[#ff6633]" size={20} />
                      Collected LinkedIn Data
                    </h2>
                    <button
                      onClick={() => setShowLinkedinData(false)}
                      className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-500 transition-colors"
                    >
                      Hide
                    </button>
                  </div>

                  {linkedinData.success ? (
                    <div className="space-y-4">
                      {/* Data Summary */}
                      <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                        <h3 className="text-white font-medium mb-3">Extracted Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-300 text-sm">First Name:</span>
                              <span className="text-white font-medium">{linkedinData.firstName || 'Not found'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300 text-sm">Last Name:</span>
                              <span className="text-white font-medium">{linkedinData.lastName || 'Not found'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300 text-sm">Company:</span>
                              <span className="text-white font-medium">{linkedinData.company || 'Not found'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-300 text-sm">Title:</span>
                              <span className="text-white font-medium">{linkedinData.title || 'Not found'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300 text-sm">Email:</span>
                              <span className="text-white font-medium">{linkedinData.email || 'Not available'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300 text-sm">Source URL:</span>
                              <span className="text-[#007a8a] font-medium text-sm truncate max-w-48" title={linkedinUrl}>
                                {linkedinUrl.length > 40 ? linkedinUrl.substring(0, 40) + '...' : linkedinUrl}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Summary */}
                      {linkedinData.summary && (
                        <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                          <h3 className="text-white font-medium mb-3">Professional Summary</h3>
                          <p className="text-slate-200 text-sm leading-relaxed">{linkedinData.summary}</p>
                        </div>
                      )}

                      {/* Career History */}
                      {linkedinData.careerHistory && (
                        <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                          <h3 className="text-white font-medium mb-3">Career History</h3>
                          <div className="space-y-3">
                            {linkedinData.careerHistory.map((position: any, index: number) => (
                              <div key={index} className="border-l-2 border-[#ff6633] pl-4">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="text-white font-medium">{position.title}</h4>
                                  <span className="text-slate-300 text-xs">{position.duration}</span>
                                </div>
                                <p className="text-[#ffaa88] text-sm">{position.company}</p>
                                <p className="text-slate-400 text-xs mb-2">{position.location}</p>
                                <p className="text-slate-200 text-sm">{position.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {linkedinData.education && (
                        <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                          <h3 className="text-white font-medium mb-3">Education</h3>
                          <div className="space-y-3">
                            {linkedinData.education.map((edu: any, index: number) => (
                              <div key={index} className="border-l-2 border-[#007a8a] pl-4">
                                <h4 className="text-white font-medium">{edu.degree}</h4>
                                <p className="text-[#4da6b3] text-sm">{edu.school}</p>
                                <div className="flex justify-between items-center">
                                  <p className="text-slate-400 text-xs">{edu.location}</p>
                                  <p className="text-slate-300 text-xs">{edu.year}</p>
                                </div>
                                {edu.details && (
                                  <p className="text-slate-200 text-sm mt-1">{edu.details}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Licenses & Certifications */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {linkedinData.licenses && (
                          <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                            <h3 className="text-white font-medium mb-3">Licenses</h3>
                            <div className="space-y-2">
                              {linkedinData.licenses.map((license: any, index: number) => (
                                <div key={index} className="border-l-2 border-green-400 pl-3">
                                  <p className="text-white text-sm font-medium">{license.name}</p>
                                  <p className="text-green-300 text-xs">{license.issuer}</p>
                                  <p className="text-slate-400 text-xs">
                                    {license.issued} - {license.expires}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {linkedinData.certifications && (
                          <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                            <h3 className="text-white font-medium mb-3">Certifications</h3>
                            <div className="space-y-2">
                              {linkedinData.certifications.map((cert: any, index: number) => (
                                <div key={index} className="border-l-2 border-purple-400 pl-3">
                                  <p className="text-white text-sm font-medium">{cert.name}</p>
                                  <p className="text-purple-300 text-xs">{cert.issuer}</p>
                                  <p className="text-slate-400 text-xs">
                                    Issued: {cert.issued} | Expires: {cert.expires}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Skills & Languages */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {linkedinData.skills && (
                          <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                            <h3 className="text-white font-medium mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {linkedinData.skills.map((skill: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-slate-700 text-slate-200 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {linkedinData.languages && (
                          <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                            <h3 className="text-white font-medium mb-3">Languages</h3>
                            <div className="space-y-2">
                              {linkedinData.languages.map((lang: any, index: number) => (
                                <div key={index} className="flex justify-between">
                                  <span className="text-slate-200 text-sm">{lang.language}</span>
                                  <span className="text-slate-400 text-xs">{lang.proficiency}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Personal Details */}
                      {linkedinData.personalDetails && (
                        <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                          <h3 className="text-white font-medium mb-3">Additional Information</h3>
                          
                          {linkedinData.personalDetails.interests && (
                            <div className="mb-3">
                              <h4 className="text-slate-300 text-sm font-medium mb-2">Interests</h4>
                              <div className="flex flex-wrap gap-2">
                                {linkedinData.personalDetails.interests.map((interest: string, index: number) => (
                                  <span key={index} className="px-2 py-1 bg-slate-700 text-slate-200 rounded text-xs">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {linkedinData.personalDetails.awards && (
                            <div className="mb-3">
                              <h4 className="text-slate-300 text-sm font-medium mb-2">Awards & Honors</h4>
                              {linkedinData.personalDetails.awards.map((award: any, index: number) => (
                                <div key={index} className="text-sm mb-1">
                                  <span className="text-white">{award.title}</span>
                                  <span className="text-slate-400"> - {award.issuer} ({award.year})</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {linkedinData.personalDetails.publications && (
                            <div className="mb-3">
                              <h4 className="text-slate-300 text-sm font-medium mb-2">Publications</h4>
                              {linkedinData.personalDetails.publications.map((pub: any, index: number) => (
                                <div key={index} className="text-sm mb-1">
                                  <span className="text-white">{pub.title}</span>
                                  <span className="text-slate-400"> - {pub.publisher} ({pub.date})</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {linkedinData.volunteerWork && (
                            <div>
                              <h4 className="text-slate-300 text-sm font-medium mb-2">Volunteer Experience</h4>
                              {linkedinData.volunteerWork.map((vol: any, index: number) => (
                                <div key={index} className="mb-2">
                                  <p className="text-white text-sm">{vol.role} at {vol.organization}</p>
                                  <p className="text-slate-400 text-xs">{vol.duration}</p>
                                  <p className="text-slate-200 text-sm">{vol.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Re-populate form with LinkedIn data
                              setProspectData({
                                firstName: linkedinData.firstName || '',
                                lastName: linkedinData.lastName || '',
                                company: linkedinData.company || '',
                                title: linkedinData.title || '',
                                email: linkedinData.email || ''
                              })
                            }}
                            className="px-4 py-2 bg-[#ff6633] text-white rounded-md hover:bg-[#e55a2d] text-sm font-medium transition-colors"
                          >
                            Apply to Form
                          </button>
                          <button
                            onClick={() => {
                              // Copy data to clipboard as JSON
                              navigator.clipboard.writeText(JSON.stringify(linkedinData, null, 2))
                              alert('LinkedIn data copied to clipboard!')
                            }}
                            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 text-sm font-medium transition-colors"
                          >
                            Copy Data
                          </button>
                        </div>
                        <div className="text-slate-400 text-xs">
                          Data collected on: {new Date().toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                      <h3 className="text-red-300 font-medium mb-2">Collection Failed</h3>
                      <p className="text-red-200 text-sm mb-3">
                        {linkedinData.error || 'Unable to extract data from the LinkedIn profile.'}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => collectLinkedInData()}
                          disabled={isLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors disabled:bg-red-800"
                        >
                          {isLoading ? 'Retrying...' : 'Retry Collection'}
                        </button>
                        <button
                          onClick={() => setShowLinkedinData(false)}
                          className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 text-sm font-medium transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Prospect Information Form */}
              <div className="bg-slate-700 rounded-lg p-6 mb-8 border border-slate-600">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="mr-2 text-[#ff6633]" size={20} />
                  Prospect Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={prospectData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#ff6633] focus:border-[#ff6633]"
                      placeholder="John"
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={prospectData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#ff6633] focus:border-[#ff6633]"
                      placeholder="Doe"
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Company *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={prospectData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#ff6633] focus:border-[#ff6633]"
                        placeholder="Acme Corp"
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Title (Optional)
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={prospectData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#ff6633] focus:border-[#ff6633]"
                        placeholder="CEO"
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Email (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={prospectData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#ff6633] focus:border-[#ff6633]"
                        placeholder="john.doe@acme.com"
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !prospectData.firstName || !prospectData.lastName || !prospectData.company || !chatGptConnected}
                  className="bg-[#ff6633] hover:bg-[#e55a2d] disabled:bg-slate-600 disabled:text-slate-400 text-white font-medium py-3 px-8 rounded-lg inline-flex items-center space-x-2 text-lg transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      <span>Generate Sales Plan</span>
                    </>
                  )}
                </button>
                <p className="text-sm text-slate-400 mt-2">
                  {!chatGptConnected ? 'Connect GPT-4o first' : 'Press Enter to submit'}
                </p>
              </div>
            </>
          ) : (
            /* Results View */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  Sales Plan for {prospectData.firstName} {prospectData.lastName}
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={toggleAllGPTs}
                    className="px-4 py-2 bg-[#007a8a] text-white rounded-md hover:bg-[#006b75] transition-colors flex items-center"
                  >
                    {allGPTsExpanded ? (
                      <>
                        <Minimize2 className="mr-2" size={16} />
                        Minimize All
                      </>
                    ) : (
                      <>
                        <Maximize2 className="mr-2" size={16} />
                        Expand All
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowResults(false)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
                  >
                    ← Back to Form
                  </button>
                </div>
              </div>

              {/* Dynamic GPT Results */}
              {customGPTs.map((gpt, index) => {
                const resultKey = `gpt${gpt.id}`;
                if (!results[resultKey] || !gpt.enabled) return null;
                
                const colors = [
                  'bg-[#000b4f] border-[#007a8a]',
                  'bg-green-900 border-green-700', 
                  'bg-purple-900 border-purple-700',
                  'bg-red-900 border-red-700',
                  'bg-yellow-900 border-yellow-700'
                ];
                const textColors = [
                  'text-[#4da6b3]',
                  'text-green-300',
                  'text-purple-300', 
                  'text-red-300',
                  'text-yellow-300'
                ];
                
                const isExpanded = expandedGPTs[resultKey] || false;
                const preview = results[resultKey]?.substring(0, 150) + (results[resultKey]?.length > 150 ? '...' : '');
                
                return (
                  <div key={gpt.id} className={`${colors[index % colors.length]} rounded-lg border`}>
                    <div 
                      className="p-4 cursor-pointer flex justify-between items-center hover:bg-black/20 transition-colors"
                      onClick={() => toggleGPTExpansion(resultKey)}
                    >
                      <h3 className={`text-lg font-semibold ${textColors[index % textColors.length]} flex items-center`}>
                        <Bot className="mr-2" size={20} />
                        {gpt.name}
                      </h3>
                      <div className="flex items-center">
                        {isExpanded ? (
                          <ChevronUp className={`${textColors[index % textColors.length]}`} size={20} />
                        ) : (
                          <ChevronDown className={`${textColors[index % textColors.length]}`} size={20} />
                        )}
                      </div>
                    </div>
                    
                    {isExpanded ? (
                      <div className="px-4 pb-4">
                        <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{results[resultKey]}</p>
                      </div>
                    ) : (
                      <div className="px-4 pb-4">
                        <p className="text-slate-300 text-sm italic">{preview}</p>
                        <p className="text-slate-400 text-xs mt-2">Click to expand full analysis</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Sales Plan Summary */}
              {results.salesPlan && (
                <div className="bg-[#7d2d11] border border-[#cc5229] rounded-lg">
                  <div 
                    className="p-4 cursor-pointer flex justify-between items-center hover:bg-black/20 transition-colors"
                    onClick={() => toggleGPTExpansion('salesPlan')}
                  >
                    <h3 className="text-lg font-semibold text-[#ffaa88] flex items-center">
                      <Search className="mr-2" size={20} />
                      Sales Plan Summary
                    </h3>
                    <div className="flex items-center">
                      {expandedGPTs['salesPlan'] ? (
                        <ChevronUp className="text-[#ffaa88]" size={20} />
                      ) : (
                        <ChevronDown className="text-[#ffaa88]" size={20} />
                      )}
                    </div>
                  </div>
                  
                  {expandedGPTs['salesPlan'] ? (
                    <div className="px-4 pb-4">
                      <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{results.salesPlan}</p>
                    </div>
                  ) : (
                    <div className="px-4 pb-4">
                      <p className="text-slate-300 text-sm italic">
                        {results.salesPlan?.substring(0, 150) + (results.salesPlan?.length > 150 ? '...' : '')}
                      </p>
                      <p className="text-slate-400 text-xs mt-2">Click to expand complete sales plan</p>
                    </div>
                  )}
                </div>
              )}

              {/* ChatGPT-style Chat Interface */}
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MessageCircle className="mr-2 text-[#ff6633]" size={20} />
                  Chat with AI Assistant
                </h3>
                
                {/* Chat Messages */}
                <div className="bg-slate-800 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="mx-auto text-slate-400 mb-3" size={48} />
                      <p className="text-slate-400 text-sm">Start a conversation about your prospect research</p>
                      <p className="text-slate-500 text-xs mt-1">Ask questions, request clarifications, or get deeper insights</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-[#ff6633] text-white' 
                              : 'bg-slate-600 text-white border border-slate-500'
                          }`}>
                            <div className="text-sm font-medium mb-1 opacity-75">
                              {message.role === 'user' ? 'You' : 'AI Assistant'}
                            </div>
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-600 text-white border border-slate-500 px-4 py-2 rounded-lg max-w-[80%]">
                            <div className="text-sm font-medium mb-1 opacity-75">AI Assistant</div>
                            <div className="flex items-center space-x-2">
                              <Loader2 className="animate-spin" size={16} />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#ff6633] focus:border-[#ff6633]"
                    placeholder="Ask about the research, request changes, or get insights..."
                    disabled={!openaiToken || isChatLoading}
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={!chatInput.trim() || !openaiToken || isChatLoading}
                    className="bg-[#ff6633] hover:bg-[#e55a2d] disabled:bg-slate-600 disabled:text-slate-400 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {isChatLoading ? <Loader2 className="animate-spin" size={16} /> : 'Send'}
                  </button>
                </div>
                {!openaiToken && (
                  <p className="text-sm text-red-400 mt-2">Please add your ChatGPT token to use chat functionality</p>
                )}
                {chatHistory.length > 0 && (
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-xs text-slate-400">{chatHistory.length} messages</p>
                    <button
                      onClick={() => setChatHistory([])}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Clear conversation
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
