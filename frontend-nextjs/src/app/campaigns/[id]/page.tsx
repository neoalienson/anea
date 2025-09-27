'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Container, Typography, Box, Button, Card, CardContent, 
  Grid, Chip, Alert, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Paper, Divider, Avatar
} from '@mui/material'
import { 
  ArrowBack, Campaign, AttachMoney, Business, 
  CalendarToday, People, Send, CheckCircle 
} from '@mui/icons-material'

interface CampaignDetail {
  id: string
  title: string
  description: string
  budget: { total: number, currency: string }
  status: string
  requirements: { 
    categories: string[]
    minFollowers: number
    platforms: string[]
  }
  created_at: string
  business_id: string
}

export default function CampaignDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (campaignId) {
      fetchCampaign()
    }
  }, [status, campaignId, router])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      console.log('Fetching campaign with ID:', campaignId)
      const response = await fetch(`/api/campaigns/${campaignId}`)
      
      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)
      
      if (response.ok) {
        setCampaign(result.data)
      } else if (response.status === 404) {
        setMessage('Campaign not found')
      } else {
        setMessage(`Failed to load campaign: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
      setMessage('Error loading campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!session?.user?.id) return

    setApplying(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          message: applicationMessage
        })
      })

      if (response.ok) {
        setMessage('Application submitted successfully!')
        setHasApplied(true)
        setOpenApplicationDialog(false)
        setApplicationMessage('')
      } else {
        const result = await response.json()
        setMessage(result.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to campaign:', error)
      setMessage('Error submitting application')
    } finally {
      setApplying(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>Loading campaign...</Typography>
        </Box>
      </Container>
    )
  }

  if (!session) return null

  if (!campaign) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/campaigns')}
            sx={{ mb: 2 }}
          >
            Back to Campaigns
          </Button>
          <Alert severity="error">
            {message || 'Campaign not found'}
          </Alert>
        </Box>
      </Container>
    )
  }

  const isBusiness = (session.user as any)?.role === 'business'
  const isOwnCampaign = isBusiness && campaign.business_id === session.user?.id

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/campaigns')}
          sx={{ mb: 3 }}
        >
          Back to Campaigns
        </Button>

        {message && (
          <Alert 
            severity={message.includes('success') ? 'success' : 'error'} 
            sx={{ mb: 3 }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Main Campaign Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Campaign sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h4" component="h1">
                    {campaign.title}
                  </Typography>
                </Box>

                <Chip 
                  label={campaign.status} 
                  color={campaign.status === 'active' ? 'success' : 'default'}
                  sx={{ mb: 3 }}
                />

                <Typography variant="h6" gutterBottom>
                  Campaign Description
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  {campaign.description}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Categories:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {campaign.requirements?.categories?.map((category, index) => (
                      <Chip key={index} label={category} variant="outlined" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Platforms:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {campaign.requirements?.platforms?.map((platform, index) => (
                      <Chip key={index} label={platform} variant="outlined" color="primary" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Minimum Followers: {campaign.requirements?.minFollowers?.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Budget Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Budget</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  ${campaign.budget?.total?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {campaign.budget?.currency}
                </Typography>
              </CardContent>
            </Card>

            {/* Business Info Card - Temporarily disabled */}
            {/* TODO: Add business info back with proper join */}

            {/* Campaign Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Created: {new Date(campaign.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Application Button */}
            {!isBusiness && !isOwnCampaign && campaign.status === 'active' && (
              <Card>
                <CardContent>
                  {hasApplied ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                      <Typography variant="h6" color="success.main">
                        Application Submitted
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You have already applied to this campaign
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      onClick={() => setOpenApplicationDialog(true)}
                    >
                      Apply to Campaign
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Application Dialog */}
        <Dialog 
          open={openApplicationDialog} 
          onClose={() => setOpenApplicationDialog(false)}
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>Apply to Campaign</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Tell the business why you're interested in this campaign and what you can offer.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Application Message"
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Describe your experience, audience, and why you're a good fit for this campaign..."
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenApplicationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              variant="contained"
              disabled={applying || !applicationMessage.trim()}
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
