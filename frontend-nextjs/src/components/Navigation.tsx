'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton
} from '@mui/material'
import { Campaign, Search, Person, Dashboard, ExitToApp } from '@mui/icons-material'
import { useState } from 'react'

export default function Navigation() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    handleClose()
  }

  if (!session || pathname.startsWith('/auth')) return null

  const isKOL = (session.user as any)?.role === 'kol'
  const isBusiness = (session.user as any)?.role === 'business'

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          KOL Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => router.push('/dashboard')}
            sx={{ opacity: pathname === '/dashboard' ? 1 : 0.7 }}
          >
            Dashboard
          </Button>

          {isBusiness && (
            <>
              <Button
                color="inherit"
                startIcon={<Campaign />}
                onClick={() => router.push('/campaigns')}
                sx={{ opacity: pathname === '/campaigns' ? 1 : 0.7 }}
                data-testid="nav-campaigns"
              >
                Campaigns
              </Button>
              <Button
                color="inherit"
                startIcon={<Search />}
                onClick={() => router.push('/discover')}
                sx={{ opacity: pathname === '/discover' ? 1 : 0.7 }}
                data-testid="nav-discover"
              >
                Discover
              </Button>
            </>
          )}

          {isKOL && (
            <>
              <Button
                color="inherit"
                startIcon={<Person />}
                onClick={() => router.push('/profile')}
                sx={{ opacity: pathname === '/profile' ? 1 : 0.7 }}
                data-testid="nav-profile"
              >
                Profile
              </Button>
              <Button
                color="inherit"
                startIcon={<Campaign />}
                onClick={() => router.push('/campaigns')}
                sx={{ opacity: pathname === '/campaigns' ? 1 : 0.7 }}
                data-testid="nav-campaigns"
              >
                Campaigns
              </Button>
            </>
          )}

          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
            data-testid="user-menu"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {session.user?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Typography variant="body2" color="text.secondary">
                {session.user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <ExitToApp sx={{ mr: 1 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}