'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Card, CardContent, Typography, Button, Box, Alert, CircularProgress, 
  Chip, Grid, LinearProgress, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText, Divider, Rating
} from '@mui/material'
import { 
  ExpandMore, Campaign, MonetizationOn, TrendingUp, CheckCircle, 
  Warning, Lightbulb, Analytics, Star, CompareArrows
} from '@mui/icons-material'

interface Campaign {
  id: string
  title: string
  description: string
  budget: { total: number, currency: string }
  requirements: {
    categories: string[]
    minFollowers: number
    platforms: string[]
  }
  status: string
  created_at: string
}

interface MatchResult {
  campaign: Campaign
  match_score: number
  strengths: string[]
  gaps: string[]
  improvement_suggestions: string[]
  estimated_earnings: {
    min: number
    max: number
    reasoning: string
  }
  competition_level: 'Low' | 'Medium' | 'High'
  success_probability: number
}

interface ProfileSummary {
  total_followers: number
  main_topics: string[]
  avg_engagement: number
}

export default function AICampaignMatcher() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null)
  const [totalAnalyzed, setTotalAnalyzed] = useState(0)
  const [error, setError] = useState('')

  const findMatches = async () => {
    if (!session?.user) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/kol/ai/match-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 })
      })
      
      if (!response.ok) {
        throw new Error('Failed to find matching campaigns')
      }
      
      const data = await response.json()
      setMatches(data.matches || [])
      setProfileSummary(data.profile_summary)
      setTotalAnalyzed(data.total_analyzed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Matching failed')
    } finally {
      setLoading(false)
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'Low': return 'success'
      case 'Medium': return 'warning'
      case 'High': return 'error'
      default: return 'default'
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CompareArrows sx={{ mr: 1, color: 'primary.main' }} />
          🎯 AI Campaign Matching
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Find campaigns that match your profile and get insights on how to improve your chances
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {profileSummary && (
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Your Profile Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h5">{profileSummary.total_followers.toLocaleString()}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Followers</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h5">{(profileSummary.avg_engagement * 100).toFixed(1)}%</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Engagement</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h5">{profileSummary.main_topics.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Main Topics</Typography>
                </Grid>
              </Grid>
              {profileSummary.main_topics.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>Your Topics:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profileSummary.main_topics.map((topic, index) => (
                      <Chip 
                        key={index} 
                        label={topic} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {matches.length === 0 ? (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={findMatches}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Campaign />}
              sx={{ mb: 2 }}
            >
              {loading ? 'Finding Matches...' : 'Find Matching Campaigns'}
            </Button>
            {totalAnalyzed > 0 && (
              <Typography variant="body2" color="text.secondary">
                Analyzed {totalAnalyzed} active campaigns
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Found {matches.length} Matching Campaigns
              </Typography>
              <Button variant="outlined" onClick={findMatches} disabled={loading}>
                Refresh Matches
              </Button>
            </Box>

            {matches.map((match, index) => (
              <Card key={match.campaign.id} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  {/* Campaign Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{match.campaign.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {match.campaign.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {match.campaign.requirements.categories.map((cat, idx) => (
                          <Chip key={idx} label={cat} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right', ml: 2 }}>
                      <Typography variant="h4" color={`${getMatchScoreColor(match.match_score)}.main`}>
                        {match.match_score}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Match Score</Typography>
                    </Box>
                  </Box>

                  {/* Key Metrics */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">Budget</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        ${match.campaign.budget.total.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">Min Followers</Typography>
                      <Typography variant="body1">
                        {match.campaign.requirements.minFollowers.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">Competition</Typography>
                      <Chip 
                        label={match.competition_level} 
                        size="small" 
                        color={getCompetitionColor(match.competition_level) as any}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          {Math.round(match.success_probability)}%
                        </Typography>
                        <Rating 
                          value={match.success_probability / 20} 
                          readOnly 
                          size="small" 
                          precision={0.1}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Estimated Earnings */}
                  <Card sx={{ mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CardContent sx={{ py: '12px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MonetizationOn sx={{ mr: 1 }} />
                          <Typography variant="h6">
                            ${match.estimated_earnings.min.toLocaleString()} - ${match.estimated_earnings.max.toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2">Estimated Earnings</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {match.estimated_earnings.reasoning}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Detailed Analysis */}
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1">
                        📊 Detailed Analysis & Recommendations
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {/* Strengths */}
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="success.main" gutterBottom>
                            ✅ Your Strengths
                          </Typography>
                          <List dense>
                            {match.strengths.map((strength, idx) => (
                              <ListItem key={idx} sx={{ pl: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <CheckCircle color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={strength} 
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>

                        {/* Gaps */}
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="warning.main" gutterBottom>
                            ⚠️ Areas to Address
                          </Typography>
                          <List dense>
                            {match.gaps.map((gap, idx) => (
                              <ListItem key={idx} sx={{ pl: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <Warning color="warning" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={gap} 
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>

                        {/* Improvements */}
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" color="primary.main" gutterBottom>
                            💡 Improvement Tips
                          </Typography>
                          <List dense>
                            {match.improvement_suggestions.map((suggestion, idx) => (
                              <ListItem key={idx} sx={{ pl: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <Lightbulb color="primary" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={suggestion} 
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      </Grid>

                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          href={`/campaigns/${match.campaign.id}`}
                        >
                          View Campaign
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => window.open(`/campaigns/${match.campaign.id}`, '_blank')}
                        >
                          Apply Now
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Showing top {matches.length} matches out of {totalAnalyzed} analyzed campaigns
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}