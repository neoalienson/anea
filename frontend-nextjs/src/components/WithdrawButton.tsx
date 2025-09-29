'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Cancel as CancelIcon, Warning as WarningIcon } from '@mui/icons-material';

interface WithdrawButtonProps {
  type: 'application' | 'campaign';
  id: string;
  title: string;
  onSuccess?: (id?: string) => void;
  disabled?: boolean;
  variant?: 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const WithdrawButton: React.FC<WithdrawButtonProps> = ({
  type,
  id,
  title,
  onSuccess,
  disabled = false,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = () => {
    setOpen(true);
    setReason('');
    setError('');
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setReason('');
      setError('');
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      setError('');

      console.log(`Withdrawing ${type}:`, id);

      const endpoint = type === 'application' 
        ? `/api/withdrawals/application/${id}`
        : `/api/withdrawals/campaign/${id}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason.trim() || undefined
        })
      });

      const data = await response.json();
      console.log(`Withdrawal response:`, { response: response.ok, data });

      if (!response.ok) {
        throw new Error(data.message || `Failed to withdraw ${type}`);
      }

            // Success
      setOpen(false);
      
      // Show success message (you might want to use a toast/snackbar instead)
      const successMessage = data.message || `${type === 'application' ? 'Application' : 'Campaign'} withdrawn successfully!`;
      
      // Call success callback first (to update UI immediately)
  onSuccess?.(id);
      
      // Then show success notification
      setTimeout(() => {
        alert(successMessage);
      }, 100); // Small delay to let UI update first

    } catch (err) {
      console.error(`Withdraw ${type} error:`, err);
      setError(err instanceof Error ? err.message : `Failed to withdraw ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (type === 'application') {
      return 'Withdraw Application';
    }
    return 'Cancel Campaign';
  };

  const getDialogTitle = () => {
    if (type === 'application') {
      return 'Withdraw Application';
    }
    return 'Cancel Campaign';
  };

  const getWarningMessage = () => {
    if (type === 'application') {
      return 'Are you sure you want to withdraw your application? This action cannot be undone and you will not be considered for this campaign.';
    }
    return 'Are you sure you want to cancel this campaign? This will automatically decline all pending applications and cannot be undone.';
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        color="error"
        startIcon={<CancelIcon />}
        onClick={handleOpen}
        disabled={disabled}
        fullWidth={fullWidth}
      >
        {getButtonText()}
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            {getDialogTitle()}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="warning">
              {getWarningMessage()}
            </Alert>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>{type === 'application' ? 'Campaign' : 'Campaign'}:</strong> {title}
            </Typography>

            <TextField
              label="Reason for withdrawal (optional)"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Please share why you're ${type === 'application' ? 'withdrawing your application' : 'cancelling this campaign'}`}
              fullWidth
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleClose}
            disabled={loading}
          >
            Keep {type === 'application' ? 'Application' : 'Campaign'}
          </Button>
          <Button 
            onClick={handleWithdraw}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {loading ? 'Processing...' : `Confirm ${type === 'application' ? 'Withdrawal' : 'Cancellation'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WithdrawButton;