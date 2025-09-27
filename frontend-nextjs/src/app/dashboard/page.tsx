'use client'

import { useSession } from 'next-auth/react'
import { 
  Container, Typography, Box, Paper, Grid, Card, CardContent, 
  Button, Avatar, LinearProgress, Chip, Divider
} from '@mui/material'
import { 
  TrendingUp, Campaign, People, Star, MonetizationOn,
  Analytics, Verified, EmojiEvents, Rocket, Notifications,
  Assignment, YouTube, Instagram, Schedule, Timeline
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [dashboardData, setDashboardData] = useState<any>({})
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session?.user?.id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const userRole = (session?.user as any)?.role
      
      if (userRole === 'business') {
        // Fetch business dashboard data
        const [campaignsRes, profileRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch(`/api/profile/${session?.user?.id}?type=business`)
        ])
        
        const campaigns = campaignsRes.ok ? await campaignsRes.json() : { data: [] }
        const profile = profileRes.ok ? await profileRes.json() : { data: {} }
        
        const activeCampaigns = campaigns.data?.filter((c: any) => c.status === 'active').length || 0
        const pendingCampaigns = campaigns.data?.filter((c: any) => c.status === 'draft').length || 0
        
        setDashboardData({
          activeCampaigns,
          pendingCampaigns,
          totalCampaigns: campaigns.data?.length || 0,
          profile: profile.data
        })
        
        // Generate recent activities from actual data
        const activities: any[] = []
        campaigns.data?.slice(0, 3).forEach((campaign: any) => {
          const daysSince = Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24))
          activities.push({
            type: 'campaign',
            message: `Campaign "${campaign.title}" ${campaign.status === 'active' ? 'went live' : 'was created'}`,
            time: daysSince === 0 ? 'Today' : `${daysSince} day${daysSince > 1 ? 's' : ''} ago`,
            icon: <Campaign />
          })
        })
        setRecentActivities(activities as any[])
        
      } else if (userRole === 'kol') {
        // Fetch KOL dashboard data
        const [applicationsRes, profileRes] = await Promise.all([
          fetch(`/api/my-applications?userId=${session?.user?.id}`),
          fetch(`/api/profile/${session?.user?.id}`)
        ])
        
        const applications = applicationsRes.ok ? await applicationsRes.json() : { data: [] }
        const profile = profileRes.ok ? await profileRes.json() : { data: {} }
        
        const activeApplications = applications.data?.filter((a: any) => a.status === 'applied' || a.status === 'accepted').length || 0
        const totalReach = profile.data?.youtube_subscriber_count || profile.data?.instagram_follower_count || 0
        const avgEngagement = profile.data?.youtube_engagement_rate || profile.data?.instagram_engagement_rate || 0
        
        setDashboardData({
          activeApplications,
          totalApplications: applications.data?.length || 0,
          totalReach,
          avgEngagement: (avgEngagement * 100).toFixed(1),
          profile: profile.data
        })
        
        // Generate recent activities from actual data
        const activities: any[] = []
        applications.data?.slice(0, 3).forEach((application: any) => {
          const daysSince = Math.floor((Date.now() - new Date(application.created_at).getTime()) / (1000 * 60 * 60 * 24))
          activities.push({
            type: 'application',
            message: `Applied to "${application.campaigns?.title || 'Campaign'}"`,
            time: daysSince === 0 ? 'Today' : `${daysSince} day${daysSince > 1 ? 's' : ''} ago`,
            icon: <Assignment />
          })
        })
        setRecentActivities(activities as any[])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6">Loading your dashboard...</Typography>
          <LinearProgress sx={{ mt: 2, maxWidth: 400, mx: 'auto' }} />
        </Box>
      </Container>
    )
  }

  if (!session) {
    return null
  }

  const userRole = (session.user as any)?.role
  const isKOL = userRole === 'kol'
  const isBusiness = userRole === 'business'
  const userName = session.user?.email?.split('@')[0] || 'User'

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '🌅 Good Morning'
    if (hour < 17) return '☀️ Good Afternoon'
    return '🌙 Good Evening'
  }

  // Dynamic stats based on actual database data
  const quickStats = isKOL ? [
    { label: 'Total Reach', value: dashboardData.totalReach?.toLocaleString() || '0', icon: <People />, color: '#1976d2', growth: '' },
    { label: 'Engagement Rate', value: `${dashboardData.avgEngagement || '0.0'}%`, icon: <TrendingUp />, color: '#2e7d32', growth: '' },
    { label: 'Active Applications', value: dashboardData.activeApplications?.toString() || '0', icon: <Campaign />, color: '#ed6c02', growth: '' },
    { label: 'Total Applications', value: dashboardData.totalApplications?.toString() || '0', icon: <Assignment />, color: '#0288d1', growth: '' }
  ] : [
    { label: 'Active Campaigns', value: dashboardData.activeCampaigns?.toString() || '0', icon: <Campaign />, color: '#1976d2', growth: '' },
    { label: 'Pending Campaigns', value: dashboardData.pendingCampaigns?.toString() || '0', icon: <Schedule />, color: '#ed6c02', growth: '' },
    { label: 'Total Campaigns', value: dashboardData.totalCampaigns?.toString() || '0', icon: <Analytics />, color: '#2e7d32', growth: '' },
    { label: 'Company Rating', value: `${dashboardData.profile?.google_maps_rating?.toFixed(1) || '0.0'} ⭐`, icon: <Star />, color: '#9c27b0', growth: '' }
  ]

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {getGreeting()}, {userName}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {isKOL ? '🎬 Content Creator Dashboard' : '🏢 Business Dashboard'} • {currentTime.toLocaleDateString()}
              </Typography>
            </Box>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}88 100%)`,
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1, borderRadius: 2 }}>
                      {stat.icon}
                    </Box>
                    <Chip 
                      label={stat.growth} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                  <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rocket sx={{ mr: 1, color: 'primary.main' }} />
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  {(isKOL ? [
                    { label: 'View Profile', path: '/profile', icon: <Star />, color: 'primary' },
                    { label: 'Browse Campaigns', path: '/campaigns', icon: <Campaign />, color: 'success' },
                    { label: 'My Applications', path: '/my-applications', icon: <Assignment />, color: 'info' },
                    { label: 'Analytics', path: '/analytics', icon: <Analytics />, color: 'warning' }
                  ] : [
                    { label: 'Create Campaign', path: '/campaigns', icon: <Campaign />, color: 'primary' },
                    { label: 'Discover KOLs', path: '/discover', icon: <People />, color: 'success' },
                    { label: 'View Analytics', path: '/analytics', icon: <Analytics />, color: 'info' },
                    { label: 'Manage Campaigns', path: '/campaigns', icon: <Schedule />, color: 'warning' }
                  ]).map((action, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={action.icon}
                        onClick={() => router.push(action.path)}
                        sx={{ 
                          py: 1.5,
                          borderColor: `${action.color}.main`,
                          color: `${action.color}.main`,
                          '&:hover': {
                            borderColor: `${action.color}.main`,
                            bgcolor: `${action.color}.main`,
                            color: 'white'
                          }
                        }}
                      >
                        {action.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ mr: 1, color: 'info.main' }} />
                  Recent Activity
                </Typography>
                <Box>
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                          <Box sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white', 
                            p: 1, 
                            borderRadius: '50%', 
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {activity.icon}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1">{activity.message}</Typography>
                            <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                          </Box>
                        </Box>
                        {index < recentActivities.length - 1 && <Divider />}
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Timeline sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {isKOL 
                          ? 'No recent activity. Start by applying to campaigns!' 
                          : 'No recent activity. Create your first campaign to get started!'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Profile Completion (KOL) or Campaign Status (Business) */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {isKOL ? '📋 Profile Completion' : '📊 Campaign Overview'}
                </Typography>
                {isKOL ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Profile Strength</Typography>
                      <Typography variant="body2">85%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Complete your social media verification to reach 100%
                    </Typography>
                    <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => router.push('/profile')}>
                      Complete Profile
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Active: {dashboardData.activeCampaigns || 0} campaigns
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={dashboardData.totalCampaigns > 0 ? (dashboardData.activeCampaigns / dashboardData.totalCampaigns) * 100 : 0} 
                        color="success" 
                        sx={{ height: 6, borderRadius: 3 }} 
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Pending: {dashboardData.pendingCampaigns || 0} campaigns
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={dashboardData.totalCampaigns > 0 ? (dashboardData.pendingCampaigns / dashboardData.totalCampaigns) * 100 : 0} 
                        color="warning" 
                        sx={{ height: 6, borderRadius: 3 }} 
                      />
                    </Box>
                    <Button variant="outlined" size="small" onClick={() => router.push('/campaigns')}>
                      Manage All
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {isKOL ? '📈 Performance Insights' : '🎯 Business Overview'}
                </Typography>
                {isKOL ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">YouTube Subscribers</Typography>
                      <Typography variant="body2" color="success.main">
                        {dashboardData.profile?.youtube_subscriber_count?.toLocaleString() || '0'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Instagram Followers</Typography>
                      <Typography variant="body2" color="warning.main">
                        {dashboardData.profile?.instagram_follower_count?.toLocaleString() || '0'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Content Quality Score</Typography>
                      <Typography variant="body2" color="info.main">
                        {dashboardData.profile?.content_quality_score?.toFixed(1) || '0.0'}/10
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {dashboardData.profile?.collaboration_readiness 
                        ? '🔥 Ready for brand collaborations!' 
                        : '📝 Complete your profile to unlock collaboration opportunities'}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Company: {dashboardData.profile?.company_name || 'Not set'}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Industry: {dashboardData.profile?.primary_industry || dashboardData.profile?.industry || 'Not specified'}
        </Typography>
                    <Typography variant="body2" gutterBottom>
                      Employees: {dashboardData.profile?.employee_count || 'Not specified'}
          </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {dashboardData.profile?.financial_stability_score 
                        ? `💼 Financial Stability Score: ${dashboardData.profile.financial_stability_score.toFixed(1)}/10`
                        : '📊 Complete your business profile for detailed insights'}
          </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer message */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {isKOL 
              ? '🚀 Ready to take your content to the next level? Explore new campaign opportunities and grow your audience!'
              : '🎯 Drive your brand forward with authentic influencer partnerships. Discover top KOLs for your next campaign!'
            }
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}