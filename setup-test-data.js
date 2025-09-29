const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = 'https://lwhxzpqymdztbmbkefah.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3aHh6cHF5bWR6dGJtYmtlZmFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzI5NzEyOSwiZXhwIjoyMDQ4ODczMTI5fQ.YVlDbNv-CJBCvfZRZu3ZVr-_aIi7z88B0sU_Sx2ISNQ'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data...')

    // Update techreviewer profile to be gym-focused for testing
    const { data: profileUpdate, error: profileError } = await supabase
      .from('kol_profiles')
      .update({
        display_name: 'GymTech Reviewer',
        bio: 'Certified fitness trainer and tech reviewer focused on gym equipment, fitness apps, and workout gear. Helping people build their home gym setup and optimize their fitness routine.',
        topics_covered_youtube: ['fitness equipment reviews', 'gym setup tutorials', 'workout apps', 'fitness technology', 'home gym builds'],
        topics_covered_instagram: ['gym workouts', 'fitness motivation', 'equipment demos']
      })
      .eq('user_id', 'k1111111-1111-1111-1111-111111111111')
      .select()

    if (profileError) {
      console.warn('⚠️ Profile update warning (may already exist):', profileError.message)
    } else {
      console.log('✅ Updated techreviewer profile to be gym-focused')
    }

    // Insert protein shake campaign
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .upsert([
        {
          id: 'c3333333-3333-3333-3333-333333333333',
          business_id: 'b3333333-3333-3333-3333-333333333333',
          title: 'PowerFit Protein Shake Launch',
          description: 'Promote our new premium whey protein shake for fitness enthusiasts and gym-goers. Perfect for post-workout recovery and muscle building.',
          objectives: [
            {"type": "awareness", "target": 300000, "metric": "impressions"},
            {"type": "engagement", "target": 15000, "metric": "likes"},
            {"type": "conversion", "target": 200, "metric": "sales"}
          ],
          requirements: {
            "platforms": ["youtube", "instagram"],
            "categories": ["fitness", "health", "nutrition", "gym", "workout", "protein"],
            "minFollowers": 30000,
            "maxFollowers": 300000,
            "targetDemographics": {
              "ageRange": ["18-35"],
              "interests": ["fitness", "bodybuilding", "nutrition", "health", "gym", "protein", "supplements"]
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
      ], { onConflict: 'id' })
      .select()

    if (campaignError) {
      console.warn('⚠️ Campaign insert warning:', campaignError.message)
    } else {
      console.log('✅ Successfully added/updated protein shake campaign')
    }

    // Add campaign-KOL relationship
    const { data: kolRelation, error: kolError } = await supabase
      .from('campaign_kols')
      .upsert([
        {
          campaign_id: 'c3333333-3333-3333-3333-333333333333',
          kol_id: 'k5555555-5555-5555-5555-555555555555', // Fitness Coach Sam
          status: 'invited',
          proposed_rate: null,
          agreed_rate: null
        }
      ], { onConflict: 'campaign_id,kol_id' })
      .select()

    if (kolError) {
      console.warn('⚠️ KOL relationship warning:', kolError.message)
    } else {
      console.log('✅ Added campaign-KOL relationship for Fitness Coach Sam')
    }

    console.log('\n🎉 Test data setup complete!')
    console.log('Now you can test with:')
    console.log('- Email: techreviewer@example.com')
    console.log('- Password: password123') 
    console.log('- Profile should now show gym/fitness focus')
    console.log('- AI Campaign Matching should find the protein shake campaign')

  } catch (error) {
    console.error('❌ Error setting up test data:', error)
  }
}

setupTestData()