# RoomBnB Backend

The backend API for RoomBnB, an Airbnb clone built for educational and portfolio purposes.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Bcrypt
- **Validation**: Zod
- **File Upload**: Multer + Cloudinary
- **Real-time**: Socket.io
- **Payments**: Stripe
- **Security**: Helmet, CORS

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, error handling
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   ├── config/          # Configuration files
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── uploads/             # Temporary file uploads
├── package.json
└── tsconfig.json
```

## Getting Started

You can run this project either with Docker (recommended) or locally.

### Option 1: Docker Setup (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- That's it! Docker handles everything else.

#### Quick Start

1. Clone the repository and navigate to the project root

2. Create a `.env` file in the root directory (optional - for API keys):
   ```bash
   cp backend/.env.example .env
   ```

3. Start all services with Docker Compose:

   **For Development (with hot-reload):**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

   **For Production:**
   ```bash
   docker-compose up
   ```

4. Access the services:
   - Frontend: http://localhost:5173 (dev) or http://localhost (prod)
   - Backend API: http://localhost:5000
   - Prisma Studio: http://localhost:5555 (dev only)
   - PostgreSQL: localhost:5432

5. Stop all services:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

#### Docker Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Rebuild containers after code changes
docker-compose -f docker-compose.dev.yml up --build

# Reset database (removes all data)
docker-compose -f docker-compose.dev.yml down -v

# Run Prisma migrations
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Access backend shell
docker-compose -f docker-compose.dev.yml exec backend sh
```

### Option 2: Local Setup

#### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database
- npm or yarn

#### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the backend directory:
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/roombnb

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   ```

3. Set up the database:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload (nodemon)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm test` - Run tests
- `npx prisma studio` - Open Prisma Studio to view/edit database

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Properties
- `GET /api/properties` - Get all properties (with search & filters)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property (protected, host only)
- `PUT /api/properties/:id` - Update property (protected, owner only)
- `DELETE /api/properties/:id` - Delete property (protected, owner only)

### Bookings
- `POST /api/bookings` - Create new booking (protected)
- `GET /api/bookings/guest` - Get user's bookings as guest (protected)
- `GET /api/bookings/host` - Get bookings for host's properties (protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (protected)

### Reviews
- `POST /api/reviews` - Create review (protected)
- `GET /api/properties/:id/reviews` - Get reviews for property

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent (protected)
- `POST /api/payments/webhook` - Stripe webhook handler

### Messages
- `GET /api/messages/:conversationId` - Get conversation messages (protected)
- `POST /api/messages` - Send message (protected)

## Database Schema

### Core Models

**User**
- id, email, password (hashed), firstName, lastName
- avatar, phone, isHost
- createdAt, updatedAt

**Property**
- id, title, description, pricePerNight, cleaningFee
- bedrooms, bathrooms, maxGuests
- address, city, country, latitude, longitude
- amenities (JSON), propertyType, images (array)
- hostId (foreign key to User)
- createdAt, updatedAt

**Booking**
- id, checkIn, checkOut, totalPrice, status
- propertyId (FK), guestId (FK)
- numberOfGuests, specialRequests
- createdAt, updatedAt

**Review**
- id, rating, comment
- propertyId (FK), userId (FK), bookingId (FK)
- createdAt, updatedAt

**Message**
- id, content, isRead
- senderId (FK), receiverId (FK), conversationId
- createdAt

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No (for image uploads) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No (for image uploads) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No (for image uploads) |
| `STRIPE_SECRET_KEY` | Stripe secret key | No (for payments) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | No (for payments) |
| `SMTP_HOST` | SMTP server host | No (for emails) |
| `SMTP_PORT` | SMTP server port | No (for emails) |
| `SMTP_USER` | SMTP username | No (for emails) |
| `SMTP_PASS` | SMTP password | No (for emails) |

## Development Workflow

1. Create feature branches for new features
2. Follow RESTful API design principles
3. Use TypeScript types for all functions and data
4. Implement proper error handling and validation
5. Use Prisma for all database operations
6. Write middleware for common operations (auth, validation, error handling)
7. Follow conventional commit messages (feat, fix, chore, etc.)

## Security Best Practices

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Helmet for security headers
- CORS configured for frontend domain
- Input validation with Zod
- SQL injection prevention via Prisma ORM
- Rate limiting (planned)
- XSS protection (planned)

## Testing

```bash
npm test
```

Testing strategy:
- Unit tests for services and utilities
- Integration tests for API endpoints
- End-to-end tests for critical user flows

## Deployment

### With Docker (Recommended)

The project includes production-ready Docker configuration:

1. **Build and push images**:
   ```bash
   docker build -t roombnb-backend:latest ./backend
   docker build -t roombnb-frontend:latest ./frontend
   ```

2. **Deploy to container platforms**:
   - Railway (supports Docker)
   - Render (supports Docker)
   - Fly.io (supports Docker)
   - DigitalOcean App Platform
   - AWS ECS/Fargate
   - Google Cloud Run

3. **Use docker-compose.yml** for simple deployments or orchestrate with Kubernetes for larger scale

### Traditional Deployment

#### Recommended Platforms
- **Backend**: Railway, Render, or Fly.io
- **Database**: Neon, Supabase, or Railway PostgreSQL

#### Deployment Steps
1. Set up production database
2. Configure environment variables on hosting platform
3. Run database migrations: `npx prisma migrate deploy`
4. Deploy application
5. Configure CORS for production frontend domain
6. Set up SSL certificates (usually automatic on modern platforms)

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Socket.io Documentation](https://socket.io/docs/v4/)

## License

This project is created for educational and portfolio purposes only. Not affiliated with Airbnb, Inc.
