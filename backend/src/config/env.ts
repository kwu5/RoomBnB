import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  jwt: {
    secret: (process.env.JWT_SECRET || 'your-secret-key') as string,
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    apiSecret: process.env.CLOUDINARY_API_SECRET as string,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY as string | undefined,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string | undefined,
  },
};
