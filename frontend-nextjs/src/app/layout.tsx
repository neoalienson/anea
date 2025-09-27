import { Inter } from 'next/font/google'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SessionProvider } from 'next-auth/react'
import { theme } from '@/lib/theme'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KOL Matching Platform',
  description: 'Connect SMBs with Key Opinion Leaders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}