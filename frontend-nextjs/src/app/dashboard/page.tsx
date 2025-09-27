'use client'

import { useSession } from 'next-auth/react'
import { Container, Typography, Box, Paper } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <Typography>Loading...</Typography>
  }

  if (!session) {
    return null
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6">Welcome, {session.user?.email}!</Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Role: {(session.user as any)?.role}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            User ID: {session.user?.id}
          </Typography>

        </Paper>
      </Box>
    </Container>
  )
}