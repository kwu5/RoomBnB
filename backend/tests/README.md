# Auth System Testing Guide

This directory contains different ways to test the authentication system.

## Test Files

### 1. auth.http - Manual HTTP Tests
**Best for:** Quick manual testing in VS Code

**Setup:**
1. Install "REST Client" extension in VS Code
2. Start your backend: `docker-compose -f docker-compose.dev.yml up`
3. Open `auth.http`
4. Click "Send Request" above each test

**Features:**
- ✅ Register new users
- ✅ Test login
- ✅ Test validation errors
- ✅ Test protected endpoints
- ✅ Easy to modify and re-run

### 2. auth.test.ts - Automated Jest Tests
**Best for:** Automated testing, CI/CD pipelines

**Run tests:**
```bash
# Inside backend directory
npm test tests/auth.test.ts

# Or with coverage
npm run test:ci
```

**Features:**
- ✅ Full test suite with assertions
- ✅ Automatic cleanup
- ✅ Tests all success and error cases
- ✅ Generates unique test data

### 3. test-auth.sh - Bash Script
**Best for:** Quick smoke tests, no dependencies needed

**Run:**
```bash
# Make executable (first time only)
chmod +x backend/scripts/test-auth.sh

# Run tests
./backend/scripts/test-auth.sh

# Or from backend directory
cd backend && ./scripts/test-auth.sh
```

**Features:**
- ✅ No external dependencies (just curl)
- ✅ Colored output
- ✅ Creates real test user
- ✅ Tests all endpoints in sequence

## Quick Start

### Option 1: VS Code REST Client (Recommended for beginners)
```bash
1. Start Docker: docker-compose -f docker-compose.dev.yml up
2. Open: backend/tests/auth.http
3. Click "Send Request" on any test
```

### Option 2: Bash Script (Fastest)
```bash
1. Start Docker: docker-compose -f docker-compose.dev.yml up
2. Run: ./backend/scripts/test-auth.sh
```

### Option 3: Jest (Most comprehensive)
```bash
1. Start Docker: docker-compose -f docker-compose.dev.yml up
2. Run: cd backend && npm test tests/auth.test.ts
```

## Test Coverage

All three test files cover:

| Test Case | auth.http | auth.test.ts | test-auth.sh |
|-----------|-----------|--------------|--------------|
| Register new user | ✅ | ✅ | ✅ |
| Duplicate email error | ✅ | ✅ | - |
| Validation errors | ✅ | ✅ | ✅ |
| Successful login | ✅ | ✅ | ✅ |
| Invalid credentials | ✅ | ✅ | ✅ |
| Get profile (authenticated) | ✅ | ✅ | ✅ |
| Get profile (no auth) | ✅ | ✅ | ✅ |
| Update profile | ✅ | ✅ | ✅ |
| Invalid token | ✅ | ✅ | - |

## Expected Results

### Successful Registration
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "isHost": false
    },
    "token": "eyJhbGc..."
  }
}
```

### Successful Login
```json
{
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### Get Profile (Authenticated)
```json
{
  "data": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

### Validation Error
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "code": "too_small",
      "minimum": 6,
      "path": ["password"],
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

## Troubleshooting

**Backend not responding:**
```bash
# Check if backend is running
docker ps | grep backend

# View backend logs
docker-compose -f docker-compose.dev.yml logs backend
```

**Tests failing:**
```bash
# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

**Port already in use:**
```bash
# Backend should be on port 5000
curl http://localhost:5000/api/health
```

---

# Reviews System Seed Script

## Overview

The `seed-reviews.sh` script creates comprehensive test data for the Reviews System, including test users, properties, completed bookings, and reviews.

## Usage

### Basic Usage
```bash
cd backend
./tests/seed-reviews.sh
```

### Clean Mode (Delete Existing Reviews First)
```bash
./tests/seed-reviews.sh --clean
# or
./tests/seed-reviews.sh -c
```

## Prerequisites

1. **PostgreSQL Running**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Environment Variables**
   - Ensure `.env` file exists with `DATABASE_URL` configured

3. **Prisma Setup**
   ```bash
   npm run migrate
   npm run generate
   ```

## Test Data Created

### Users (5 total)
| Email | Password | Role | Name |
|-------|----------|------|------|
| host@test.com | Password123! | Host | Sarah Johnson |
| guest1@test.com | Password123! | Guest | John Smith |
| guest2@test.com | Password123! | Guest | Emily Davis |
| guest3@test.com | Password123! | Guest | Michael Brown |
| guest4@test.com | Password123! | Guest | Jessica Wilson |

### Properties (2 total)
1. **Luxury Downtown Apartment** - San Francisco, $150/night
2. **Cozy Beach House** - Malibu, $200/night

### Bookings (8 total)
- 4 completed bookings per property
- All bookings are in the past (completed status)
- Each guest has booked each property once

### Reviews (8 total)
- Ratings from 3⭐ to 5⭐
- Realistic comments matching rating levels
- Created 2 days after checkout

## Testing the Reviews System

### 1. Start Servers
```bash
# Backend
npm run dev

# Frontend (new terminal)
cd ../frontend && npm run dev
```

### 2. Login
Use any test user credentials above

### 3. Test Scenarios

**View Reviews:**
- Navigate to property detail pages
- See reviews with ratings, comments, dates
- Check average rating calculations

**Create Review:**
- Login as a guest with completed booking
- Navigate to booked property
- See review form (only if eligible)
- Submit review and verify it appears

**Validations:**
- Form only appears for users with completed bookings
- Can't review same booking twice
- Comment must be at least 10 characters
- Rating must be 1-5

## API Testing

### Get Property Reviews (Public)
```bash
curl http://localhost:5000/api/reviews/property/{propertyId}
```

### Create Review (Auth Required)
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "propertyId": "{propertyId}",
    "bookingId": "{bookingId}",
    "rating": 5,
    "comment": "Amazing experience!"
  }'
```

### Check User Review (Auth Required)
```bash
curl http://localhost:5000/api/reviews/user-review/{propertyId} \
  -H "Authorization: Bearer {token}"
```

## Troubleshooting

**Script won't run:**
```bash
# Make executable
chmod +x tests/seed-reviews.sh
```

**Database connection failed:**
```bash
# Check Docker
docker ps | grep postgres

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

**Unique constraint errors:**
```bash
# Run with clean flag
./tests/seed-reviews.sh --clean
```

## Clean Up

Remove test data:
```bash
# Clean reviews only
./tests/seed-reviews.sh --clean

# View/delete via Prisma Studio
npm run studio
```
