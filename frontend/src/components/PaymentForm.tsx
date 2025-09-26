import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Divider
} from '@mui/material';

const stripePromise = loadStripe('pk_test_your_publishable_key_here');

interface PaymentFormProps {
  campaignId: string;
  kolId: string;
  amount: number;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({ campaignId, kolId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('http://localhost:8000/api/payments/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          campaignId,
          kolId,
          amount
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setPaymentDetails(data.data);

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>

        {paymentDetails && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Amount: ${paymentDetails.amount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Platform Fee (5%): ${paymentDetails.platformFee}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              KOL Amount: ${paymentDetails.kolAmount}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!stripe || loading}
            size="large"
          >
            {loading ? 'Processing...' : `Pay $${amount}`}
          </Button>
        </form>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Your payment is secured by Stripe. We never store your card details.
        </Typography>
      </CardContent>
    </Card>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;