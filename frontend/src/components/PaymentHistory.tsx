import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress
} from '@mui/material';

interface Payment {
  id: string;
  amount: number;
  platform_fee: number;
  kol_amount: number;
  status: string;
  campaign_title?: string;
  kol_name?: string;
  business_name?: string;
  created_at: string;
  completed_at?: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Payment History
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign/KOL</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Platform Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.campaign_title || 'Campaign'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.kol_name || payment.business_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${payment.amount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Net: ${payment.kol_amount}
                      </Typography>
                    </TableCell>
                    <TableCell>${payment.platform_fee}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {payments.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No payment history found.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentHistory;