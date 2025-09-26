import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button
} from '@mui/material';
import { TrendingUp, People, AttachMoney, Campaign } from '@mui/icons-material';

interface KOLAnalyticsData {
  profile: {
    display_name: string;
    verification_status: string;
    followers: number;
    engagement_rate: number;
    platform: string;
  };
  overview: {
    campaigns: {
      total_applications: number;
      accepted: number;
      completed: number;
      total_earnings: number;
    };
    performance: {
      total_reach: number;
      total_impressions: number;
      total_engagement: number;
      avg_roi: number;
    };
  };
  opportunities: Array<{
    id: string;
    title: string;
    status: string;
    budget_per_kol: number;
    application_status: string;
  }>;
}

const KOLDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<KOLAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analytics/kol', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;
  if (!analytics) return <Typography>No data available</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        KOL Dashboard
      </Typography>

      {/* Profile Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <People sx={{ fontSize: 40, color: 'primary.main' }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                {analytics.profile.display_name || 'KOL Profile'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics.profile.followers?.toLocaleString()} followers on {analytics.profile.platform}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Engagement Rate: {((analytics.profile.engagement_rate || 0) * 100).toFixed(1)}%
              </Typography>
            </Grid>
            <Grid item>
              <Chip 
                label={analytics.profile.verification_status || 'pending'} 
                color={analytics.profile.verification_status === 'verified' ? 'success' : 'warning'}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Campaign sx={{ mr: 1, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Applications
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.campaigns.total_applications}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Accepted
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.campaigns.accepted}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney sx={{ mr: 1, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Earnings
                  </Typography>
                  <Typography variant="h4">
                    ${analytics.overview.campaigns.total_earnings?.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ mr: 1, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Reach
                  </Typography>
                  <Typography variant="h4">
                    {analytics.overview.performance.total_reach?.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Impressions
                </Typography>
                <Typography variant="h6">
                  {analytics.overview.performance.total_impressions?.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Engagement
                </Typography>
                <Typography variant="h6">
                  {analytics.overview.performance.total_engagement?.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Average ROI
                </Typography>
                <Typography variant="h6">
                  {((analytics.overview.performance.avg_roi || 0) * 100).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Success Rate
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Acceptance Rate
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.overview.campaigns.total_applications > 0 ? 
                    (analytics.overview.campaigns.accepted / analytics.overview.campaigns.total_applications) * 100 : 0}
                  sx={{ mt: 1, mb: 1 }}
                />
                <Typography variant="body2">
                  {analytics.overview.campaigns.total_applications > 0 ? 
                    ((analytics.overview.campaigns.accepted / analytics.overview.campaigns.total_applications) * 100).toFixed(1) : 0}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics.overview.campaigns.accepted > 0 ? 
                    (analytics.overview.campaigns.completed / analytics.overview.campaigns.accepted) * 100 : 0}
                  sx={{ mt: 1, mb: 1 }}
                />
                <Typography variant="body2">
                  {analytics.overview.campaigns.accepted > 0 ? 
                    ((analytics.overview.campaigns.completed / analytics.overview.campaigns.accepted) * 100).toFixed(1) : 0}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Available Opportunities */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Opportunities
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.opportunities.map((opportunity) => (
                  <TableRow key={opportunity.id}>
                    <TableCell>{opportunity.title}</TableCell>
                    <TableCell>${opportunity.budget_per_kol?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={opportunity.application_status || 'Available'} 
                        color={opportunity.application_status === 'accepted' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        disabled={!!opportunity.application_status}
                      >
                        {opportunity.application_status ? 'Applied' : 'Apply'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default KOLDashboard;