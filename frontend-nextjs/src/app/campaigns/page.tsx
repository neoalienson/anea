'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Button, Card, CardContent, 
  Grid, Chip, Alert, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, MenuItem
} from '@mui/material'
import { Add, Campaign, AttachMoney } from '@mui/icons-material'

interface Campaign {
  id: string
  title: string
  description: string
  budget: { total: number, currency: string }
  status: string
  requirements: { categories: string[], minFollowers: number }
  created_at: string
}

export default function CampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    budget: 5000,
    categories: ['technology'],
    minFollowers: 10000
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (session?.user?.id) {
      fetchCampaigns()
    }
  }, [status, session, router])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      if (response.ok) {
        const result = await response.json()
        setCampaigns(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const createCampaign = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          title: newCampaign.title,
          description: newCampaign.description,
          budget: { total: newCampaign.budget, currency: 'USD' },
          requirements: {
            categories: newCampaign.categories,
            minFollowers: newCampaign.minFollowers,
            platforms: ['youtube']
          }
        })
      })

      if (response.ok) {
        setMessage('Campaign created successfully!')
        setOpenDialog(false)
        fetchCampaigns()
        setNewCampaign({
          title: '',
          description: '',
          budget: 5000,
          categories: ['technology'],
          minFollowers: 10000
        })
      } else {
        setMessage('Failed to create campaign')
      }
    } catch (error) {
      setMessage('Error creating campaign')
    }
    setLoading(false)
  }

  if (status === 'loading') return <Typography>Loading...</Typography>
  if (!session) return null

  const isBusiness = (session.user as any)?.role === 'business'

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {isBusiness ? 'My Campaigns' : 'Available Campaigns'}
          </Typography>
          {isBusiness && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Create Campaign
            </Button>
          )}
        </Box>

        {message && (
          <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {campaigns.map((campaign) => (
            <Grid item xs={12} md={6} key={campaign.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Campaign sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{campaign.title}</Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {campaign.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body2">
                      Budget: ${campaign.budget?.total?.toLocaleString()} {campaign.budget?.currency}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Categories:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {campaign.requirements?.categories?.map((category, index) => (
                        <Chip key={index} label={category} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={campaign.status} 
                      color={campaign.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                    {!isBusiness && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      >
                        Apply
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Campaign Title"
              name="title"
              value={newCampaign.title}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={newCampaign.description}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
            />

            <TextField
              fullWidth
              type="number"
              label="Budget (USD)"
              name="budget"
              value={newCampaign.budget}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
              margin="normal"
            />

            <TextField
              fullWidth
              select
              label="Primary Category"
              value={newCampaign.categories[0]}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, categories: [e.target.value] }))}
              margin="normal"
            >
              <MenuItem value="technology">Technology</MenuItem>
              <MenuItem value="beauty">Beauty</MenuItem>
              <MenuItem value="gaming">Gaming</MenuItem>
              <MenuItem value="lifestyle">Lifestyle</MenuItem>
              <MenuItem value="fashion">Fashion</MenuItem>
              <MenuItem value="fitness">Fitness</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Minimum Followers"
              name="minFollowers"
              value={newCampaign.minFollowers}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, minFollowers: parseInt(e.target.value) }))}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={createCampaign} 
              variant="contained"
              disabled={loading || !newCampaign.title}
            >
              Create Campaign
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}