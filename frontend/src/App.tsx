import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { store } from './store/store';
import Navbar from './components/Layout/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import KOLSearch from './components/KOLSearch';
import BusinessDashboard from './components/BusinessDashboard';
import KOLDashboard from './components/KOLDashboard';
import CampaignForm from './components/CampaignForm';
import CampaignList from './components/CampaignList';
import CampaignDetails from './components/CampaignDetails';
import MatchingResults from './components/MatchingResults';
import PaymentForm from './components/PaymentForm';
import PaymentHistory from './components/PaymentHistory';
import PrivacySettings from './components/PrivacySettings';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ErrorBoundary>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/business/dashboard" element={
                  <ProtectedRoute requiredRole="business">
                    <BusinessDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/business/search" element={
                  <ProtectedRoute requiredRole="business">
                    <KOLSearch />
                  </ProtectedRoute>
                } />
                <Route path="/business/campaigns" element={
                  <ProtectedRoute requiredRole="business">
                    <CampaignList />
                  </ProtectedRoute>
                } />
                <Route path="/business/campaigns/create" element={
                  <ProtectedRoute requiredRole="business">
                    <CampaignForm />
                  </ProtectedRoute>
                } />
                <Route path="/business/campaigns/:id" element={
                  <ProtectedRoute requiredRole="business">
                    <CampaignDetails />
                  </ProtectedRoute>
                } />
                <Route path="/business/campaigns/:id/matches" element={
                  <ProtectedRoute requiredRole="business">
                    <MatchingResults campaignId="" />
                  </ProtectedRoute>
                } />
                <Route path="/business/payments" element={
                  <ProtectedRoute requiredRole="business">
                    <PaymentHistory />
                  </ProtectedRoute>
                } />
                <Route path="/kol/dashboard" element={
                  <ProtectedRoute requiredRole="kol">
                    <KOLDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/privacy" element={
                  <ProtectedRoute>
                    <PrivacySettings />
                  </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
              </Box>
            </Box>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;