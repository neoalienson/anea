'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Card, CardContent, Grid,
  TextField, MenuItem, Button, Chip, Avatar, InputAdornment, Divider
} from '@mui/material'
import { Search, YouTube, People, TrendingUp } from '@mui/icons-material'
import InstagramKOLDiscovery from '@/components/InstagramKOLDiscovery'

interface KOL {
  id: string
  display_name: string
  bio: string
  categories: string[]
  audience_metrics: {
    totalFollowers: number
    engagementRate: number
    averageViews: number
  }
  social_links: Array<{platform: string, url: string}>
}

export default function DiscoverPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [kols, setKols] = useState<KOL[]>([])
  const [filteredKols, setFilteredKols] = useState<KOL[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minFollowers: 0,
    maxFollowers: 1000000
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (session?.user?.id) {
      fetchKOLs()
    }
  }, [status, session, router])

  useEffect(() => {
    applyFilters()
  }, [kols, filters])

  const fetchKOLs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/discover/kols')
      if (response.ok) {
        const result = await response.json()
        setKols(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching KOLs:', error)
    }
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = kols

    if (filters.search) {
      filtered = filtered.filter(kol => 
        kol.display_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        kol.bio.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(kol => 
        kol.categories?.includes(filters.category)
      )
    }

    filtered = filtered.filter(kol => {
      const followers = kol.audience_metrics?.totalFollowers || 0
      return followers >= filters.minFollowers && followers <= filters.maxFollowers
    })

    setFilteredKols(filtered)
  }

  if (status === 'loading') return <Typography>Loading...</Typography>
  if (!session) return null

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          AI - powered KOL Discovery
        </Typography>

        {/* Simulated Instagram Discovery (HK) */}
        <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <InstagramKOLDiscovery />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search KOLs"
                placeholder="Search KOLs"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="beauty">Beauty</MenuItem>
                <MenuItem value="gaming">Gaming</MenuItem>
                <MenuItem value="lifestyle">Lifestyle</MenuItem>
                <MenuItem value="fashion">Fashion</MenuItem>
                <MenuItem value="fitness">Fitness</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Min Followers"
                value={filters.minFollowers}
                onChange={(e) => setFilters(prev => ({ ...prev, minFollowers: parseInt(e.target.value) || 0 }))}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Max Followers"
                value={filters.maxFollowers}
                onChange={(e) => setFilters(prev => ({ ...prev, maxFollowers: parseInt(e.target.value) || 1000000 }))}
              />
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom>
          {filteredKols.length} KOLs found
        </Typography>

        <Grid container spacing={3}>
          {filteredKols.map((kol) => (
            <Grid item xs={12} md={6} lg={4} key={kol.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {kol.display_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{kol.display_name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <YouTube sx={{ mr: 0.5, fontSize: 16, color: 'red' }} />
                        <Typography variant="body2" color="text.secondary">
                          YouTube Creator
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {kol.bio}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {kol.categories?.map((category, index) => (
                        <Chip key={index} label={category} size="small" />
                      ))}
                    </Box>
                  </Box>

                  {kol.audience_metrics && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <People sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">
                          {kol.audience_metrics.totalFollowers?.toLocaleString()} subscribers
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUp sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">
                          {(kol.audience_metrics.engagementRate * 100).toFixed(2)}% engagement
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        Avg views: {kol.audience_metrics.averageViews?.toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => router.push(`/kols/${kol.id}`)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredKols.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No KOLs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search filters
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  )
}