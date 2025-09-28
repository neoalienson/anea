'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Card, CardContent, Typography, Button, Box, Alert, CircularProgress, 
  Chip, Grid, LinearProgress, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText, Divider
} from '@mui/material'
import { 
  ExpandMore, TrendingUp, Star, Warning, MonetizationOn, 
  CheckCircle, Cancel, Lightbulb, Analytics
} from '@mui/icons-material'

interface ProfileAnalysis {
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  improvement_suggestions: Array<{
    area: string
    suggestion: string
    priority: string
    estimated_impact: string
  }>
  monetization_potential: string
  recommended_niches: string[]
  next_steps: string[]
}

interface ProfileCompleteness {
  score: number
  missing_fields: string[]
}

export default function AIProfileEnhancer() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null)
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null)
  const [error, setError] = useState('')

  const enhanceProfile = async () => {
    if (!session?.user) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/kol/ai/enhance-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze profile')
      }
      
      const data = await response.json()
      setAnalysis(data.analysis)
      setCompleteness(data.profile_completeness)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error'
      case 'medium': return 'warning' 
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'success'
      case 'moderate': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Analytics sx={{ mr: 1, color: 'primary.main' }} />
          🤖 AI Profile Enhancement
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Get AI-powered insights to optimize your profile for better brand partnerships
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!analysis ? (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={enhanceProfile}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <TrendingUp />}
              sx={{ mb: 2 }}
            >
              {loading ? 'Analyzing Profile...' : 'Analyze My Profile'}
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Overall Score */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">{analysis.overall_score}/10</Typography>
                <Typography variant="h6">Overall Profile Score</Typography>
                {completeness && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Profile Completeness: {completeness.score}%
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Profile Completeness */}
            {completeness && completeness.score < 100 && (
              <Card sx={{ mb: 3, border: '1px solid', borderColor: 'warning.main' }}>
                <CardContent>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    📋 Complete Your Profile
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={completeness.score} 
                      sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
                      color="warning"
                    />
                    <Typography variant="body2">{completeness.score}%</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Missing: {completeness.missing_fields.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Strengths and Weaknesses */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      ✅ Strengths
                    </Typography>
                    <List dense>
                      {analysis.strengths.map((strength, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      ⚠️ Areas for Improvement
                    </Typography>
                    <List dense>
                      {analysis.weaknesses.map((weakness, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Warning color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={weakness} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Improvement Suggestions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Lightbulb sx={{ mr: 1, color: 'primary.main' }} />
                  Improvement Suggestions
                </Typography>
                {analysis.improvement_suggestions.map((suggestion, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flexGrow: 1 }}>{suggestion.area}</Typography>
                        <Chip 
                          label={suggestion.priority} 
                          size="small" 
                          color={getPriorityColor(suggestion.priority) as any}
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={`${suggestion.estimated_impact} Impact`} 
                          size="small" 
                          color={getImpactColor(suggestion.estimated_impact) as any}
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">{suggestion.suggestion}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>

            {/* Monetization and Recommendations */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <MonetizationOn sx={{ mr: 1, color: 'success.main' }} />
                      Monetization Potential
                    </Typography>
                    <Typography variant="body2">{analysis.monetization_potential}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🎯 Recommended Niches
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {analysis.recommended_niches.map((niche, index) => (
                        <Chip key={index} label={niche} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Next Steps */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🚀 Next Steps
                </Typography>
                <List>
                  {analysis.next_steps.map((step, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Typography variant="h6" color="primary.main">
                          {index + 1}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText primary={step} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => setAnalysis(null)}
                sx={{ mr: 2 }}
              >
                Run New Analysis
              </Button>
              <Button 
                variant="contained"
                onClick={enhanceProfile}
                disabled={loading}
              >
                Refresh Analysis
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}