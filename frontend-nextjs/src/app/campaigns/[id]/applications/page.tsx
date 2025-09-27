'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Container, Typography, Box, Card, CardContent, 
  Grid, Chip, Alert, Avatar, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, FormControl, InputLabel, 
  Select, MenuItem, TextField, CardActionArea, Divider
} from '@mui/material'
import { 
  ArrowBack, People, Visibility, FilterList, 
  YouTube, Instagram, CheckCircle, Pending, Cancel, MusicNote 
} from '@mui/icons-material'

interface ApplicationData {
  id: string
  status: string
  created_at: string
  kol_id: string
  users: {
    id: string
    email: string
    role: string
  }
  kol_profiles: {
    display_name: string
    bio: string
    avatar: string
    categories: string[]
    social_links: any
    audience_metrics: any
    verification_status: string
  }[]
  kol_analytics: {
    platform: string
    followers: number
    engagement_rate: number
    average_views: number
    audience_demographics: any
  }[]
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return <YouTube sx={{ color: '#FF0000' }} />
    case 'instagram':
      return <Instagram sx={{ color: '#E4405F' }} />
    case 'tiktok':
      return <MusicNote sx={{ color: '#000000' }} />
    default:
      return <People />
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'applied':
      return <Pending sx={{ color: 'warning.main' }} />
    case 'accepted':
      return <CheckCircle sx={{ color: 'success.main' }} />
    case 'declined':
      return <Cancel sx={{ color: 'error.main' }} />
    case 'completed':
      return <CheckCircle sx={{ color: 'success.main' }} />
    default:
      return <Pending sx={{ color: 'grey.500' }} />
  }
}

export default function CampaignApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedKol, setSelectedKol] = useState<ApplicationData | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    platform: 'all',
    minFollowers: '',
    maxFollowers: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (campaignId) {
      fetchApplications()
    }
  }, [status, campaignId, router])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      if (filters.status !== 'all') queryParams.append('status', filters.status)
      if (filters.platform !== 'all') queryParams.append('platform', filters.platform)
      if (filters.minFollowers) queryParams.append('minFollowers', filters.minFollowers)
      if (filters.maxFollowers) queryParams.append('maxFollowers', filters.maxFollowers)

      const response = await fetch(`/api/campaigns/${campaignId}/applications?${queryParams}`)
      
      if (response.ok) {
        const result = await response.json()
        setApplications(result.data || [])
      } else {
        setMessage('Failed to load applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      setMessage('Error loading applications')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const applyFilters = () => {
    fetchApplications()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      platform: 'all',
      minFollowers: '',
      maxFollowers: ''
    })
  }

  const getMaxFollowers = (analytics: any[]) => {
    if (!analytics || analytics.length === 0) return 0
    return Math.max(...analytics.map(a => a.followers || 0))
  }

  const getEngagementRate = (analytics: any[]) => {
    if (!analytics || analytics.length === 0) return 0
    const avgEngagement = analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / analytics.length
    return (avgEngagement * 100).toFixed(2)
  }

  if (status === 'loading' || loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Loading applications...</Typography>
        </Box>
      </Container>
    )
  }

  if (!session) return null

  const isBusiness = (session.user as any)?.role === 'business'

  if (!isBusiness) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            This page is only available for business users.
          </Alert>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/campaigns/${campaignId}`)}
            sx={{ mr: 2 }}
          >
            Back to Campaign
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Campaign Applications
          </Typography>
          <Button
            startIcon={<FilterList />}
            onClick={() => setShowFilters(true)}
            variant="outlined"
          >
            Filters
          </Button>
        </Box>

        {message && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {applications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <People sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Applications Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No KOLs have applied to this campaign yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {applications.map((application) => {
              const profile = application.kol_profiles?.[0]
              const maxFollowers = getMaxFollowers(application.kol_analytics)
              const engagementRate = getEngagementRate(application.kol_analytics)

              return (
                <Grid item xs={12} md={6} lg={4} key={application.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardActionArea 
                      onClick={() => setSelectedKol(application)}
                      sx={{ height: '100%' }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={profile?.avatar} 
                            sx={{ mr: 2, width: 48, height: 48 }}
                          >
                            {profile?.display_name?.charAt(0)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">
                              {profile?.display_name || 'Unknown KOL'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.users?.email}
                            </Typography>
                          </Box>
                          {getStatusIcon(application.status)}
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                          {profile?.bio || 'No bio available'}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium" gutterBottom>
                            Analytics:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Max Followers: {maxFollowers.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Avg Engagement: {engagementRate}%
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Platforms:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {application.kol_analytics?.map((analytics, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                                {getPlatformIcon(analytics.platform)}
                              </Box>
                            ))}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                          <Chip 
                            label={application.status} 
                            color={application.status === 'applied' ? 'warning' : 
                                   application.status === 'accepted' ? 'success' : 'default'}
                            size="small"
                          />
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedKol(application)
                            }}
                          >
                            View Profile
                          </Button>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}

        {/* Filters Dialog */}
        <Dialog open={showFilters} onClose={() => setShowFilters(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Filter Applications</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="applied">Applied</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="declined">Declined</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={filters.platform}
                  label="Platform"
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                >
                  <MenuItem value="all">All Platforms</MenuItem>
                  <MenuItem value="youtube">YouTube</MenuItem>
                  <MenuItem value="instagram">Instagram</MenuItem>
                  <MenuItem value="tiktok">TikTok</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Minimum Followers"
                value={filters.minFollowers}
                onChange={(e) => handleFilterChange('minFollowers', e.target.value)}
              />

              <TextField
                fullWidth
                type="number"
                label="Maximum Followers"
                value={filters.maxFollowers}
                onChange={(e) => handleFilterChange('maxFollowers', e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={clearFilters}>Clear</Button>
            <Button onClick={() => setShowFilters(false)}>Cancel</Button>
            <Button onClick={applyFilters} variant="contained">Apply Filters</Button>
          </DialogActions>
        </Dialog>

        {/* KOL Profile Modal */}
        <Dialog 
          open={!!selectedKol} 
          onClose={() => setSelectedKol(null)} 
          maxWidth="md" 
          fullWidth
        >
          {selectedKol && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={selectedKol.kol_profiles?.[0]?.avatar} 
                    sx={{ mr: 2, width: 56, height: 56 }}
                  >
                    {selectedKol.kol_profiles?.[0]?.display_name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedKol.kol_profiles?.[0]?.display_name || 'Unknown KOL'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedKol.users?.email}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Bio</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedKol.kol_profiles?.[0]?.bio || 'No bio available'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Categories</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedKol.kol_profiles?.[0]?.categories?.map((category, index) => (
                      <Chip key={index} label={category} size="small" />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Platform Analytics</Typography>
                  <Grid container spacing={2}>
                    {selectedKol.kol_analytics?.map((analytics, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {getPlatformIcon(analytics.platform)}
                              <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                                {analytics.platform}
                              </Typography>
                            </Box>
                            <Typography variant="body2">
                              Followers: {analytics.followers?.toLocaleString()}
                            </Typography>
                            <Typography variant="body2">
                              Engagement: {(analytics.engagement_rate * 100).toFixed(2)}%
                            </Typography>
                            <Typography variant="body2">
                              Avg Views: {analytics.average_views?.toLocaleString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="h6" gutterBottom>Application Status</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(selectedKol.status)}
                    <Chip 
                      label={selectedKol.status} 
                      color={selectedKol.status === 'applied' ? 'warning' : 
                             selectedKol.status === 'accepted' ? 'success' : 'default'}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Applied: {new Date(selectedKol.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedKol(null)}>Close</Button>
                {selectedKol.status === 'applied' && (
                  <>
                    <Button color="error" variant="outlined">
                      Decline
                    </Button>
                    <Button color="success" variant="contained">
                      Accept
                    </Button>
                  </>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  )
}
