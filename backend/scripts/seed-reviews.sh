#!/bin/bash

# Seed Reviews Script
# This script seeds the database with test users, properties, bookings, and reviews
# for testing the Reviews System

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  RoomBnB Reviews System - Seed Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Change to backend directory
cd "$BACKEND_DIR"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Could not find package.json${NC}"
    echo -e "${RED}Please run this script from the backend directory${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    npm install
fi

# Check for --clean flag
CLEAN_FLAG=""
if [ "$1" == "--clean" ] || [ "$1" == "-c" ]; then
    echo -e "${YELLOW}🧹 Clean mode enabled - will delete existing reviews${NC}"
    CLEAN_FLAG="--clean"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo -e "${YELLOW}   Make sure DATABASE_URL is configured${NC}"
    echo ""
fi

# Check if Docker is running (if using Docker)
if command -v docker &> /dev/null; then
    if ! docker info &> /dev/null; then
        echo -e "${YELLOW}⚠️  Warning: Docker daemon is not running${NC}"
        echo -e "${YELLOW}   If you're using Docker for PostgreSQL, please start it${NC}"
        echo ""
    fi
fi

# Run the TypeScript seed file
echo -e "${GREEN}🌱 Running seed script...${NC}"
echo ""

npx tsx scripts/seed-reviews.ts $CLEAN_FLAG

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  ✅ Seed completed successfully!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "${BLUE}📝 Next Steps:${NC}"
    echo ""
    echo -e "  ${YELLOW}1.${NC} Start the backend server:"
    echo -e "     ${BLUE}npm run dev${NC}"
    echo ""
    echo -e "  ${YELLOW}2.${NC} Start the frontend server:"
    echo -e "     ${BLUE}cd ../frontend && npm run dev${NC}"
    echo ""
    echo -e "  ${YELLOW}3.${NC} Login with test credentials:"
    echo -e "     ${GREEN}Email:${NC} host@test.com"
    echo -e "     ${GREEN}Password:${NC} Password123!"
    echo -e "     ${BLUE}or${NC}"
    echo -e "     ${GREEN}Email:${NC} guest1@test.com (or guest2, guest3, guest4)"
    echo -e "     ${GREEN}Password:${NC} Password123!"
    echo ""
    echo -e "  ${YELLOW}4.${NC} Test the Reviews System:"
    echo -e "     • View properties with existing reviews"
    echo -e "     • See review ratings and comments"
    echo -e "     • Average rating calculations"
    echo -e "     • Review form for completed bookings"
    echo ""
else
    echo ""
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}  ❌ Seed failed!${NC}"
    echo -e "${RED}================================================${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    echo ""
    echo -e "  ${YELLOW}1.${NC} Make sure PostgreSQL is running:"
    echo -e "     ${BLUE}# If using Docker:${NC}"
    echo -e "     ${BLUE}docker-compose up -d${NC}"
    echo ""
    echo -e "  ${YELLOW}2.${NC} Check DATABASE_URL in .env file:"
    echo -e "     ${BLUE}DATABASE_URL=\"postgresql://user:password@localhost:5432/roombnb\"${NC}"
    echo ""
    echo -e "  ${YELLOW}3.${NC} Run Prisma migrations:"
    echo -e "     ${BLUE}npm run migrate${NC}"
    echo ""
    echo -e "  ${YELLOW}4.${NC} Generate Prisma Client:"
    echo -e "     ${BLUE}npm run generate${NC}"
    echo ""
    exit 1
fi
