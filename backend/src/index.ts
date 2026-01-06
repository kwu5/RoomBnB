import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import prisma from './config/database';
import { BookingService } from './services/booking.service';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use('/api', routes);

app.use(errorHandler);

const PORT = config.port;

const runBookingAutoComplete = async () => {
  try {
    const bookingService = new BookingService();
    const count = await bookingService.completeExpiredBookings();
    if (count > 0) {
      console.log(`[Auto-complete] Marked ${count} bookings as completed`);
    }
  } catch (error) {
    console.error('[Auto-complete] Error completing expired bookings:', error);
  }
};

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    // Run auto-complete on startup
    await runBookingAutoComplete();

    // Run auto-complete every hour
    setInterval(runBookingAutoComplete, 60 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
