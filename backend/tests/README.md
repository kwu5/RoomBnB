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
