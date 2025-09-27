'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Card, CardContent, 
  Grid, LinearProgress, Alert, Chip, Divider,
  Paper, Avatar, List, ListItem, ListItemText, ListItemIcon, Button
} from '@mui/material'
import { 
  Analytics, Campaign, People, TrendingUp, Star,
  MonetizationOn, YouTube, Instagram, ThumbUp, Comment,
  Share, Visibility, Security, Verified, EmojiEvents,
  Business, Timeline, Assessment, BarChart, ArrowBack
} from '@mui/icons-material'

interface AnalyticsData {
  campaigns?: {
    total: number
    active: number
    draft: number
    completed: number
    totalBudget: number
  }
  applications?: {
    total: number
    applied: number
    accepted: number
    declined: number
    completed: number
    successRate?: string
  }
  contentMetrics?: {
    youtubeSubscribers: number
    instagramFollowers: number
    youtubeEngagement: number
    instagramEngagement: number
    contentQuality: number
    nicheAuthority: number
    brandSafety: number
    authenticity: number
  }
  businessMetrics?: {
    companyRating: number
    reviewCount: number
    websiteTraffic: number
    linkedinFollowers: number
    financialStability: number
    sustainabilityRating: number
  }
  brandCollaborations?: {
    totalDeals: number
    averageDealValue: number
    industriesWorked: number
    collaborationReadiness: boolean
  }
  platformAnalytics?: Array<{
    platform: string
    followers: number
    engagement: number
    averageViews: number
    demographics: any
  }>
  performanceMetrics?: {
    avgLikes: number
    avgComments: number
    avgShares: number
    viralContent: number
  }
  timeSeriesData?: Array<{
    date: string
    campaign: string
    budget: number
    status: string
  }>
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (session?.user?.id) {
      fetchAnalytics()
    }
  }, [status, session, router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const userRole = (session?.user as any)?.role
      const response = await fetch(`/api/analytics?userId=${session?.user?.id}&role=${userRole}`)
      
      if (response.ok) {
        const result = await response.json()
        setAnalyticsData(result.data)
      } else {
        setMessage('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setMessage('Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6">Loading analytics...</Typography>
          <LinearProgress sx={{ mt: 2, maxWidth: 400, mx: 'auto' }} />
        </Box>
      </Container>
    )
  }

  if (!session) return null

  const isKOL = (session.user as any)?.role === 'kol'
  const isBusiness = (session.user as any)?.role === 'business'

  if (isKOL) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/dashboard')}
            sx={{ mb: 3 }}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            🎬 KOL Analytics Dashboard
          </Typography>

          {message && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          {/* Application Performance Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{analyticsData.applications?.total || 0}</Typography>
                  <Typography variant="body2">Total Applications</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Verified sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{analyticsData.applications?.accepted || 0}</Typography>
                  <Typography variant="body2">Accepted</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Timeline sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{analyticsData.applications?.applied || 0}</Typography>
                  <Typography variant="body2">Pending</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{analyticsData.applications?.successRate || '0'}%</Typography>
                  <Typography variant="body2">Success Rate</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Platform Performance */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <YouTube sx={{ mr: 1, color: '#FF0000' }} />
                    YouTube Analytics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Subscribers</Typography>
                      <Typography variant="h4" color="primary.main">
                        {analyticsData.contentMetrics?.youtubeSubscribers?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Engagement Rate</Typography>
                      <Typography variant="h4" color="success.main">
                        {((analyticsData.contentMetrics?.youtubeEngagement || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Instagram sx={{ mr: 1, color: '#E4405F' }} />
                    Instagram Analytics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Followers</Typography>
                      <Typography variant="h4" color="primary.main">
                        {analyticsData.contentMetrics?.instagramFollowers?.toLocaleString() || '0'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Engagement Rate</Typography>
                      <Typography variant="h4" color="success.main">
                        {((analyticsData.contentMetrics?.instagramEngagement || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Content Performance Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ThumbUp sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5">{analyticsData.performanceMetrics?.avgLikes?.toLocaleString() || '0'}</Typography>
                  <Typography variant="body2" color="text.secondary">Avg Likes/Post</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Comment sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                  <Typography variant="h5">{analyticsData.performanceMetrics?.avgComments?.toLocaleString() || '0'}</Typography>
                  <Typography variant="body2" color="text.secondary">Avg Comments/Post</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Share sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                  <Typography variant="h5">{analyticsData.performanceMetrics?.avgShares?.toLocaleString() || '0'}</Typography>
                  <Typography variant="body2" color="text.secondary">Avg Shares/Post</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmojiEvents sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h5">{analyticsData.performanceMetrics?.viralContent || '0'}</Typography>
                  <Typography variant="body2" color="text.secondary">Viral Posts</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quality & Trust Scores */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ mr: 1, color: 'warning.main' }} />
                    Content Quality
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3" color="warning.main">
                      {analyticsData.contentMetrics?.contentQuality?.toFixed(1) || '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Out of 10</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(analyticsData.contentMetrics?.contentQuality || 0) * 10} 
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Security sx={{ mr: 1, color: 'primary.main' }} />
                    Brand Safety
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3" color="primary.main">
                      {analyticsData.contentMetrics?.brandSafety?.toFixed(1) || '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Safety Score</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(analyticsData.contentMetrics?.brandSafety || 0) * 10} 
                      color="primary"
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmojiEvents sx={{ mr: 1, color: 'success.main' }} />
                    Niche Authority
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3" color="success.main">
                      {analyticsData.contentMetrics?.nicheAuthority?.toFixed(1) || '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Authority Score</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(analyticsData.contentMetrics?.nicheAuthority || 0) * 10} 
                      color="success"
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    )
  }

  if (isBusiness) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/dashboard')}
            sx={{ mb: 3 }}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            🏢 Business Analytics Dashboard
          </Typography>

          {message && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMessage('')}>
              {message}
            </Alert>
          )}

          {/* Campaign Performance Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Campaign sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{analyticsData.campaigns?.total || 0}</Typography>
                  <Typography variant="body2">Total Campaigns</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Verified sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{analyticsData.campaigns?.active || 0}</Typography>
                  <Typography variant="body2">Active Campaigns</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">{analyticsData.applications?.total || 0}</Typography>
                  <Typography variant="body2">Total Applications</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MonetizationOn sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4">${(analyticsData.campaigns?.totalBudget || 0).toLocaleString()}</Typography>
                  <Typography variant="body2">Total Budget</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Application Analytics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BarChart sx={{ mr: 1, color: 'primary.main' }} />
                    Application Status Breakdown
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Applied</Typography>
                      <Typography variant="body2">{analyticsData.applications?.applied || 0}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={analyticsData.applications?.total ? (analyticsData.applications.applied / analyticsData.applications.total) * 100 : 0}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Accepted</Typography>
                      <Typography variant="body2">{analyticsData.applications?.accepted || 0}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={analyticsData.applications?.total ? (analyticsData.applications.accepted / analyticsData.applications.total) * 100 : 0}
                      color="success"
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Declined</Typography>
                      <Typography variant="body2">{analyticsData.applications?.declined || 0}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={analyticsData.applications?.total ? (analyticsData.applications.declined / analyticsData.applications.total) * 100 : 0}
                      color="error"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <MonetizationOn sx={{ mr: 1, color: 'success.main' }} />
                    Brand Collaboration Insights
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Total Deals</Typography>
                      <Typography variant="h4" color="info.main">{analyticsData.brandCollaborations?.totalDeals || 0}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Avg Deal Value</Typography>
                      <Typography variant="h4" color="success.main">
                        ${(analyticsData.brandCollaborations?.averageDealValue || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {analyticsData.brandCollaborations?.collaborationReadiness ? (
                      <>
                        <Verified sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main">Ready for Collaborations</Typography>
                      </>
                    ) : (
                      <>
                        <Timeline sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="body2" color="warning.main">Profile Enhancement Needed</Typography>
                      </>
                    )}
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
          Analytics not available for your user role.
        </Typography>
      </Box>
    </Container>
  )
}
