import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  display_name?: string
  bio?: string
  youtube_subscriber_count?: number
  instagram_follower_count?: number
  youtube_engagement_rate?: number
  instagram_engagement_rate?: number
  content_quality_score?: number
  brand_safety_score?: number
  topics_covered_youtube?: string[]
  topics_covered_instagram?: string[]
  previous_brand_deals?: Array<{brand: string, value: number, type: string}>
  average_brand_deal_value?: number
  niche_authority_score?: number
  collaboration_readiness?: boolean
}

async function callPerplexityForProfileAnalysis(profile: ProfileData) {
  const apiKey = process.env.PERPLEXITY_API_KEY
  const model = process.env.PERPLEXITY_MODEL || 'sonar-small-online'
  if (!apiKey) return null

  const profileSummary = `
    KOL Profile Analysis:
    - Name: ${profile.display_name || 'Not provided'}
    - Bio: ${profile.bio || 'Not provided'}
    - YouTube: ${profile.youtube_subscriber_count || 0} subscribers, ${((profile.youtube_engagement_rate || 0) * 100).toFixed(2)}% ER
    - Instagram: ${profile.instagram_follower_count || 0} followers, ${((profile.instagram_engagement_rate || 0) * 100).toFixed(2)}% ER
    - Content Quality Score: ${profile.content_quality_score || 0}/10
    - Brand Safety Score: ${profile.brand_safety_score || 0}/10
    - Topics: YouTube [${profile.topics_covered_youtube?.join(', ') || 'None'}], Instagram [${profile.topics_covered_instagram?.join(', ') || 'None'}]
    - Previous Deals: ${profile.previous_brand_deals?.length || 0} (Avg: $${profile.average_brand_deal_value || 0})
    - Niche Authority: ${profile.niche_authority_score || 0}/10
    - Collaboration Ready: ${profile.collaboration_readiness ? 'Yes' : 'No'}
  `

  const prompt = `Analyze this KOL profile and provide specific, actionable improvement suggestions in JSON format:
${profileSummary}

Return JSON with these keys:
- overall_score (1-10)
- strengths (array of strings)
- weaknesses (array of strings)
- improvement_suggestions (array of objects with {area, suggestion, priority, estimated_impact})
- monetization_potential (string)
- recommended_niches (array of strings)
- next_steps (array of strings)

Focus on practical, actionable advice for improving brand partnerships and content quality.`

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a professional KOL marketing analyst. Return only valid JSON without any markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content || '{}'
    
    // Clean up any markdown formatting
    const cleanContent = content.replace(/```json\n|```\n|```/g, '').trim()
    
    try {
      return JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', cleanContent)
      return null
    }
  } catch (error) {
    console.error('Perplexity API error:', error)
    return null
  }
}

function generateFallbackAnalysis(profile: ProfileData) {
  const totalFollowers = (profile.youtube_subscriber_count || 0) + (profile.instagram_follower_count || 0)
  const avgEngagement = ((profile.youtube_engagement_rate || 0) + (profile.instagram_engagement_rate || 0)) / 2
  const contentQuality = profile.content_quality_score || 0
  const brandSafety = profile.brand_safety_score || 0
  
  let overall_score = Math.min(10, (
    (totalFollowers / 10000) * 0.3 +
    (avgEngagement * 100) * 0.3 +
    contentQuality * 0.2 +
    brandSafety * 0.2
  ))

  const strengths = []
  const weaknesses = []
  const improvements = []

  if (totalFollowers > 50000) strengths.push('Strong audience reach across platforms')
  else weaknesses.push('Limited audience size - focus on organic growth strategies')

  if (avgEngagement > 0.03) strengths.push('Good engagement rates indicate active audience')
  else improvements.push({area: 'Engagement', suggestion: 'Create more interactive content to boost engagement', priority: 'High', estimated_impact: 'Moderate'})

  if (contentQuality > 7) strengths.push('High-quality content production')
  else improvements.push({area: 'Content Quality', suggestion: 'Invest in better production equipment and editing skills', priority: 'High', estimated_impact: 'High'})

  if (!profile.bio || profile.bio.length < 50) {
    improvements.push({area: 'Profile Bio', suggestion: 'Write a compelling bio that clearly states your niche and value proposition', priority: 'Medium', estimated_impact: 'Moderate'})
  }

  if (!profile.topics_covered_youtube?.length && !profile.topics_covered_instagram?.length) {
    improvements.push({area: 'Content Focus', suggestion: 'Define clear content themes and stick to 2-3 main topics for better niche authority', priority: 'High', estimated_impact: 'High'})
  }

  // Generate recommended niches based on actual profile content
  let recommendedNiches = []
  const bio = (profile.bio || '').toLowerCase()
  const displayName = (profile.display_name || '').toLowerCase()
  const allTopics = [...(profile.topics_covered_youtube || []), ...(profile.topics_covered_instagram || [])]
  
  // Check for fitness/gym related keywords
  if (bio.includes('fitness') || bio.includes('gym') || bio.includes('workout') || bio.includes('trainer') || displayName.includes('fitness') || displayName.includes('gym')) {
    recommendedNiches.push('Fitness & Health', 'Nutrition', 'Gym Equipment')
  }
  // Check for tech related keywords
  else if (bio.includes('tech') || bio.includes('review') || bio.includes('gadget') || displayName.includes('tech') || allTopics.some(t => t.includes('tech'))) {
    recommendedNiches.push('Technology', 'Consumer Electronics', 'Software Reviews')
  }
  // Check for beauty/fashion keywords
  else if (bio.includes('beauty') || bio.includes('fashion') || bio.includes('makeup') || allTopics.some(t => ['beauty', 'fashion', 'makeup'].includes(t))) {
    recommendedNiches.push('Beauty & Cosmetics', 'Fashion', 'Lifestyle')
  }
  // Check for gaming keywords
  else if (bio.includes('gaming') || bio.includes('gamer') || bio.includes('esports') || allTopics.some(t => t.includes('gaming'))) {
    recommendedNiches.push('Gaming', 'Esports', 'Gaming Hardware')
  }
  // Use existing topics if available, otherwise default
  else if (allTopics.length > 0) {
    recommendedNiches = allTopics.slice(0, 3).map(topic => 
      topic.charAt(0).toUpperCase() + topic.slice(1)
    )
  }
  // Final fallback
  else {
    recommendedNiches = ['Technology', 'Lifestyle', 'Education']
  }

  return {
    overall_score: Math.round(overall_score * 10) / 10,
    strengths,
    weaknesses,
    improvement_suggestions: improvements,
    monetization_potential: totalFollowers > 10000 ? 'Good potential for brand partnerships' : 'Focus on audience growth first',
    recommended_niches: recommendedNiches.slice(0, 3),
    next_steps: [
      'Complete profile optimization',
      'Develop consistent posting schedule',
      'Engage with your community regularly',
      'Research potential brand partnerships'
    ]
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any)?.role !== 'kol') {
      return NextResponse.json({ error: 'Unauthorized - KOL access only' }, { status: 401 })
    }

    // Fetch current profile data
    const { data: profileData, error } = await supabase
      .from('kol_profiles')
      .select('*')
      .eq('user_id', (session.user as any).id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Profile fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    const profile = profileData || {}

    // Try AI analysis first, fallback to rule-based
    let analysis = await callPerplexityForProfileAnalysis(profile)
    if (!analysis) {
      console.log('Using fallback analysis')
      analysis = generateFallbackAnalysis(profile)
    }

    return NextResponse.json({
      success: true,
      analysis,
      profile_completeness: calculateProfileCompleteness(profile)
    })
  } catch (error) {
    console.error('Profile enhancement error:', error)
    return NextResponse.json({ error: 'Failed to analyze profile' }, { status: 500 })
  }
}

function calculateProfileCompleteness(profile: ProfileData): { score: number, missing_fields: string[] } {
  const required_fields = [
    'display_name', 'bio', 'youtube_subscriber_count', 'instagram_follower_count',
    'topics_covered_youtube', 'topics_covered_instagram'
  ]
  
  let completed = 0
  const missing = []
  
  for (const field of required_fields) {
    if (profile[field as keyof ProfileData]) {
      completed++
    } else {
      missing.push(field.replace('_', ' '))
    }
  }
  
  return {
    score: Math.round((completed / required_fields.length) * 100),
    missing_fields: missing
  }
}