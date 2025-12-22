#!/bin/bash

# RoomBnB Property API Test Script

API_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TIMESTAMP=$(date +%s)
HOST_EMAIL="host-${TIMESTAMP}@example.com"
HOST_PASSWORD="HostPass123!"
HOST_TOKEN=""
PROPERTY_ID=""

echo "========================================="
echo "  RoomBnB Property API Tests"
echo "========================================="
echo ""

# Step 1: Register and login as host
echo -e "${YELLOW}Step 1: Register Host${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${HOST_EMAIL}\",
    \"password\": \"${HOST_PASSWORD}\",
    \"firstName\": \"Property\",
    \"lastName\": \"Host\",
    \"isHost\": true
  }")

if echo "$RESPONSE" | grep -q "User registered successfully"; then
  echo -e "${GREEN}✓ Host registered${NC}"
  USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "${BLUE}ℹ User ID: ${USER_ID}${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
  exit 1
fi

# Login
RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${HOST_EMAIL}\",
    \"password\": \"${HOST_PASSWORD}\"
  }")

if echo "$RESPONSE" | grep -q "Login successful"; then
  echo -e "${GREEN}✓ Host logged in${NC}"
  HOST_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
  echo -e "${RED}✗ Login failed${NC}"
  exit 1
fi
echo ""

# Test 2: Get all properties
echo -e "${YELLOW}Test 2: Get All Properties${NC}"
RESPONSE=$(curl -s -X GET "${API_URL}/properties")

if echo "$RESPONSE" | grep -q "data"; then
  echo -e "${GREEN}✓ Retrieved properties${NC}"
else
  echo -e "${RED}✗ Failed${NC}"
fi
echo ""

# Test 3: Create property
echo -e "${YELLOW}Test 3: Create Property${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/properties" \
  -H "Authorization: Bearer ${HOST_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Luxury Apartment",
    "description": "A beautiful test property",
    "pricePerNight": 250,
    "cleaningFee": 50,
    "bedrooms": 2,
    "bathrooms": 2,
    "maxGuests": 4,
    "address": "123 Test St",
    "city": "New York",
    "country": "USA",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "amenities": ["WiFi", "Kitchen"],
    "propertyType": "Apartment",
    "images": ["https://example.com/image1.jpg"]
  }')

if echo "$RESPONSE" | grep -q "Property created successfully"; then
  echo -e "${GREEN}✓ Property created${NC}"
  PROPERTY_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
elif echo "$RESPONSE" | grep -q "Host privileges required"; then
  echo -e "${YELLOW}⚠ Host privileges required${NC}"
  echo -e "${BLUE}ℹ Set isHost=true for user: ${USER_ID}${NC}"
  exit 0
else
  echo -e "${RED}✗ Failed${NC}"
fi
echo ""

if [ ! -z "$PROPERTY_ID" ]; then
  # Test 4: Get property by ID
  echo -e "${YELLOW}Test 4: Get Property by ID${NC}"
  RESPONSE=$(curl -s -X GET "${API_URL}/properties/${PROPERTY_ID}")

  if echo "$RESPONSE" | grep -q "Test Luxury Apartment"; then
    echo -e "${GREEN}✓ Retrieved property${NC}"
  else
    echo -e "${RED}✗ Failed${NC}"
  fi
  echo ""

  # Test 5: Update property
  echo -e "${YELLOW}Test 5: Update Property${NC}"
  RESPONSE=$(curl -s -X PUT "${API_URL}/properties/${PROPERTY_ID}" \
    -H "Authorization: Bearer ${HOST_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"title": "Updated Apartment", "pricePerNight": 300}')

  if echo "$RESPONSE" | grep -q "Property updated successfully"; then
    echo -e "${GREEN}✓ Property updated${NC}"
  else
    echo -e "${RED}✗ Failed${NC}"
  fi
  echo ""

  # Test 6: Delete property
  # echo -e "${YELLOW}Test 6: Delete Property${NC}"
  # RESPONSE=$(curl -s -X DELETE "${API_URL}/properties/${PROPERTY_ID}" \
  #   -H "Authorization: Bearer ${HOST_TOKEN}")

  # if echo "$RESPONSE" | grep -q "Property deleted successfully"; then
  #   echo -e "${GREEN}✓ Property deleted${NC}"
  # else
  #   echo -e "${RED}✗ Failed${NC}"
  # fi
fi

echo ""
echo "========================================="
echo -e "${GREEN}Tests completed!${NC}"
echo "========================================="
