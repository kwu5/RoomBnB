#!/bin/bash

# RoomBnB Booking API Test Script

API_URL="http://localhost:5000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TIMESTAMP=$(date +%s)
GUEST_EMAIL="guest-${TIMESTAMP}@example.com"
GUEST_PASSWORD="GuestPass123!"
GUEST_TOKEN=""
PROPERTY_ID=""
BOOKING_ID=""

echo "========================================="
echo "  RoomBnB Booking API Tests"
echo "========================================="
echo ""

# Step 1: Register and login as guest
echo -e "${YELLOW}Step 1: Register Guest${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${GUEST_EMAIL}\",
    \"password\": \"${GUEST_PASSWORD}\",
    \"firstName\": \"Test\",
    \"lastName\": \"Guest\"
  }")

if echo "$RESPONSE" | grep -q "User registered successfully"; then
  echo -e "${GREEN}✓ Guest registered${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
  exit 1
fi

# Login
RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${GUEST_EMAIL}\",
    \"password\": \"${GUEST_PASSWORD}\"
  }")

if echo "$RESPONSE" | grep -q "Login successful"; then
  echo -e "${GREEN}✓ Guest logged in${NC}"
  GUEST_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
  echo -e "${RED}✗ Login failed${NC}"
  exit 1
fi
echo ""

# Step 2: Get a property to book
echo -e "${YELLOW}Step 2: Get Available Property${NC}"
RESPONSE=$(curl -s -X GET "${API_URL}/properties")

if echo "$RESPONSE" | grep -q "data"; then
  PROPERTY_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [ ! -z "$PROPERTY_ID" ]; then
    echo -e "${GREEN}✓ Found property: ${PROPERTY_ID}${NC}"
  else
    echo -e "${YELLOW}⚠ No properties available${NC}"
    echo -e "${BLUE}ℹ Create a property first using test-property.sh${NC}"
    exit 0
  fi
else
  echo -e "${RED}✗ Failed to get properties${NC}"
  exit 1
fi
echo ""

# Step 3: Create booking
echo -e "${YELLOW}Step 3: Create Booking${NC}"
TOMORROW=$(date -u -d "+1 day" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-12-20T00:00:00.000Z")
CHECKOUT=$(date -u -d "+5 days" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+5d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || echo "2025-12-25T00:00:00.000Z")

RESPONSE=$(curl -s -X POST "${API_URL}/bookings" \
  -H "Authorization: Bearer ${GUEST_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"propertyId\": \"${PROPERTY_ID}\",
    \"checkIn\": \"${TOMORROW}\",
    \"checkOut\": \"${CHECKOUT}\",
    \"numberOfGuests\": 2,
    \"specialRequests\": \"Late check-in please\"
  }")

if echo "$RESPONSE" | grep -q "Booking created successfully"; then
  echo -e "${GREEN}✓ Booking created${NC}"
  BOOKING_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "  Booking ID: ${BOOKING_ID}"
else
  echo -e "${RED}✗ Booking creation failed${NC}"
  echo "$RESPONSE"
fi
echo ""

# Step 4: Get guest bookings
echo -e "${YELLOW}Step 4: Get Guest Bookings${NC}"
RESPONSE=$(curl -s -X GET "${API_URL}/bookings/guest" \
  -H "Authorization: Bearer ${GUEST_TOKEN}")

if echo "$RESPONSE" | grep -q "data"; then
  echo -e "${GREEN}✓ Retrieved guest bookings${NC}"
  BOOKING_COUNT=$(echo "$RESPONSE" | grep -o '"id":' | wc -l)
  echo "  Guest has ${BOOKING_COUNT} bookings"
else
  echo -e "${RED}✗ Failed${NC}"
fi
echo ""

if [ ! -z "$BOOKING_ID" ]; then
  # Step 5: Get booking by ID
  echo -e "${YELLOW}Step 5: Get Booking by ID${NC}"
  RESPONSE=$(curl -s -X GET "${API_URL}/bookings/${BOOKING_ID}" \
    -H "Authorization: Bearer ${GUEST_TOKEN}")

  if echo "$RESPONSE" | grep -q "${BOOKING_ID}"; then
    echo -e "${GREEN}✓ Retrieved booking details${NC}"
  else
    echo -e "${RED}✗ Failed${NC}"
  fi
  echo ""

  # Step 6: Cancel booking
  echo -e "${YELLOW}Step 6: Cancel Booking${NC}"
  RESPONSE=$(curl -s -X PUT "${API_URL}/bookings/${BOOKING_ID}/cancel" \
    -H "Authorization: Bearer ${GUEST_TOKEN}")

  if echo "$RESPONSE" | grep -q "Booking cancelled successfully"; then
    echo -e "${GREEN}✓ Booking cancelled${NC}"
  else
    echo -e "${RED}✗ Cancellation failed${NC}"
  fi
  echo ""

  # Step 7: Try to cancel again (should fail)
  echo -e "${YELLOW}Step 7: Try Cancel Again (Should Fail)${NC}"
  RESPONSE=$(curl -s -X PUT "${API_URL}/bookings/${BOOKING_ID}/cancel" \
    -H "Authorization: Bearer ${GUEST_TOKEN}")

  if echo "$RESPONSE" | grep -q "already cancelled"; then
    echo -e "${GREEN}✓ Correctly rejected double cancellation${NC}"
  else
    echo -e "${RED}✗ Should have rejected${NC}"
  fi
fi

echo ""
echo "========================================="
echo -e "${GREEN}Tests completed!${NC}"
echo "========================================="
echo ""
echo "Guest: ${GUEST_EMAIL}"
echo "Password: ${GUEST_PASSWORD}"
