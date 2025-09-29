import { NextRequest, NextResponse } from 'next/server'

type CampaignInput = {
  id?: string
  title?: string
  description?: string
  requirements?: {
    categories?: string[]
    minFollowers?: number
    platforms?: string[]
    targetLocations?: string[]
  }
}

type HKKol = {
  id: string
  display_name: string
  handle: string
  categories: string[]
  followers: number
  engagement_rate: number
  instagram_url: string
  bio: string
  location: string
}

// Lightweight generator for a realistic HK KOL dataset (120 entries)
function generateHKDataset(): HKKol[] {
  const categories = [
    'fitness', 'beauty', 'fashion', 'lifestyle', 'food', 'travel', 'technology', 'parenting', 'finance', 'education',
  ]
  const firstNames = ['Alex','Mandy','Jason','Kelly','Ivan','Carmen','Tommy','Yuki','Marcus','Winnie','Brian','Queenie','Anson','Chloe','Sam','Natalie']
  const lastNames = ['Chan','Wong','Lee','Cheung','Cheng','Lau','Leung','Ho','Ng','Yip','Lam','Yu']
  const list: HKKol[] = []
  let idSeq = 1
  for (let i = 0; i < 120; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)]
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${fn} ${ln}`
    const cat1 = categories[Math.floor(Math.random() * categories.length)]
    const cat2 = categories[Math.floor(Math.random() * categories.length)]
    const cats = Array.from(new Set([cat1, cat2]))
    const followers = Math.floor(10000 + Math.random() * 490000) // 10k - 500k
    const engagement = +(0.02 + Math.random() * 0.07).toFixed(4) // 2% - 9%
    const handle = `@${fn.toLowerCase()}_${ln.toLowerCase()}_${(100+Math.floor(Math.random()*900))}`
    list.push({
      id: `hk-kol-${idSeq++}`,
      display_name: name,
      handle,
      categories: cats,
      followers,
      engagement_rate: engagement,
      instagram_url: `https://instagram.com/${handle.replace('@','')}`,
      bio: `${name} — HK ${cats.join('/')} creator sharing authentic content and community stories.`,
      location: 'Hong Kong'
    })
  }
  // Seed some known fitness names for the gym example
  const seeds: HKKol[] = [
    {
      id: 'hk-fitness-1', display_name: 'Fit Hazel', handle: '@fit_hazel_hk',
      categories: ['fitness','health'], followers: 185000, engagement_rate: 0.0612,
      instagram_url: 'https://instagram.com/fit_hazel_hk',
      bio: 'HK fitness coach. Strength, mobility, sustainable habits. 中文/English.', location: 'Hong Kong'
    },
    {
      id: 'hk-fitness-2', display_name: 'Gym Kelvin', handle: '@kelvin_lifts_hk',
      categories: ['fitness','nutrition'], followers: 98000, engagement_rate: 0.0525,
      instagram_url: 'https://instagram.com/kelvin_lifts_hk',
      bio: 'Personal trainer in Hong Kong. Evidence-based training for busy professionals.', location: 'Hong Kong'
    },
    {
      id: 'hk-fitness-3', display_name: 'Yoga Mandy', handle: '@mandy_yoga_flow',
      categories: ['fitness','wellness'], followers: 124500, engagement_rate: 0.0578,
      instagram_url: 'https://instagram.com/mandy_yoga_flow',
      bio: 'Yoga + mindfulness in HK. Partnerships with local studios. 中文/ENG', location: 'Hong Kong'
    }
  ]
  return [...seeds, ...list]
}

function scoreKol(kol: HKKol, criteria: any): number {
  let score = 0
  const wantedCats: string[] = (criteria.categories || []).map((c: string) => c.toLowerCase())
  const kolCats = kol.categories.map(c => c.toLowerCase())
  const overlap = kolCats.filter(c => wantedCats.includes(c)).length
  score += overlap * 30
  if (criteria.minFollowers) {
    // Reward being around minFollowers, penalize too far away
    const diff = Math.abs(kol.followers - criteria.minFollowers)
    score += Math.max(0, 30 - Math.min(30, diff / 10000)) // within ~300k retains some score
  }
  // Engagement weight
  score += Math.min(40, kol.engagement_rate * 1000)
  return score
}

async function callPerplexityJSON(prompt: string) {
  const apiKey = process.env.PERPLEXITY_API_KEY
  const model = process.env.PERPLEXITY_MODEL || 'sonar-small-online'
  if (!apiKey) return null
  try {
    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are an assistant that returns concise JSON only. No prose.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    })
    const data = await resp.json()
    const text = data?.choices?.[0]?.message?.content || ''
    try { return JSON.parse(text) } catch { return null }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const campaign: CampaignInput = body.campaign || {}
    const example = body.example || false

    // 1) Build a compact campaign summary
    const summary = `Title: ${campaign.title || 'Campaign'}\nDescription: ${campaign.description || ''}\nRequirements: ${JSON.stringify(campaign.requirements || {})}`

    // 2) Ask GPT (Perplexity) for search criteria (JSON)
    const criteriaPrompt = `Given this HK campaign, output JSON with keys: categories (string[]), minFollowers (number), location (string, always "Hong Kong"), platforms (string[], include "instagram"), tone (string).\nCampaign:\n${summary}\nReturn JSON only.`
    const criteria = await callPerplexityJSON(criteriaPrompt) || {
      categories: campaign.requirements?.categories || ['fitness','lifestyle'],
      minFollowers: campaign.requirements?.minFollowers || 30000,
      location: 'Hong Kong',
      platforms: ['instagram'],
      tone: 'authentic and community-driven'
    }

    // 3) Match against simulated HK dataset
    const dataset = generateHKDataset()
    // Ensure we respect the user's entered minimum followers strictly
    const effectiveMinFollowers = typeof campaign.requirements?.minFollowers === 'number'
      ? campaign.requirements!.minFollowers!
      : (typeof criteria.minFollowers === 'number' ? criteria.minFollowers : 0)

    const pool = effectiveMinFollowers
      ? dataset.filter(k => k.followers >= effectiveMinFollowers)
      : dataset

    const scored = pool
      .map(k => ({ k, s: scoreKol(k, criteria) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, example ? 2 : 3)

    // 4) Generate personalized explanations via GPT
    const explanations: Record<string, string> = {}
    const apiKey = process.env.PERPLEXITY_API_KEY
    if (apiKey) {
      for (const { k } of scored) {
        const expPrompt = `In 2 sentences, explain why this HK Instagram KOL is a good fit. Return plain text only.\nCampaign: ${summary}\nKOL: ${k.display_name}, cats=${k.categories.join(',')}, followers=${k.followers}, engagement=${k.engagement_rate}`
        const expJSON = await callPerplexityJSON(`{"explanation": "${expPrompt.replace(/"/g,'\\"')}"}`)
        // If JSON wrapper didn't work, just compose a heuristic explanation
        explanations[k.id] = expJSON?.explanation || `${k.display_name} aligns with ${criteria.categories?.join('/')} and engages HK audiences (${Math.round(k.engagement_rate*100)}% ER). Follower size ~${k.followers.toLocaleString()} suits your reach goals.`
      }
    } else {
      for (const { k } of scored) {
        explanations[k.id] = `${k.display_name} matches your ${criteria.categories?.join('/')} theme, focuses on Hong Kong audiences, and has an engaging presence (ER ~${Math.round(k.engagement_rate*100)}%).`
      }
    }

    const results = scored.map(({ k, s }) => ({
      id: k.id,
      display_name: k.display_name,
      handle: k.handle,
      instagram_url: k.instagram_url,
      categories: k.categories,
      followers: k.followers,
      engagement_rate: k.engagement_rate,
      location: k.location,
      explanation: explanations[k.id],
      score: s,
      status: 'available',
      source: 'instagram_simulated'
    }))

    return NextResponse.json({ success: true, criteria, results })
  } catch (e) {
    console.error('Simulated discovery error:', e)
    return NextResponse.json({ error: 'Failed simulated discovery' }, { status: 500 })
  }
}
