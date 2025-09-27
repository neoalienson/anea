import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Fab
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  id: string;
  title: string;
  status: string;
  budget: number;
  applications: number;
  created_at: string;
}

const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Campaigns
      </Typography>

      <Grid container spacing={3}>
        {campaigns.map((campaign) => (
          <Grid item xs={12} md={6} lg={4} key={campaign.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {campaign.title}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={campaign.status} 
                    color={getStatusColor(campaign.status) as any}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Budget: ${campaign.budget?.toLocaleString()}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Applications: {campaign.applications}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created: {new Date(campaign.created_at).toLocaleDateString()}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => navigate(`/business/campaigns/${campaign.id}`)}
                    sx={{ mr: 1 }}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => navigate(`/business/campaigns/${campaign.id}/matches`)}
                  >
                    Find KOLs
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {campaigns.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No campaigns yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first campaign to start finding KOLs
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/business/campaigns/create')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default CampaignList;