import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

const Register: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    // Business fields
    companyName: '',
    industry: '',
    companySize: '',
    description: '',
    // KOL fields
    displayName: '',
    bio: '',
    categories: '',
    youtubeChannel: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const steps = ['Account Info', 'Profile Details', 'Complete'];

  const handleNext = () => {
    if (activeStep === 0 && (!formData.email || !formData.password || !formData.role)) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const profileData = formData.role === 'business' ? {
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        description: formData.description,
        targetAudience: {},
        budgetRange: { min: 1000, max: 10000, currency: 'USD' }
      } : {
        displayName: formData.displayName,
        bio: formData.bio,
        categories: formData.categories.split(',').map(c => c.trim()),
        socialLinks: formData.youtubeChannel ? [
          { platform: 'youtube', url: formData.youtubeChannel, isVerified: false }
        ] : [],
        audienceMetrics: { totalFollowers: 0, engagementRate: 0 },
        contentStyle: { postingFrequency: 'weekly', contentTypes: ['reviews'] }
      };

      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profile: profileData
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        navigate(`/${formData.role}/dashboard`);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="kol">KOL/Creator</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      case 1:
        return formData.role === 'business' ? (
          <>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Industry</InputLabel>
              <Select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="fashion">Fashion</MenuItem>
                <MenuItem value="beauty">Beauty</MenuItem>
                <MenuItem value="gaming">Gaming</MenuItem>
                <MenuItem value="lifestyle">Lifestyle</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Company Size</InputLabel>
              <Select
                value={formData.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
              >
                <MenuItem value="small">Small (1-50)</MenuItem>
                <MenuItem value="medium">Medium (51-200)</MenuItem>
                <MenuItem value="large">Large (200+)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Company Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
            />
          </>
        ) : (
          <>
            <TextField
              fullWidth
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Content Categories (comma separated)"
              value={formData.categories}
              onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
              margin="normal"
              placeholder="technology, reviews, gaming"
            />
            <TextField
              fullWidth
              label="YouTube Channel URL (optional)"
              value={formData.youtubeChannel}
              onChange={(e) => setFormData({ ...formData, youtubeChannel: e.target.value })}
              margin="normal"
            />
          </>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Ready to create your account!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "Complete Registration" to finish setting up your {formData.role} account.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="grey.100"
    >
      <Card sx={{ maxWidth: 500, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Button onClick={() => navigate('/login')}>Login</Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;