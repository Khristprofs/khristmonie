require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const bankRoute = require('./routes/bankRoute');
const branchRoute = require('./routes/branchRoute');
const userRoute = require('./routes/userRoute');
const profileRoute = require('./routes/profileRoute');
const accountRoute = require('./routes/accountRoute');
const userAccountRoute = require('./routes/userAccountRoute');
const transactionRoute = require('./routes/transactionRoute');
const notificationRoute = require('./routes/notificationRoute');
const cardRoute = require('./routes/cardRoute');
const loanRoute = require('./routes/loanRoute');
const loanRepaymentRoute = require('./routes/loanRepaymentRoute');
const authRoute = require('./routes/authRoute');
const refreshRoute = require('./routes/refreshRoute');
const healthRoute = require('./routes/healthRoute');
const adminRoutes = require('./routes/adminRoute');

const db = require('./models');

const app = express();
const PORT = process.env.PORT || 2000;

// ========================
// Middleware
// ========================

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

// ========================
// Routes
// ========================

app.use('/api/v1/bank', bankRoute);
app.use('/api/v1/branch', branchRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/profile', profileRoute);
app.use('/api/v1/account', accountRoute);
app.use('/api/v1/joint', userAccountRoute);
app.use('/api/v1/transaction', transactionRoute);
app.use('/api/v1/notification', notificationRoute);
app.use('/api/v1/card', cardRoute);
app.use('/api/v1/loan', loanRoute);
app.use('/api/v1/repayment', loanRepaymentRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/refresh', refreshRoute);
app.use('/api/v1/health', healthRoute);
app.use('/api/v1/admin', adminRoutes);

// ========================
// Startup
// ========================

const startServer = async () => {
  try {
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

    await db.sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    // Safe sync
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync();
      console.log('✅ Database synced successfully');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Database startup error:', error);
    process.exit(1);
  }
};

startServer();