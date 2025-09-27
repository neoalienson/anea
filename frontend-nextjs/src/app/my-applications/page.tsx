'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Card, CardContent, 
  Grid, Chip, Alert, CardActionArea
} from '@mui/material'
import { Campaign, AttachMoney, Schedule, CheckCircle, Pending, Cancel } from '@mui/icons-material'

interface ApplicationData {
  id: string
  status: string
  created_at: string
  campaigns: {
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'applied':
      return 'warning'
    case 'accepted':
      return 'success'
    case 'declined':
      return 'error'
    case 'completed':
      return 'success'
    default:
      return 'default'
  }
}

export default function MyApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (session?.user?.id) {
      fetchApplications()
    }
  }, [status, session, router])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/my-applications?userId=${session?.user?.id}`)
      
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

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`)
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

  const isKol = (session.user as any)?.role === 'kol'

  if (!isKol) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">
            This page is only available for KOL users.
          </Alert>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Campaign Applications
        </Typography>

        {message && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        {applications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Campaign sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Applications Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You haven't applied to any campaigns yet. Browse available campaigns to get started!
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {applications.map((application) => (
              <Grid item xs={12} md={6} key={application.id}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea 
                    onClick={() => handleCampaignClick(application.campaigns.id)}
                    sx={{ height: '100%' }}
                  >
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Campaign sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {application.campaigns.title}
                        </Typography>
                        {getStatusIcon(application.status)}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                        {application.campaigns.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2">
                          Budget: ${application.campaigns.budget?.total?.toLocaleString()} {application.campaigns.budget?.currency}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Categories:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {application.campaigns.requirements?.categories?.map((category, index) => (
                            <Chip key={index} label={category} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Chip 
                          label={application.status} 
                          color={getStatusColor(application.status) as any}
                          size="small"
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schedule sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Applied: {new Date(application.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  )
}
