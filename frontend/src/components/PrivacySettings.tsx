import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import { Download, Delete } from '@mui/icons-material';

interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  necessary: boolean;
}

const PrivacySettings: React.FC = () => {
  const [consents, setConsents] = useState<ConsentSettings>({
    marketing: false,
    analytics: false,
    necessary: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/gdpr/consent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConsents(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch consents:', error);
    }
  };

  const updateConsents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/gdpr/consent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          marketing: consents.marketing,
          analytics: consents.analytics
        })
      });

      if (response.ok) {
        setMessage('Privacy settings updated successfully');
      } else {
        setMessage('Failed to update settings');
      }
    } catch (error) {
      setMessage('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/gdpr/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-data-export.json';
        a.click();
        URL.revokeObjectURL(url);
        setMessage('Data exported successfully');
      } else {
        setMessage('Failed to export data');
      }
    } catch (error) {
      setMessage('Error exporting data');
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/gdpr/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to delete account');
      }
    } catch (error) {
      setMessage('Error deleting account');
    }
    setDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Privacy & Data Settings
      </Typography>

      {message && (
        <Alert 
          severity={message.includes('success') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* Consent Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cookie & Data Consent
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={consents.necessary}
                disabled
              />
            }
            label="Necessary Cookies (Required)"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Essential for the platform to function properly
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={consents.analytics}
                onChange={(e) => setConsents({ ...consents, analytics: e.target.checked })}
              />
            }
            label="Analytics Cookies"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Help us improve the platform by analyzing usage patterns
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={consents.marketing}
                onChange={(e) => setConsents({ ...consents, marketing: e.target.checked })}
              />
            }
            label="Marketing Communications"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Receive updates about new features and opportunities
          </Typography>

          <Button
            variant="contained"
            onClick={updateConsents}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Data Rights
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportData}
              sx={{ mr: 2 }}
            >
              Export My Data
            </Button>
            <Typography variant="body2" color="text.secondary">
              Download all your personal data in JSON format
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete My Account
            </Button>
            <Typography variant="body2" color="text.secondary">
              Permanently delete your account and all associated data
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
            All your data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrivacySettings;