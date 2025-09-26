import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import { Star, TrendingUp, People } from '@mui/icons-material';

interface MatchedKOL {
  id: string;
  display_name: string;
  categories: string[];
  followers: number;
  engagement_rate: number;
  matchingScore: number;
  recommendation: 'highly_recommended' | 'recommended' | 'consider';
}

interface MatchingResultsProps {
  campaignId: string;
}

const MatchingResults: React.FC<MatchingResultsProps> = ({ campaignId }) => {
  const [matches, setMatches] = useState<MatchedKOL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, [campaignId]);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/integrations/campaigns/${campaignId}/matches`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.data.kols);
      } else {
        setError('Failed to fetch matching KOLs');
      }
    } catch (err) {
      setError('Error fetching matches');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended': return 'success';
      case 'recommended': return 'warning';
      default: return 'default';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'highly_recommended': return <Star />;
      case 'recommended': return <TrendingUp />;
      default: return <People />;
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Matching KOLs ({matches.length} found)
      </Typography>

      <Grid container spacing={2}>
        {matches.map((kol) => (
          <Grid item xs={12} md={6} lg={4} key={kol.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2 }}>
                    {kol.display_name[0]}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6">{kol.display_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {kol.followers?.toLocaleString()} followers
                    </Typography>
                  </Box>
                  <Chip
                    icon={getRecommendationIcon(kol.recommendation)}
                    label={kol.recommendation.replace('_', ' ')}
                    color={getRecommendationColor(kol.recommendation) as any}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" gutterBottom>
                    Match Score: {(kol.matchingScore * 100).toFixed(0)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={kol.matchingScore * 100}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Engagement: {((kol.engagement_rate || 0) * 100).toFixed(1)}%
                  </Typography>
                </Box>

                <Box mb={2}>
                  {kol.categories?.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>

                <Box display="flex" gap={1}>
                  <Button variant="contained" size="small" fullWidth>
                    Invite
                  </Button>
                  <Button variant="outlined" size="small" fullWidth>
                    View Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {matches.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No matching KOLs found for this campaign. Try adjusting your campaign requirements.
        </Alert>
      )}
    </Box>
  );
};

export default MatchingResults;