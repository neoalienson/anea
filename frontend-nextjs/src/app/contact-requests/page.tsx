'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Container, Typography, Grid, Card, CardContent, Chip, TextField, MenuItem, Button } from '@mui/material'

type ContactRequest = {
  id: string
  campaign_id: string
  campaign_title?: string
  requester_id: string
  kol_id: string
  kol_handle: string
  kol_display_name: string
  status: string
  requested_at: string
}

export default function ContactRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useSearchParams()
  const [items, setItems] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [campaignId, setCampaignId] = useState(params.get('campaignId') || '')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, campaignId])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('userId', String(session?.user?.id))
      if (campaignId) qs.set('campaignId', campaignId)
      const resp = await fetch(`/api/discover/contact-requests?${qs.toString()}`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to load')
      let list: ContactRequest[] = data.data || []
      if (list.length === 0 && typeof window !== 'undefined' && session?.user?.id) {
        // fallback to localStorage
        const key = `contact_requests:${session.user.id}`
        const local = JSON.parse(localStorage.getItem(key) || '[]') as ContactRequest[]
        list = local
        if (campaignId) list = list.filter(i => i.campaign_id === campaignId)
      }
      setItems(list)
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const withdraw = async (id: string) => {
    try {
      // Optimistic removal
      setItems(prev => prev.filter(i => i.id !== id))
      // Persist local removal
      if (typeof window !== 'undefined' && session?.user?.id) {
        const key = `contact_requests:${session.user.id}`
        const local = JSON.parse(localStorage.getItem(key) || '[]') as ContactRequest[]
        localStorage.setItem(key, JSON.stringify(local.filter(i => i.id !== id)))
      }
      const resp = await fetch(`/api/discover/contact-requests/${encodeURIComponent(id)}/withdraw`, { method: 'POST' })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to withdraw')
      setMessage('Contact request withdrawn')
    } catch (e: any) {
      console.error(e)
      setMessage(e.message || 'Failed to withdraw')
      // On error, refetch to reconcile state
      fetchItems()
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Contacted KOLs</Typography>
          <Button variant="outlined" onClick={fetchItems} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Filter by Campaign ID (optional)"
            value={campaignId}
            onChange={e => setCampaignId(e.target.value)}
            placeholder="e.g. demo-campaign"
          />
        </Box>

        <Grid container spacing={2}>
          {items.map(it => (
            <Grid item xs={12} md={6} key={it.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{it.kol_display_name} <Typography component="span" color="text.secondary" fontSize={14}>@{it.kol_handle}</Typography></Typography>
                    <Chip size="small" label={it.status} color={it.status === 'in_progress' ? 'warning' : it.status === 'contacted' ? 'info' : it.status === 'engaged' ? 'success' : 'default'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">Campaign: {it.campaign_title || it.campaign_id}</Typography>
                  <Typography variant="body2" color="text.secondary">Requested at: {new Date(it.requested_at).toLocaleString()}</Typography>
                  <Box mt={1} display="flex" gap={1}>
                    <Button size="small" variant="outlined" href={`https://instagram.com/${it.kol_handle}`} target="_blank">View Instagram</Button>
                    <Button size="small" color="error" onClick={() => withdraw(it.id)}>Withdraw Request</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {message && (
          <Box mt={2}><Typography variant="body2" color="text.secondary">{message}</Typography></Box>
        )}

        {items.length === 0 && !loading && (
          <Box textAlign="center" py={6}>
            <Typography variant="body1" color="text.secondary">No contact requests yet. Use AI - powered KOL Discovery to contact KOLs.</Typography>
          </Box>
        )}
      </Box>
    </Container>
  )
}
