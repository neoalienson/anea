import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'

export default async function DashboardPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome, {session.user?.email}!
        </Typography>
      </Box>
    </Container>
  )
}