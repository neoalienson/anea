import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface KOLProfile {
  display_name?: string
  bio?: string
  youtube_subscriber_count?: number
  instagram_follower_count?: number
  youtube_engagement_rate?: number
  instagram_engagement_rate?: number
  content_quality_score?: number
  topics_covered_youtube?: string[]
  topics_covered_instagram?: string[]
  previous_brand_deals?: Array<{brand: string, value: number}>
  average_brand_deal_value?: number
  niche_authority_score?: number
  audience_age_distribution?: {[key: string]: number}
  audience_location_top_cities?: string[]
  brand_safety_score?: number
}

interface Campaign {
  id: string
  title: string
  description: string
  budget: { total: number, currency: string }
  requirements: {
    categories: string[]
    minFollowers: number
    platforms: string[]
    targetLocations?: string[]
    age_groups?: string[]
  }
  status: string
  business_id: string
  created_at: string
}

interface MatchResult {
  campaign: Campaign
  match_score: number
  strengths: string[]
  gaps: string[]
  improvement_suggestions: string[]
  estimated_earnings: {
    min: number
    max: number
    reasoning: string
  }
  competition_level: 'Low' | 'Medium' | 'High'
  success_probability: number
}

function calculateMatchScore(profile: KOLProfile, campaign: Campaign): number {
  let score = 0
  
  // Follower count matching (30%)
  const totalFollowers = (profile.youtube_subscriber_count || 0) + (profile.instagram_follower_count || 0)
  const minRequired = campaign.requirements.minFollowers || 0
  if (totalFollowers >= minRequired) {
    const ratio = totalFollowers / Math.max(minRequired, 1)
    score += Math.min(30, 20 + Math.log10(ratio) * 10)
  }
  
  // Topic/category alignment (40%) - Enhanced matching
  const profileTopics = [...(profile.topics_covered_youtube || []), ...(profile.topics_covered_instagram || [])]
  const campaignCategories = campaign.requirements.categories || []
  const bio = (profile.bio || '').toLowerCase()
  const displayName = (profile.display_name || '').toLowerCase()
  
  // Direct topic overlap
  let topicOverlap = profileTopics.filter(topic => 
    campaignCategories.some(cat => cat.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(cat.toLowerCase()))
  ).length
  
  // Enhanced matching for fitness/health campaigns
  const fitnessKeywords = ['fitness', 'gym', 'workout', 'trainer', 'health', 'nutrition', 'protein']
  const techKeywords = ['tech', 'review', 'gadget', 'smartphone', 'laptop']
  const beautyKeywords = ['beauty', 'makeup', 'skincare', 'fashion']
  const gamingKeywords = ['gaming', 'gamer', 'esports', 'game']
  
  campaignCategories.forEach(cat => {
    const catLower = cat.toLowerCase()
    
    // Check if profile matches fitness campaigns
    if (['fitness', 'health', 'nutrition', 'gym', 'workout', 'protein'].includes(catLower)) {
      if (fitnessKeywords.some(kw => bio.includes(kw) || displayName.includes(kw) || profileTopics.some(t => t.toLowerCase().includes(kw)))) {
        topicOverlap += 2 // Strong fitness match bonus
      }
    }
    // Check if profile matches tech campaigns
    else if (['technology', 'tech', 'gadgets', 'reviews'].includes(catLower)) {
      if (techKeywords.some(kw => bio.includes(kw) || displayName.includes(kw) || profileTopics.some(t => t.toLowerCase().includes(kw)))) {
        topicOverlap += 2
      }
    }
    // Check other categories
    else if (['beauty', 'fashion', 'lifestyle'].includes(catLower)) {
      if (beautyKeywords.some(kw => bio.includes(kw) || displayName.includes(kw) || profileTopics.some(t => t.toLowerCase().includes(kw)))) {
        topicOverlap += 2
      }
    }
    else if (['gaming', 'esports', 'entertainment'].includes(catLower)) {
      if (gamingKeywords.some(kw => bio.includes(kw) || displayName.includes(kw) || profileTopics.some(t => t.toLowerCase().includes(kw)))) {
        topicOverlap += 2
      }
    }
  })
  
  const maxTopics = Math.max(profileTopics.length, campaignCategories.length, 1)
  score += Math.min(40, (topicOverlap / maxTopics) * 40)
  
  // Platform alignment (20%)
  const requiredPlatforms = campaign.requirements.platforms || []
  let platformScore = 0
  if (requiredPlatforms.includes('youtube') && profile.youtube_subscriber_count) platformScore += 10
  if (requiredPlatforms.includes('instagram') && profile.instagram_follower_count) platformScore += 10
  score += platformScore
  
  // Quality and brand safety (10%)
  score += (profile.content_quality_score || 0) * 0.5
  score += (profile.brand_safety_score || 0) * 0.5
  
  return Math.min(100, Math.max(0, score))
}

function estimateEarnings(profile: KOLProfile, campaign: Campaign): {min: number, max: number, reasoning: string} {
  const budgetTotal = campaign.budget?.total || 0
  const totalFollowers = (profile.youtube_subscriber_count || 0) + (profile.instagram_follower_count || 0)
  const avgEngagement = ((profile.youtube_engagement_rate || 0) + (profile.instagram_engagement_rate || 0)) / 2
  
  // Base rate: $1-5 per 1000 followers for sponsored posts
  let baseRate = totalFollowers / 1000 * 2.5
  
  // Adjust for engagement (higher engagement = premium rates)
  if (avgEngagement > 0.05) baseRate *= 1.5
  else if (avgEngagement > 0.03) baseRate *= 1.2
  
  // Adjust for niche authority
  if (profile.niche_authority_score && profile.niche_authority_score > 7) {
    baseRate *= 1.3
  }
  
  // Campaign budget constraints
  const maxPayout = Math.min(budgetTotal * 0.3, baseRate * 2) // Max 30% of campaign budget
  const minPayout = Math.max(baseRate * 0.5, 100) // Minimum $100
  
  let reasoning = `Based on ${totalFollowers.toLocaleString()} followers, ${(avgEngagement*100).toFixed(1)}% engagement rate`
  if (profile.previous_brand_deals && profile.average_brand_deal_value) {
    reasoning += `, and previous deal average of $${profile.average_brand_deal_value.toLocaleString()}`
  }
  
  return {
    min: Math.round(minPayout),
    max: Math.round(maxPayout),
    reasoning
  }
}

function analyzeCompetition(totalFollowers: number, categories: string[]): 'Low' | 'Medium' | 'High' {
  // Simulate competition analysis based on follower count and niche
  const popularNiches = ['fashion', 'beauty', 'lifestyle', 'gaming']
  const isPopularNiche = categories.some(cat => popularNiches.includes(cat.toLowerCase()))
  
  if (totalFollowers > 500000) return 'High'
  if (totalFollowers > 100000 && isPopularNiche) return 'High'
  if (totalFollowers > 50000 || isPopularNiche) return 'Medium'
  return 'Low'
}

async function callPerplexityForCampaignAnalysis(profile: KOLProfile, campaign: Campaign, matchScore: number) {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) return null
  
  const prompt = `Analyze this KOL-campaign match and provide insights:
  
  KOL: ${profile.display_name} (${((profile.youtube_subscriber_count || 0) + (profile.instagram_follower_count || 0)).toLocaleString()} total followers)
  Topics: ${[...(profile.topics_covered_youtube || []), ...(profile.topics_covered_instagram || [])].join(', ')}
  
  Campaign: ${campaign.title}
  Description: ${campaign.description}
  Budget: $${campaign.budget?.total?.toLocaleString()} ${campaign.budget?.currency}
  Required Categories: ${campaign.requirements.categories?.join(', ')}
  Min Followers: ${campaign.requirements.minFollowers?.toLocaleString()}
  
  Match Score: ${matchScore.toFixed(1)}%
  
  Provide JSON with:
  - strengths (array): Why this KOL is a good fit
  - gaps (array): What's missing or concerning
  - improvement_suggestions (array): Specific actions to improve chances
  - success_probability (number 0-100): Likelihood of being selected
  
  Focus on actionable insights.`
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.PERPLEXITY_MODEL || 'sonar-small-online',
        messages: [
          { role: 'system', content: 'You are a KOL campaign matching expert. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    })
    
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    
    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content || '{}'
    const cleanContent = content.replace(/```json\n|```\n|```/g, '').trim()
    
    return JSON.parse(cleanContent)
  } catch (error) {
    console.error('Campaign analysis AI error:', error)
    return null
  }
}

function generateFallbackAnalysis(profile: KOLProfile, campaign: Campaign, matchScore: number) {
  const totalFollowers = (profile.youtube_subscriber_count || 0) + (profile.instagram_follower_count || 0)
  const profileTopics = [...(profile.topics_covered_youtube || []), ...(profile.topics_covered_instagram || [])]
  const campaignCategories = campaign.requirements.categories || []
  
  const strengths = []
  const gaps = []
  const improvements = []
  
  // Analyze match
  if (totalFollowers >= (campaign.requirements.minFollowers || 0)) {
    strengths.push('Meets follower requirements')
  } else {
    gaps.push('Below minimum follower threshold')
    improvements.push('Focus on organic growth to reach minimum requirements')
  }
  
  const topicMatch = profileTopics.some(topic => 
    campaignCategories.some(cat => cat.toLowerCase().includes(topic.toLowerCase()))
  )
  if (topicMatch) {
    strengths.push('Content aligns with campaign categories')
  } else {
    gaps.push('Limited topic alignment with campaign requirements')
    improvements.push('Create content in campaign-relevant categories')
  }
  
  if (profile.brand_safety_score && profile.brand_safety_score > 7) {
    strengths.push('Strong brand safety score')
  } else {
    improvements.push('Improve brand safety by avoiding controversial content')
  }
  
  return {
    strengths,
    gaps,
    improvement_suggestions: improvements,
    success_probability: Math.min(95, Math.max(5, matchScore))
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any)?.role !== 'kol') {
      return NextResponse.json({ error: 'Unauthorized - KOL access only' }, { status: 401 })
    }

    const body = await req.json()
    const { limit = 5 } = body

    // Fetch KOL profile
    const { data: profileData, error: profileError } = await supabase
      .from('kol_profiles')
      .select('*')
      .eq('user_id', (session.user as any).id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    const profile = profileData || {}

    // Fetch active campaigns
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20)

    if (campaignError) {
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    // Calculate matches
    const matches: MatchResult[] = []
    
    for (const campaign of campaigns || []) {
      const matchScore = calculateMatchScore(profile, campaign)
      
      // Only include campaigns with reasonable match (>20%)
      if (matchScore > 20) {
        const totalFollowers = (profile.youtube_subscriber_count || 0) + (profile.instagram_follower_count || 0)
        
        // Get AI analysis or fallback
        let analysis = await callPerplexityForCampaignAnalysis(profile, campaign, matchScore)
        if (!analysis) {
          analysis = generateFallbackAnalysis(profile, campaign, matchScore)
        }
        
        matches.push({
          campaign,
          match_score: Math.round(matchScore),
          strengths: analysis.strengths || [],
          gaps: analysis.gaps || [],
          improvement_suggestions: analysis.improvement_suggestions || [],
          estimated_earnings: estimateEarnings(profile, campaign),
          competition_level: analyzeCompetition(totalFollowers, campaign.requirements.categories || []),
          success_probability: analysis.success_probability || matchScore
        })
      }
    }

    // Sort by match score and limit results
    matches.sort((a, b) => b.match_score - a.match_score)
    const topMatches = matches.slice(0, limit)

    return NextResponse.json({
      success: true,
      matches: topMatches,
      total_analyzed: campaigns?.length || 0,
      profile_summary: {
        total_followers: (profile.youtube_subscriber_count || 0) + (profile.instagram_follower_count || 0),
        main_topics: [...(profile.topics_covered_youtube || []), ...(profile.topics_covered_instagram || [])].slice(0, 3),
        avg_engagement: ((profile.youtube_engagement_rate || 0) + (profile.instagram_engagement_rate || 0)) / 2
      }
    })
  } catch (error) {
    console.error('Campaign matching error:', error)
    return NextResponse.json({ error: 'Failed to match campaigns' }, { status: 500 })
  }
}
