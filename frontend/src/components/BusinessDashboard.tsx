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
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  overview: {
    campaigns: {
      total_campaigns: number;
      active_campaigns: number;
      completed_campaigns: number;
      total_budget: number;
    };
    collaborations: {
      total_kols: number;
      active_collaborations: number;
      completed_collaborations: number;
      avg_rate: number;
    };
    performance: {
      total_reach: number;
      total_impressions: number;
      total_engagement: number;
      total_conversions: number;
      avg_roi: number;
    };
  };
  recentCampaigns: Array<{
    id: string;
    title: string;
    status: string;
    budget: number;
    applications: number;
  }>;
}

const BusinessDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/analytics/business', {
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

  const campaignStatusData = [
    { name: 'Active', value: analytics.overview.campaigns.active_campaigns, color: '#4caf50' },
    { name: 'Completed', value: analytics.overview.campaigns.completed_campaigns, color: '#2196f3' },
    { name: 'Draft', value: analytics.overview.campaigns.total_campaigns - analytics.overview.campaigns.active_campaigns - analytics.overview.campaigns.completed_campaigns, color: '#ff9800' }
  ];

  const performanceData = [
    { name: 'Reach', value: analytics.overview.performance.total_reach },
    { name: 'Impressions', value: analytics.overview.performance.total_impressions },
    { name: 'Engagement', value: analytics.overview.performance.total_engagement },
    { name: 'Conversions', value: analytics.overview.performance.total_conversions }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Business Analytics Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Campaigns
              </Typography>
              <Typography variant="h4">
                {analytics.overview.campaigns.total_campaigns}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total KOLs
              </Typography>
              <Typography variant="h4">
                {analytics.overview.collaborations.total_kols}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4">
                ${analytics.overview.campaigns.total_budget.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg ROI
              </Typography>
              <Typography variant="h4">
                {(analytics.overview.performance.avg_roi * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={campaignStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {campaignStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Campaigns */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Campaigns
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Applications</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.recentCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={campaign.status} 
                        color={campaign.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${campaign.budget?.toLocaleString()}</TableCell>
                    <TableCell>{campaign.applications}</TableCell>
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

export default BusinessDashboard;