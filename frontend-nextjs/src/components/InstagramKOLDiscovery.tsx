"use client"

import { useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Grid, TextField, Typography, Alert } from '@mui/material'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

type Result = {
	id: string
	display_name: string
	handle: string
	instagram_url: string
	categories: string[]
	followers: number
	engagement_rate: number
	location: string
	explanation: string
	status: string
	score: number
}

export default function InstagramKOLDiscovery({ campaignId }: { campaignId?: string }) {
	const { data: session } = useSession()
	const [title, setTitle] = useState('Gym Launch Campaign')
	const [description, setDescription] = useState('We are a HK gym launching premium classes and memberships.')
	const [category, setCategory] = useState('fitness')
	const [minFollowers, setMinFollowers] = useState<number>(30000)
	const [loading, setLoading] = useState(false)
	const [results, setResults] = useState<Result[]>([])
	const [message, setMessage] = useState('')

	const discover = async () => {
		setLoading(true)
		setMessage('')
		try {
			const resp = await fetch('/api/discover/simulated', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					campaign: {
						id: campaignId,
						title,
						description,
						requirements: { categories: [category], minFollowers, platforms: ['instagram'], targetLocations: ['Hong Kong'] }
					}
				})
			})
			const data = await resp.json()
			if (!resp.ok) throw new Error(data.error || 'Discovery failed')
			setResults(data.results || [])
		} catch (e: any) {
			setMessage(e.message)
		} finally {
			setLoading(false)
		}
	}

	const requestContact = async (r: Result) => {
		try {
			const resp = await fetch('/api/discover/request-contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: session?.user?.id,
					campaignId: campaignId || 'demo-campaign',
					campaignTitle: title,
					kol: r
				})
			})
			const data = await resp.json()
			if (!resp.ok) throw new Error(data.error || 'Failed to submit request')
			setMessage(data.message)
			// mark as in progress in UI
			setResults(prev => prev.map(item => item.id === r.id ? { ...item, status: 'in_progress' } : item))

			// persist locally for tracking if DB table is unavailable
			try {
				if (typeof window !== 'undefined' && session?.user?.id) {
					const key = `contact_requests:${session.user.id}`
					const existing = JSON.parse(localStorage.getItem(key) || '[]') as any[]
					const entry = {
						id: `${campaignId || 'demo-campaign'}:${r.id}`,
						campaign_id: campaignId || 'demo-campaign',
						campaign_title: title,
						requester_id: session.user.id,
						kol_id: r.id,
						kol_handle: r.handle?.replace(/^@/, '') || r.handle,
						kol_display_name: r.display_name,
						status: 'in_progress',
						requested_at: new Date().toISOString()
					}
					const withoutDup = existing.filter(e => e.id !== entry.id)
					localStorage.setItem(key, JSON.stringify([entry, ...withoutDup]))
				}
			} catch {}
		} catch (e: any) {
			setMessage(e.message)
		}
	}

	return (
		<Box>
			<Typography variant="h6" gutterBottom>AI - powered KOL Discovery</Typography>

			{message && <Alert sx={{ mb: 2 }} severity={message.includes('in progress') ? 'success' : 'warning'}>{message}</Alert>}

			<Grid container spacing={2} sx={{ mb: 2 }}>
				<Grid item xs={12} md={4}>
					<TextField fullWidth label="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} />
				</Grid>
				<Grid item xs={12} md={5}>
					<TextField fullWidth multiline minRows={1} label="Brief Description" value={description} onChange={e => setDescription(e.target.value)} />
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField fullWidth label="Category" value={category} onChange={e => setCategory(e.target.value)} />
				</Grid>
				<Grid item xs={6} md={2}>
					<TextField
						fullWidth
						type="number"
						label="Minimum Followers"
						placeholder="e.g. 20000"
						value={minFollowers}
						onChange={e => setMinFollowers(Number(e.target.value || 0))}
						inputProps={{ min: 0, step: 1000 }}
					/>
				</Grid>
			</Grid>

			<Button variant="contained" onClick={discover} disabled={loading}>
				{loading ? 'Discovering…' : 'Discover KOLs'}
			</Button>

			<Button component={Link} href="/contact-requests" sx={{ ml: 2 }}>
				View contacted KOLs
			</Button>

			<Grid container spacing={2} sx={{ mt: 2 }}>
				{results.map(r => (
					<Grid item xs={12} md={6} key={r.id}>
						<Card>
							<CardContent>
								<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
									<Typography variant="h6">{r.display_name} <Typography component="span" color="text.secondary" fontSize={14}>{r.handle}</Typography></Typography>
									<Chip size="small" label={r.status === 'in_progress' ? 'in progress' : 'available'} color={r.status === 'in_progress' ? 'warning' : 'default'} />
								</Box>
								<Typography variant="body2" color="text.secondary" gutterBottom>
									{r.explanation}
								</Typography>
								<Box display="flex" gap={1} flexWrap="wrap" my={1}>
									{r.categories.map(c => <Chip key={c} size="small" label={c} />)}
								</Box>
								<Typography variant="body2">Followers: {r.followers.toLocaleString()} • ER: {(r.engagement_rate*100).toFixed(1)}%</Typography>
								<Typography variant="body2" color="text.secondary">{r.location} • <a href={r.instagram_url} target="_blank" rel="noreferrer">Instagram</a></Typography>
								<Box mt={2} display="flex" gap={1}>
									<Button variant="outlined" href={r.instagram_url} target="_blank">View Profile</Button>
									<Button variant="contained" disabled={r.status === 'in_progress'} onClick={() => requestContact(r)}>
										{r.status === 'in_progress' ? 'Requested' : 'Contact this KOL'}
									</Button>
								</Box>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}
