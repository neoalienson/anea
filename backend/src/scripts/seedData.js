/**
 * Seed Data Script
 * Creates sample KOLs and campaigns for testing the matching system
 */

const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');

const seedData = {
  // Sample KOLs across different industries
  kols: [
    {
      email: 'fitness.jenny@example.com',
      display_name: 'Fitness Jenny',
      bio: 'Hong Kong fitness enthusiast sharing workout tips and healthy lifestyle content',
      categories: ['fitness', 'health', 'lifestyle'],
      social_links: { instagram: '@fitnessjennyHK', youtube: 'FitnessJennyHK' },
      followers: 75000,
      engagement_rate: 0.045,
      platform: 'instagram'
    },
    {
      email: 'foodie.alex@example.com',
      display_name: 'Foodie Alex',
      bio: 'Hong Kong food blogger exploring the best restaurants and street food',
      categories: ['food', 'restaurants', 'lifestyle'],
      social_links: { instagram: '@foodiealexhk', tiktok: '@foodiealexhk' },
      followers: 120000,
      engagement_rate: 0.038,
      platform: 'instagram'
    },
    {
      email: 'tech.david@example.com',
      display_name: 'Tech David',
      bio: 'Technology reviewer and startup enthusiast in Hong Kong',
      categories: ['technology', 'gadgets', 'startups'],
      social_links: { youtube: 'TechDavidHK', instagram: '@techdavidhk' },
      followers: 95000,
      engagement_rate: 0.052,
      platform: 'youtube'
    },
    {
      email: 'fashion.sophia@example.com',
      display_name: 'Fashion Sophia',
      bio: 'Fashion influencer showcasing Hong Kong street style and luxury brands',
      categories: ['fashion', 'beauty', 'lifestyle'],
      social_links: { instagram: '@fashionsophiahk', tiktok: '@fashionsophia' },
      followers: 180000,
      engagement_rate: 0.041,
      platform: 'instagram'
    },
    {
      email: 'travel.kevin@example.com',
      display_name: 'Travel Kevin',
      bio: 'Travel content creator exploring Asia and sharing hidden gems',
      categories: ['travel', 'lifestyle', 'photography'],
      social_links: { instagram: '@travelkevinhk', youtube: 'TravelKevinHK' },
      followers: 65000,
      engagement_rate: 0.048,
      platform: 'instagram'
    },
    {
      email: 'gaming.lisa@example.com',
      display_name: 'Gaming Lisa',
      bio: 'Professional gamer and streaming content creator',
      categories: ['gaming', 'technology', 'entertainment'],
      social_links: { twitch: 'GamingLisaHK', youtube: 'GamingLisaHK' },
      followers: 85000,
      engagement_rate: 0.056,
      platform: 'twitch'
    }
  ],

  // Sample businesses with different requirements
  businesses: [
    {
      email: 'marketing@gymtech.com',
      company_name: 'GymTech Solutions',
      industry: 'fitness',
      description: 'Smart fitness equipment company',
      target_audience: {
        age_groups: ['25-34', '35-44'],
        interests: ['fitness', 'technology', 'health']
      },
      budget_range: { min: 5000, max: 15000 }
    },
    {
      email: 'hello@fooddeliveryco.com',
      company_name: 'FoodDelivery Co.',
      industry: 'food',
      description: 'Premium food delivery service in Hong Kong',
      target_audience: {
        age_groups: ['20-29', '30-39'],
        interests: ['food', 'convenience', 'lifestyle']
      },
      budget_range: { min: 8000, max: 25000 }
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // 1. Create KOL users and profiles
    console.log('Creating KOL users...');
    for (const kol of seedData.kols) {
      // Create user
      const passwordHash = await bcrypt.hash('password123', 12);
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: kol.email,
          password_hash: passwordHash,
          role: 'kol',
          is_verified: true,
          is_active: true
        })
        .select()
        .single();

      if (userError && !userError.message.includes('duplicate key')) {
        console.error('User creation error:', userError);
        continue;
      }

      if (user) {
        // Create KOL profile
        const { error: profileError } = await supabase
          .from('kol_profiles')
          .insert({
            user_id: user.id,
            display_name: kol.display_name,
            bio: kol.bio,
            categories: kol.categories,
            social_links: kol.social_links
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Create analytics data
        const { error: analyticsError } = await supabase
          .from('kol_analytics')
          .insert({
            kol_id: user.id,
            platform: kol.platform,
            followers: kol.followers,
            engagement_rate: kol.engagement_rate,
            average_views: Math.round(kol.followers * kol.engagement_rate * 0.8),
            audience_demographics: {
              age_groups: ['25-34', '18-24', '35-44'],
              location: 'Hong Kong',
              gender: { male: 45, female: 55 }
            },
            last_updated: new Date().toISOString()
          });

        if (analyticsError) {
          console.error('Analytics creation error:', analyticsError);
        }

        console.log(`✅ Created KOL: ${kol.display_name}`);
      }
    }

    // 2. Create business users and profiles
    console.log('Creating business users...');
    for (const business of seedData.businesses) {
      const passwordHash = await bcrypt.hash('password123', 12);
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: business.email,
          password_hash: passwordHash,
          role: 'business',
          is_verified: true,
          is_active: true
        })
        .select()
        .single();

      if (userError && !userError.message.includes('duplicate key')) {
        console.error('Business user creation error:', userError);
        continue;
      }

      if (user) {
        // Create business profile
        const { error: profileError } = await supabase
          .from('business_profiles')
          .insert({
            user_id: user.id,
            company_name: business.company_name,
            industry: business.industry,
            company_size: 'medium',
            description: business.description,
            target_audience: business.target_audience,
            budget_range: business.budget_range
          });

        if (profileError) {
          console.error('Business profile creation error:', profileError);
        }

        // Create sample campaigns
        const campaigns = [
          {
            business_id: user.id,
            title: `${business.company_name} Brand Partnership`,
            description: `Looking for influencers to promote our ${business.industry} products`,
            objectives: { 
              reach: 100000, 
              engagement: 5000,
              industry: business.industry
            },
            requirements: {
              industry: business.industry,
              categories: [business.industry, 'lifestyle'],
              target_audience: business.target_audience
            },
            budget: business.budget_range,
            timeline: {
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            status: 'active',
            deliverables: [
              'Instagram posts (2-3 posts)',
              'Instagram stories (5-7 stories)',
              'Product review video'
            ]
          }
        ];

        for (const campaign of campaigns) {
          const { error: campaignError } = await supabase
            .from('campaigns')
            .insert(campaign);

          if (campaignError) {
            console.error('Campaign creation error:', campaignError);
          }
        }

        console.log(`✅ Created business: ${business.company_name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Created:');
    console.log(`- ${seedData.kols.length} KOL users with profiles and analytics`);
    console.log(`- ${seedData.businesses.length} Business users with profiles and campaigns`);
    console.log('\n🔐 Test credentials:');
    console.log('KOLs: fitness.jenny@example.com / password123');
    console.log('Business: marketing@gymtech.com / password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = { seedData, seedDatabase };