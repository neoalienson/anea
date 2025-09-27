'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Paper, TextField, Button, 
  Grid, Card, CardContent, Alert, CircularProgress
} from '@mui/material'
import { YouTube, Twitter, Refresh } from '@mui/icons-material'

interface KOLProfile {
  display_name: string
  bio: string
  social_links: Array<{platform: string, url: string, handle?: string}>
  audience_metrics?: {
    totalFollowers: number
    engagementRate: number
    averageViews: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<KOLProfile>({
    display_name: '',
    bio: '',
    social_links: []
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
    if (session?.user?.role !== 'kol') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.id && session?.user?.role === 'kol') {
      fetchProfile()
    }
  }, [session?.user?.id])

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
  if (!session || session.user?.role !== 'kol') return null

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
                  Channel Metrics
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
      </Box>
    </Container>
  )
}