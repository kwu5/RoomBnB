# RoomBnB

A full-stack Airbnb clone built with React, TypeScript, Node.js, Express, PostgreSQL, and Prisma. This project demonstrates modern web development practices including containerization with Docker.

This project is a clone inspired by Airbnb, created for educational and portfolio purposes only. Not affiliated with Airbnb, Inc.

## Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

**Backend:**
- Node.js + TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Cloudinary (image uploads)
- Stripe (payments)

**DevOps:**
- Docker & Docker Compose
- Multi-stage builds
- Hot-reload development

## Quick Start with Docker

The easiest way to run this project is with Docker. No need to install Node.js, PostgreSQL, or manage dependencies manually.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- That's it!

### Running the Project

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd RoomBnB
   ```

2. **Configure environment variables (optional):**
   ```bash
   # Copy the example env file
   cp backend/.env.example .env

   # Edit .env and add your API keys for:
   # - Cloudinary (for image uploads)
   # - Stripe (for payments)
   # Note: Basic features work without these
   ```

3. **Start the development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API on port 5000
   - Frontend on port 5173
   - Prisma Studio on port 5555

4. **Access the application:**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000
   - **Prisma Studio** (database GUI): http://localhost:5555

5. **Stop the application:**
   ```bash
   # Press Ctrl+C, then:
   docker-compose -f docker-compose.dev.yml down
   ```

### Useful Docker Commands

```bash
# View logs from all services
docker-compose -f docker-compose.dev.yml logs -f

# View logs from a specific service
docker-compose -f docker-compose.dev.yml logs -f backend

# Rebuild containers after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Reset everything (removes database data)
docker-compose -f docker-compose.dev.yml down -v

# Run Prisma migrations
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Seed the database
docker-compose -f docker-compose.dev.yml exec backend npm run seed

# Access backend container shell
docker-compose -f docker-compose.dev.yml exec backend sh

# Access database with psql
docker-compose -f docker-compose.dev.yml exec postgres psql -U roombnb -d roombnb_dev
```

## Local Development (Without Docker)

If you prefer to run the project locally without Docker:

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and API keys
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

## Project Structure

```
RoomBnB/
├── backend/                 # Express API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Entry point
│   ├── prisma/             # Database schema & migrations
│   ├── Dockerfile          # Backend container config
│   └── package.json
│
├── frontend/               # React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API clients
│   │   ├── store/         # State management
│   │   └── types/         # TypeScript types
│   ├── Dockerfile         # Frontend container config
│   ├── nginx.conf         # Production web server config
│   └── package.json
│
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup
└── README.md
```

## Features

- User authentication (register/login)
- Browse properties with filters
- Property details with image galleries
- Booking system with date selection
- User profiles
- Host property management
- Reviews and ratings
- Real-time messaging (planned)
- Payment integration with Stripe (planned)

## API Documentation

Once running, API endpoints are available at:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/properties` - List properties
- `GET /api/properties/:id` - Get property details
- `POST /api/bookings` - Create booking
- And more...

Full API documentation: See [backend/README.md](backend/README.md)

## Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database (automatically configured in Docker)
DATABASE_URL=postgresql://roombnb:roombnb_dev_password@localhost:5432/roombnb_dev

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (optional - for payments)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

## Production Deployment

### Using Docker

The project includes production-ready Docker configuration:

```bash
# Build and run production containers
docker-compose up -d

# Or deploy to:
# - Railway
# - Render
# - Fly.io
# - DigitalOcean App Platform
# - AWS ECS/Fargate
# - Google Cloud Run
```

### Database Migration in Production

```bash
docker-compose exec backend npx prisma migrate deploy
```

## Development Workflow

1. Create a feature branch
2. Make changes (code hot-reloads automatically in Docker dev mode)
3. Test your changes
4. Commit with conventional commit messages
5. Create pull request

## Troubleshooting

**Port already in use:**
```bash
# Change ports in docker-compose.dev.yml or stop conflicting services
```

**Database connection issues:**
```bash
# Reset the database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

**Node modules issues:**
```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build
```

**Hot reload not working:**
- Make sure you're using docker-compose.dev.yml (not docker-compose.yml)
- Check that volume mounts are correct in docker-compose.dev.yml

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is created for educational and portfolio purposes. Not affiliated with Airbnb, Inc.

## Links

- Backend Documentation: [backend/README.md](backend/README.md)
- Frontend Documentation: [frontend/README.md](frontend/README.md)
