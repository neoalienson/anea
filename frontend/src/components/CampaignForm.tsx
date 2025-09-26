import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';

const CampaignForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platforms: ['youtube'],
    categories: [],
    minFollowers: '',
    budget: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
  });

  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    'technology', 'beauty', 'gaming', 'lifestyle', 'fitness', 
    'fashion', 'food', 'travel', 'education', 'entertainment'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const campaignData = {
      title: formData.title,
      description: formData.description,
      objectives: [
        {
          type: 'awareness',
          target: 100000,
          metric: 'impressions'
        }
      ],
      requirements: {
        platforms: formData.platforms,
        categories: formData.categories,
        minFollowers: parseInt(formData.minFollowers),
        targetDemographics: {}
      },
      budget: {
        total: parseInt(formData.budget),
        perKOL: Math.floor(parseInt(formData.budget) / 3),
        currency: 'USD'
      },
      timeline: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        applicationDeadline: formData.applicationDeadline
      }
    };

    try {
      const response = await fetch('http://localhost:8000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        alert('Campaign created successfully!');
        // Reset form or redirect
      } else {
        alert('Failed to create campaign');
      }
    } catch (error) {
      alert('Error creating campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Campaign
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Campaign Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Categories</InputLabel>
                  <Select
                    multiple
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value as string[] })}
                    input={<OutlinedInput label="Categories" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Followers"
                  type="number"
                  value={formData.minFollowers}
                  onChange={(e) => setFormData({ ...formData, minFollowers: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Budget (USD)"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
                <Button variant="outlined" size="large">
                  Save as Draft
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CampaignForm;