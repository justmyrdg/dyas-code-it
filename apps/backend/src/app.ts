import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import './config/env';
import passport from './config/passport';
import { authRouter } from './routes/auth.routes';
import { adminRouter } from './routes/admin.routes';
import { teacherRouter } from './routes/teacher.routes';
import { studentRouter } from './routes/student.routes';
import { codeRouter } from './routes/code.routes';
import { publicRouter } from './routes/public.routes';
import { stripeWebhook } from './controllers/subscription.controller';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:4200',
  process.env.APP_URL || 'http://localhost:4201',
];

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
// Stripe webhook must see the raw request bytes for signature verification, so
// it is mounted BEFORE the JSON body parser.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/student', studentRouter);
app.use('/api/code', codeRouter);
app.use('/api/public', publicRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
    },
  });
});

export default app;
