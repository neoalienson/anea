'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Container, Typography, Button, Box } from '@mui/material'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return <Typography>Loading...</Typography>
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          KOL Matching Platform
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Connect SMBs with Key Opinion Leaders
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => router.push('/auth/signin')}
          sx={{ mt: 3 }}
        >
          Sign In
        </Button>
      </Box>
    </Container>
  )
}