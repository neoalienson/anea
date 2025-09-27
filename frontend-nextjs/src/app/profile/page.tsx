'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Paper, TextField, Button, 
  Grid, Card, CardContent, Alert, CircularProgress, Chip,
  LinearProgress, Avatar, Divider, List, ListItem, ListItemText,
  ListItemIcon, Rating, Tooltip
} from '@mui/material'
import { 
  YouTube, Twitter, Refresh, Instagram, TrendingUp, 
  Star, Verified, Timeline, People, MonetizationOn,
  Analytics, ThumbUp, Share, Comment, Visibility,
  Security, EmojiEvents, School
} from '@mui/icons-material'

interface KOLProfile {
  display_name: string
  bio: string
  social_links: Array<{platform: string, url: string, handle?: string}>
  audience_metrics?: {
    totalFollowers: number
    engagementRate: number
    averageViews: number
  }
  // Enhanced KOL Signals
  instagram_follower_count?: number
  youtube_subscriber_count?: number
  instagram_engagement_rate?: number
  youtube_engagement_rate?: number
  topics_covered_youtube?: string[]
  topics_covered_instagram?: string[]
  content_frequency?: {youtube: number, instagram: number}
  content_quality_score?: number
  previous_brand_deals?: Array<{brand: string, year: number, type: string, value: number}>
  industries_worked_with?: string[]
  products_advertised?: string[]
  average_brand_deal_value?: number
  account_age_months?: number
  activity_consistency_score?: number
  peak_posting_hours?: number[]
  seasonal_trends?: {peak_months: string[], low_months: string[]}
  audience_age_distribution?: {[key: string]: number}
  audience_gender_split?: {male: number, female: number, other: number}
  audience_location_top_cities?: string[]
  audience_interests?: string[]
  average_likes_per_post?: number
  average_comments_per_post?: number
  average_shares_per_post?: number
  viral_content_count?: number
  fake_follower_percentage?: number
  brand_safety_score?: number
  content_authenticity_score?: number
  community_sentiment_score?: number
  niche_authority_score?: number
  expert_topics?: string[]
  collaboration_readiness?: boolean
}

interface BusinessProfile {
  company_name: string
  industry: string
  company_size: string
  website: string
  description: string
  // Enhanced SMB Business Intelligence Signals
  legal_business_name?: string
  business_registration_number?: string
  tax_id?: string
  founded_year?: number
  business_type?: string
  annual_revenue?: number
  revenue_growth_rate?: number
  profit_margin?: number
  employee_count?: number
  employee_growth_rate?: number
  funding_raised?: number
  funding_stage?: string
  stock_ticker?: string
  market_cap?: number
  headquarters_address?: {street: string, city: string, state: string, country: string, zipcode: string}
  operating_countries?: string[]
  office_locations?: Array<{city: string, type: string, employees: number}>
  franchise_count?: number
  retail_locations?: number
  primary_industry?: string
  secondary_industries?: string[]
  industry_rank?: number
  market_share_percentage?: number
  key_competitors?: string[]
  primary_products?: string[]
  secondary_products?: string[]
  service_categories?: string[]
  product_portfolio_size?: number
  linkedin_company_url?: string
  linkedin_followers?: number
  linkedin_engagement_rate?: number
  google_maps_rating?: number
  google_maps_review_count?: number
  website_traffic_rank?: number
  website_monthly_visitors?: number
  domain_authority?: number
  social_media_presence?: {[key: string]: {followers: number, engagement: number}}
  brand_mention_sentiment?: number
  online_reputation_score?: number
  business_model?: string
  revenue_streams?: string[]
  target_market_segments?: string[]
  seasonal_business_patterns?: {[key: string]: string}
  industry_certifications?: string[]
  compliance_standards?: string[]
  quality_ratings?: {[key: string]: number}
  technology_stack?: string[]
  digital_transformation_score?: number
  innovation_index?: number
  key_partnerships?: string[]
  supplier_network_size?: number
  customer_segments?: string[]
  financial_stability_score?: number
  credit_rating?: string
  business_risk_score?: number
  advertising_spend_annual?: number
  marketing_channels?: string[]
  brand_awareness_score?: number
  customer_acquisition_cost?: number
  customer_lifetime_value?: number
  sustainability_rating?: number
  environmental_certifications?: string[]
  social_responsibility_score?: number
  governance_score?: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<KOLProfile>({
    display_name: '',
    bio: '',
    social_links: []
  })
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    company_name: '',
    industry: '',
    company_size: '',
    website: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [language, setLanguage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    // Allow both KOL and business users to access profile
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.id) {
      if (session?.user?.role === 'kol') {
        fetchProfile()
      } else if (session?.user?.role === 'business') {
        fetchBusinessProfile()
      }
    }
  }, [session?.user?.id, session?.user?.role])

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', session?.user?.id)
      const response = await fetch(`/api/profile/${session?.user?.id}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Profile data:', result.data)
        const data = result.data
        
        if (data && Object.keys(data).length > 0) {
          setProfile({
            display_name: data.display_name || '',
            bio: data.bio || '',
            social_links: data.social_links || [],
            audience_metrics: data.audience_metrics
          })
          
          const youtube = data.social_links?.find((link: any) => link.platform === 'youtube')
          const twitter = data.social_links?.find((link: any) => link.platform === 'twitter')
          
          if (youtube) setYoutubeUrl(youtube.url)
          if (twitter) setTwitterHandle(twitter.handle || '')
          if (data.content_style?.language) setLanguage(data.content_style.language)
        }
      } else {
        console.error('Failed to fetch profile:', response.status)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchBusinessProfile = async () => {
    try {
      console.log('Fetching business profile for user:', session?.user?.id)
      const response = await fetch(`/api/profile/${session?.user?.id}?type=business`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Business profile data:', result.data)
        const data = result.data
        
        if (data && Object.keys(data).length > 0) {
          setBusinessProfile(data)
        }
      } else {
        console.error('Failed to fetch business profile:', response.status)
      }
    } catch (error) {
      console.error('Error fetching business profile:', error)
    }
  }

  const updateProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          display_name: profile.display_name,
          bio: profile.bio,
          youtubeUrl,
          twitterHandle,
          language
        })
      })

      if (response.ok) {
        setMessage('Profile updated successfully!')
        fetchProfile()
      } else {
        setMessage('Failed to update profile')
      }
    } catch (error) {
      setMessage('Error updating profile')
    }
    setLoading(false)
  }

  const loadYouTubeMetrics = async () => {
    if (!youtubeUrl) {
      setMessage('Please enter YouTube URL first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/youtube/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session?.user?.id,
          youtubeUrl 
        })
      })

      if (response.ok) {
        const result = await response.json()
        setProfile(prev => ({ ...prev, audience_metrics: result.data }))
        setMessage('YouTube metrics loaded successfully!')
      } else {
        setMessage('Failed to load YouTube metrics')
      }
    } catch (error) {
      setMessage('Error loading YouTube metrics')
    }
    setLoading(false)
  }

  if (status === 'loading') return <Typography>Loading...</Typography>
  if (!session) return null

  const isKOL = session.user?.role === 'kol'
  const isBusiness = session.user?.role === 'business'

  if (isKOL) {
    return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          KOL Profile
        </Typography>

        {message && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                margin="normal"
              />
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                name="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                margin="normal"
              />

              <TextField
                fullWidth
                label="YouTube Channel URL"
                name="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: <YouTube sx={{ mr: 1, color: 'red' }} />
                }}
                placeholder="https://youtube.com/@yourchannel"
              />
              
              <TextField
                fullWidth
                label="Twitter Handle"
                name="twitterHandle"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: <Twitter sx={{ mr: 1, color: 'primary.main' }} />
                }}
                placeholder="@yourusername"
              />
              
              <TextField
                fullWidth
                label="Primary Language"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                margin="normal"
                placeholder="English, Spanish, etc."
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={updateProfile}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Update Profile'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={loadYouTubeMetrics}
                  disabled={loading || !youtubeUrl}
                  startIcon={<Refresh />}
                >
                  Load YouTube Metrics
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Metrics
                </Typography>
                
                {profile.audience_metrics ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Subscribers: {profile.audience_metrics.totalFollowers?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Engagement Rate: {(profile.audience_metrics.engagementRate * 100).toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Views: {profile.audience_metrics.averageViews?.toLocaleString()}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No metrics loaded. Add YouTube URL and click "Load YouTube Metrics"
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced KOL Profile Dashboard */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            📊 Enhanced KOL Analytics Dashboard
          </Typography>

          {/* Platform Metrics Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <YouTube sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6">YouTube Performance</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h4">{profile.youtube_subscriber_count?.toLocaleString() || '0'}</Typography>
                      <Typography variant="body2">Subscribers</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h4">{((profile.youtube_engagement_rate || 0) * 100).toFixed(1)}%</Typography>
                      <Typography variant="body2">Engagement Rate</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Instagram sx={{ mr: 1, fontSize: 32 }} />
                    <Typography variant="h6">Instagram Performance</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h4">{profile.instagram_follower_count?.toLocaleString() || '0'}</Typography>
                      <Typography variant="body2">Followers</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h4">{((profile.instagram_engagement_rate || 0) * 100).toFixed(1)}%</Typography>
                      <Typography variant="body2">Engagement Rate</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Content & Quality Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Star sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6">Content Quality</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main">
                      {profile.content_quality_score?.toFixed(1) || '0.0'}
                    </Typography>
                    <Rating value={profile.content_quality_score ? profile.content_quality_score / 2 : 0} readOnly precision={0.1} />
                    <Typography variant="body2" color="text.secondary">Out of 10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Timeline sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Activity Score</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main">
                      {profile.activity_consistency_score?.toFixed(1) || '0.0'}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(profile.activity_consistency_score || 0) * 10} 
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary">Consistency Score</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MonetizationOn sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">Brand Value</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main">
                      ${profile.average_brand_deal_value?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Avg Deal Value</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.previous_brand_deals?.length || 0} deals completed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Trust & Authenticity Scores */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Security sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary.main">
                    {profile.brand_safety_score?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2">Brand Safety</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Verified sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {profile.content_authenticity_score?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2">Authenticity</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {profile.community_sentiment_score?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2">Community Sentiment</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <School sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {profile.niche_authority_score?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2">Niche Authority</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Insights */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Content Topics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🎬 Content Topics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary.main" gutterBottom>
                      YouTube Topics:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {profile.topics_covered_youtube?.map((topic, index) => (
                        <Chip key={index} label={topic} size="small" color="primary" variant="outlined" />
                      )) || <Typography variant="body2" color="text.secondary">No topics available</Typography>}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="secondary.main" gutterBottom>
                      Instagram Topics:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {profile.topics_covered_instagram?.map((topic, index) => (
                        <Chip key={index} label={topic} size="small" color="secondary" variant="outlined" />
                      )) || <Typography variant="body2" color="text.secondary">No topics available</Typography>}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Brand Collaboration History */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🤝 Recent Brand Collaborations
                  </Typography>
                  <List dense>
                    {profile.previous_brand_deals?.slice(0, 3).map((deal, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <MonetizationOn color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={deal.brand}
                          secondary={`${deal.type} - $${deal.value.toLocaleString()} (${deal.year})`}
                        />
                      </ListItem>
                    )) || (
                      <Typography variant="body2" color="text.secondary">
                        No brand deals recorded
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Performance Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📈 Performance Metrics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <ThumbUp sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h5">{profile.average_likes_per_post?.toLocaleString() || '0'}</Typography>
                        <Typography variant="body2" color="text.secondary">Avg Likes/Post</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Comment sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                        <Typography variant="h5">{profile.average_comments_per_post?.toLocaleString() || '0'}</Typography>
                        <Typography variant="body2" color="text.secondary">Avg Comments/Post</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Share sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                        <Typography variant="h5">{profile.average_shares_per_post?.toLocaleString() || '0'}</Typography>
                        <Typography variant="body2" color="text.secondary">Avg Shares/Post</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <TrendingUp sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h5">{profile.viral_content_count || '0'}</Typography>
                        <Typography variant="body2" color="text.secondary">Viral Posts</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Audience Insights */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    👥 Audience Demographics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Age Distribution:</Typography>
                    {profile.audience_age_distribution && Object.entries(profile.audience_age_distribution).map(([age, percentage]) => (
                      <Box key={age} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{age}</Typography>
                          <Typography variant="body2">{percentage}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={percentage} sx={{ height: 6, borderRadius: 3 }} />
                      </Box>
                    ))}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Top Locations:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {profile.audience_location_top_cities?.map((city, index) => (
                        <Chip key={index} label={city} size="small" variant="outlined" />
                      )) || <Typography variant="body2" color="text.secondary">No location data</Typography>}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🎯 Audience Interests & Expertise
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Top Interests:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {profile.audience_interests?.map((interest, index) => (
                        <Chip key={index} label={interest} size="small" color="info" />
                      )) || <Typography variant="body2" color="text.secondary">No interest data</Typography>}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Expert Topics:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {profile.expert_topics?.map((topic, index) => (
                        <Chip key={index} label={topic} size="small" color="success" />
                      )) || <Typography variant="body2" color="text.secondary">No expertise data</Typography>}
                    </Box>
                    {profile.collaboration_readiness && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Verified sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main">Ready for Brand Collaborations</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
    )
  }

  if (isBusiness) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🏢 Business Intelligence Dashboard
          </Typography>

          {message && (
            <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {/* Company Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>{businessProfile.company_name || 'Company Name'}</Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>{businessProfile.legal_business_name || 'Legal Business Name'}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={businessProfile.industry || 'Industry'} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    <Chip label={businessProfile.company_size || 'Size'} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    <Chip label={businessProfile.business_type || 'Type'} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                    {businessProfile.founded_year && <Chip label={`Est. ${businessProfile.founded_year}`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>🌍 Global Presence</Typography>
                  <Typography variant="h4" color="primary.main">{businessProfile.operating_countries?.length || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Countries</Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>{businessProfile.office_locations?.length || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">Office Locations</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Financial Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MonetizationOn sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">${(businessProfile.annual_revenue || 0).toLocaleString()}</Typography>
                  <Typography variant="body2">Annual Revenue</Typography>
                  {businessProfile.revenue_growth_rate && (
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                      +{businessProfile.revenue_growth_rate}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{businessProfile.employee_count || 0}</Typography>
                  <Typography variant="body2">Employees</Typography>
                  {businessProfile.employee_growth_rate && (
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                      +{businessProfile.employee_growth_rate}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Star sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{businessProfile.google_maps_rating || 0}</Typography>
                  <Typography variant="body2">Google Rating</Typography>
                  <Typography variant="caption">
                    {businessProfile.google_maps_review_count || 0} reviews
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #00BCD4 0%, #009688 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Analytics sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{businessProfile.website_monthly_visitors || 0}</Typography>
                  <Typography variant="body2">Monthly Visitors</Typography>
                  <Typography variant="caption">
                    DA: {businessProfile.domain_authority || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Business Intelligence Sections */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Products & Services */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ mr: 1, color: 'primary.main' }} />
                    Products & Services
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary.main" gutterBottom>Primary Products:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {businessProfile.primary_products?.map((product, index) => (
                        <Chip key={index} label={product} size="small" color="primary" />
                      )) || <Typography variant="body2" color="text.secondary">No products listed</Typography>}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="secondary.main" gutterBottom>Service Categories:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {businessProfile.service_categories?.map((service, index) => (
                        <Chip key={index} label={service} size="small" color="secondary" variant="outlined" />
                      )) || <Typography variant="body2" color="text.secondary">No services listed</Typography>}
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Portfolio Size: {businessProfile.product_portfolio_size || 0} items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Market Position */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                    Market Position
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Industry Rank</Typography>
                      <Typography variant="h4" color="primary.main">#{businessProfile.industry_rank || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Market Share</Typography>
                      <Typography variant="h4" color="success.main">{businessProfile.market_share_percentage || 0}%</Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>Key Competitors:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {businessProfile.key_competitors?.map((competitor, index) => (
                      <Chip key={index} label={competitor} size="small" variant="outlined" />
                    )) || <Typography variant="body2" color="text.secondary">No competitors listed</Typography>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Online Presence & Technology */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Analytics sx={{ mr: 1, color: 'info.main' }} />
                    Digital Presence
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>LinkedIn:</Typography>
                    <Typography variant="body2">{businessProfile.linkedin_followers?.toLocaleString() || 0} followers</Typography>
                    <Typography variant="body2">Engagement: {((businessProfile.linkedin_engagement_rate || 0) * 100).toFixed(2)}%</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Social Media Presence:</Typography>
                    {businessProfile.social_media_presence && Object.entries(businessProfile.social_media_presence).map(([platform, data]) => (
                      <Typography key={platform} variant="body2">
                        {platform}: {(data as any).followers?.toLocaleString()} followers
                      </Typography>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mr: 2 }}>Reputation Score:</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(businessProfile.online_reputation_score || 0) * 10} 
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>{businessProfile.online_reputation_score?.toFixed(1) || '0.0'}/10</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <School sx={{ mr: 1, color: 'warning.main' }} />
                    Technology & Innovation
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Technology Stack:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {businessProfile.technology_stack?.slice(0, 6).map((tech, index) => (
                        <Chip key={index} label={tech} size="small" color="info" variant="outlined" />
                      )) || <Typography variant="body2" color="text.secondary">No tech stack listed</Typography>}
                    </Box>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Digital Transformation</Typography>
                      <Typography variant="h5" color="info.main">{businessProfile.digital_transformation_score?.toFixed(1) || '0.0'}/10</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Innovation Index</Typography>
                      <Typography variant="h5" color="warning.main">{businessProfile.innovation_index?.toFixed(1) || '0.0'}/10</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Trust & ESG Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Security sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary.main">
                    {businessProfile.financial_stability_score?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2">Financial Stability</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Credit: {businessProfile.credit_rating || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {businessProfile.sustainability_rating?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2">Sustainability</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {businessProfile.social_responsibility_score?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2">Social Responsibility</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Verified sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {businessProfile.governance_score?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2">Governance</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Marketing Intelligence */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <MonetizationOn sx={{ mr: 1, color: 'success.main' }} />
                    Marketing Intelligence
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Annual Ad Spend</Typography>
                      <Typography variant="h5" color="success.main">
                        ${(businessProfile.advertising_spend_annual || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Brand Awareness</Typography>
                      <Typography variant="h5" color="primary.main">
                        {businessProfile.brand_awareness_score?.toFixed(1) || '0.0'}/10
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">CAC</Typography>
                      <Typography variant="body1">${businessProfile.customer_acquisition_cost || 0}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">LTV</Typography>
                      <Typography variant="body1">${businessProfile.customer_lifetime_value || 0}</Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>Marketing Channels:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {businessProfile.marketing_channels?.map((channel, index) => (
                      <Chip key={index} label={channel} size="small" color="success" variant="outlined" />
                    )) || <Typography variant="body2" color="text.secondary">No channels listed</Typography>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ mr: 1, color: 'warning.main' }} />
                    Business Operations
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Business Model:</Typography>
                    <Typography variant="h6" color="primary.main">{businessProfile.business_model || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Revenue Streams:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {businessProfile.revenue_streams?.map((stream, index) => (
                        <Chip key={index} label={stream} size="small" color="primary" />
                      )) || <Typography variant="body2" color="text.secondary">No revenue streams listed</Typography>}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Target Markets:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {businessProfile.target_market_segments?.map((segment, index) => (
                        <Chip key={index} label={segment} size="small" color="secondary" variant="outlined" />
                      )) || <Typography variant="body2" color="text.secondary">No target markets listed</Typography>}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          Profile access not available for your user role.
        </Typography>
      </Box>
    </Container>
  )
}