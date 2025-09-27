import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from '@mui/material';

interface CampaignDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: any;
  timeline: any;
  requirements: any;
  applications: Array<{
    id: string;
    kol_name: string;
    status: string;
    proposed_rate: number;
  }>;
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaignDetails();
    }
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/campaigns/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaign(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch campaign details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchCampaignDetails();
      }
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }
  };

  if (loading) return <LinearProgress />;
  if (!campaign) return <Typography>Campaign not found</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {campaign.title}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={campaign.status} 
                  color={campaign.status === 'active' ? 'success' : 'default'}
                />
              </Box>

              <Typography variant="body1" paragraph>
                {campaign.description}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Requirements
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Platforms: {campaign.requirements?.platforms?.join(', ')}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Categories: {campaign.requirements?.categories?.join(', ')}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Min Followers: {campaign.requirements?.minFollowers?.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Applications ({campaign.applications?.length || 0})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>KOL</TableCell>
                      <TableCell>Proposed Rate</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaign.applications?.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>{application.kol_name}</TableCell>
                        <TableCell>${application.proposed_rate}</TableCell>
                        <TableCell>
                          <Chip 
                            label={application.status} 
                            size="small"
                            color={application.status === 'accepted' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {application.status === 'pending' && (
                            <>
                              <Button size="small" color="success" sx={{ mr: 1 }}>
                                Accept
                              </Button>
                              <Button size="small" color="error">
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Info
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Total Budget: ${campaign.budget?.total?.toLocaleString()}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Per KOL: ${campaign.budget?.perKOL?.toLocaleString()}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Start Date: {new Date(campaign.timeline?.startDate).toLocaleDateString()}
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                End Date: {new Date(campaign.timeline?.endDate).toLocaleDateString()}
              </Typography>

              <Box sx={{ mt: 3 }}>
                {campaign.status === 'draft' && (
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => handleStatusUpdate('active')}
                    sx={{ mb: 1 }}
                  >
                    Activate Campaign
                  </Button>
                )}
                
                {campaign.status === 'active' && (
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => handleStatusUpdate('completed')}
                  >
                    Mark Complete
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CampaignDetails;