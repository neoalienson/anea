const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://lwhxzpqymdztbmbkefah.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3aHh6cHF5bWR6dGJtYmtlZmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyOTcxMjksImV4cCI6MjA0ODg3MzEyOX0.uGxcnwhJZkFcFm1EaQJ8f1MhWmN-j8Gq-aWhK0OQazQ'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function addProteinCampaign() {
  try {
    // Insert protein shake campaign
    const { data, error } = await supabase
      .from('campaigns')
      .insert([
        {
          id: 'c3333333-3333-3333-3333-333333333333',
          business_id: 'b3333333-3333-3333-3333-333333333333',
          title: 'PowerFit Protein Shake Launch',
          description: 'Promote our new premium whey protein shake for fitness enthusiasts and gym-goers',
          objectives: [
            {"type": "awareness", "target": 300000, "metric": "impressions"},
            {"type": "engagement", "target": 15000, "metric": "likes"},
            {"type": "conversion", "target": 200, "metric": "sales"}
          ],
          requirements: {
            "platforms": ["youtube", "instagram"],
            "categories": ["fitness", "health", "nutrition", "gym", "workout"],
            "minFollowers": 30000,
            "maxFollowers": 300000,
            "targetDemographics": {
              "ageRange": ["18-35"],
              "interests": ["fitness", "bodybuilding", "nutrition", "health", "gym"]
            }
          },
          budget: {"total": 12000, "perKOL": 4000, "currency": "USD"},
          timeline: {
            "startDate": "2024-03-15",
            "endDate": "2024-04-15",
            "applicationDeadline": "2024-03-10"
          },
          status: 'active'
        }
      ])
      .select()

    if (error) throw error

    console.log('✅ Successfully added protein shake campaign:', data)

    // Add campaign-KOL relationship for fitness coach
    const { data: kolData, error: kolError } = await supabase
      .from('campaign_kols')
      .insert([
        {
          campaign_id: 'c3333333-3333-3333-3333-333333333333',
          kol_id: 'k5555555-5555-5555-5555-555555555555',
          status: 'invited',
          proposed_rate: null,
          agreed_rate: null
        }
      ])
      .select()

    if (kolError) throw kolError

    console.log('✅ Successfully added campaign-KOL relationship:', kolData)

  } catch (error) {
    console.error('❌ Error adding protein campaign:', error)
  }
}

addProteinCampaign()