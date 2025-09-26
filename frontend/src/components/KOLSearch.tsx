import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { RootState } from '../store/store';
import { searchStart, searchSuccess, searchFailure, setFilters } from '../store/slices/kolSlice';
import { kolAPI } from '../services/api';

const KOLSearch: React.FC = () => {
  const dispatch = useDispatch();
  const { kols, loading, searchFilters } = useSelector((state: RootState) => state.kol);
  
  const [filters, setLocalFilters] = useState({
    minFollowers: '',
    maxFollowers: '',
    categories: '',
    platforms: 'youtube',
  });

  const handleSearch = async () => {
    dispatch(searchStart());
    dispatch(setFilters(filters));

    try {
      const searchParams = {
        ...filters,
        minFollowers: filters.minFollowers ? parseInt(filters.minFollowers) : undefined,
        maxFollowers: filters.maxFollowers ? parseInt(filters.maxFollowers) : undefined,
        categories: filters.categories ? [filters.categories] : undefined,
        platforms: filters.platforms ? [filters.platforms] : undefined,
      };

      const response = await kolAPI.search(searchParams);
      dispatch(searchSuccess(response.data.data));
    } catch (error) {
      dispatch(searchFailure());
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Find KOLs
      </Typography>

      {/* Search Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={filters.platforms}
                  onChange={(e) => setLocalFilters({ ...filters, platforms: e.target.value })}
                >
                  <MenuItem value="youtube">YouTube</MenuItem>
                  <MenuItem value="instagram">Instagram</MenuItem>
                  <MenuItem value="tiktok">TikTok</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Category"
                value={filters.categories}
                onChange={(e) => setLocalFilters({ ...filters, categories: e.target.value })}
                placeholder="e.g., technology"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Followers"
                type="number"
                value={filters.minFollowers}
                onChange={(e) => setLocalFilters({ ...filters, minFollowers: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Followers"
                type="number"
                value={filters.maxFollowers}
                onChange={(e) => setLocalFilters({ ...filters, maxFollowers: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search KOLs'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      <Grid container spacing={2}>
        {kols.map((kol) => (
          <Grid item xs={12} sm={6} md={4} key={kol.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src={kol.avatar} sx={{ mr: 2 }}>
                    {kol.displayName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{kol.displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {kol.followers.toLocaleString()} followers
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  Engagement: {(kol.engagementRate * 100).toFixed(1)}%
                </Typography>
                
                <Box mb={2}>
                  {kol.categories.map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                
                <Button variant="outlined" fullWidth>
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {kols.length === 0 && !loading && (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          No KOLs found. Try adjusting your search filters.
        </Typography>
      )}
    </Box>
  );
};

export default KOLSearch;