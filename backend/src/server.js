require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { securityHeaders, apiLimiter, authLimiter } = require('./middleware/security');
const { logger } = require('./middleware/audit');

const authRoutes = require('./routes/auth');
const kolRoutes = require('./routes/kols');
const campaignRoutes = require('./routes/campaigns');
const matchingRoutes = require('./routes/matching');
const withdrawalRoutes = require('./routes/withdrawals');
const integrationRoutes = require('./routes/integrations');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payments');
const gdprRoutes = require('./routes/gdpr');

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(securityHeaders);
app.use(cors());
app.use('/api/payments/webhook', paymentRoutes); // Raw body for webhooks
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/search/kols', kolRoutes);
app.use('/api/kols', kolRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/gdpr', gdprRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});