import { Container, Typography, Button, Box } from '@mui/material'
import Link from 'next/link'

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          KOL Matching Platform
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Connect SMBs with Key Opinion Leaders
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={Link}
            href="/auth/signin"
            variant="contained"
            size="large"
          >
            Sign In
          </Button>
          <Button
            component={Link}
            href="/auth/signup"
            variant="outlined"
            size="large"
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  )
}