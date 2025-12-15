#!/bin/bash

# RoomBnB Auth API Test Script
# Quick smoke tests for authentication endpoints

API_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Generate unique email for testing
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"
TEST_PASSWORD="TestPass123!"
TOKEN=""

echo "========================================="
echo "  RoomBnB Auth API Tests"
echo "========================================="
echo ""

# Test 1: Register User
echo -e "${YELLOW}Test 1: Register New User${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

if echo "$RESPONSE" | grep -q "User registered successfully"; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "Token: ${TOKEN:0:20}..."
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "$RESPONSE"
fi
echo ""

# Test 2: Login
echo -e "${YELLOW}Test 2: Login with Credentials${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

if echo "$RESPONSE" | grep -q "Login successful"; then
  echo -e "${GREEN}✓ Login successful${NC}"
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$RESPONSE"
fi
echo ""

# Test 3: Invalid Login
echo -e "${YELLOW}Test 3: Login with Wrong Password${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"wrongpassword\"
  }")

if echo "$RESPONSE" | grep -q "Invalid credentials"; then
  echo -e "${GREEN}✓ Correctly rejected invalid credentials${NC}"
else
  echo -e "${RED}✗ Should have rejected invalid credentials${NC}"
  echo "$RESPONSE"
fi
echo ""

# Test 4: Get Profile with Token
echo -e "${YELLOW}Test 4: Get User Profile (Authenticated)${NC}"
RESPONSE=$(curl -s -X GET "${API_URL}/auth/me" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$RESPONSE" | grep -q "${TEST_EMAIL}"; then
  echo -e "${GREEN}✓ Profile retrieved successfully${NC}"
  echo "$RESPONSE" | head -n 5
else
  echo -e "${RED}✗ Failed to retrieve profile${NC}"
  echo "$RESPONSE"
fi
echo ""

# Test 5: Get Profile without Token
echo -e "${YELLOW}Test 5: Get Profile (No Auth)${NC}"
RESPONSE=$(curl -s -X GET "${API_URL}/auth/me")

if echo "$RESPONSE" | grep -q "Authentication required"; then
  echo -e "${GREEN}✓ Correctly rejected unauthenticated request${NC}"
else
  echo -e "${RED}✗ Should have required authentication${NC}"
  echo "$RESPONSE"
fi
echo ""

# Test 6: Update Profile
echo -e "${YELLOW}Test 6: Update User Profile${NC}"
RESPONSE=$(curl -s -X PUT "${API_URL}/auth/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"firstName\": \"Updated\",
    \"lastName\": \"Name\",
    \"phone\": \"+1234567890\"
  }")

if echo "$RESPONSE" | grep -q "Profile updated successfully"; then
  echo -e "${GREEN}✓ Profile updated successfully${NC}"
else
  echo -e "${RED}✗ Profile update failed${NC}"
  echo "$RESPONSE"
fi
echo ""

# Test 7: Validation Error
echo -e "${YELLOW}Test 7: Register with Invalid Data${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"invalid-email\",
    \"password\": \"123\"
  }")

if echo "$RESPONSE" | grep -q "Validation failed"; then
  echo -e "${GREEN}✓ Correctly rejected invalid data${NC}"
else
  echo -e "${RED}✗ Should have rejected invalid data${NC}"
  echo "$RESPONSE"
fi
echo ""

echo "========================================="
echo -e "${GREEN}All tests completed!${NC}"
echo "========================================="
echo ""
echo "Test user created: ${TEST_EMAIL}"
echo "You can use this account for manual testing."
