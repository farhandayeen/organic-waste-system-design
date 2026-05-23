#!/bin/bash

# Project Setup & Verification Script

echo "🔍 Checking Organic Waste Management System Setup..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "\n${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION installed"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check pnpm
echo -e "\n${YELLOW}Checking pnpm...${NC}"
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓${NC} pnpm $PNPM_VERSION installed"
else
    echo -e "${RED}✗${NC} pnpm not found. Installing..."
    npm install -g pnpm
fi

# Check .env.local
echo -e "\n${YELLOW}Checking environment variables...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
else
    echo -e "${YELLOW}⚠${NC} .env.local not found. Creating from example..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠${NC} Please edit .env.local with your settings"
fi

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=" .env.local; then
    echo -e "${GREEN}✓${NC} DATABASE_URL configured"
else
    echo -e "${RED}✗${NC} DATABASE_URL not configured in .env.local"
fi

# Check if NEXTAUTH_SECRET is set
if grep -q "NEXTAUTH_SECRET=" .env.local; then
    echo -e "${GREEN}✓${NC} NEXTAUTH_SECRET configured"
else
    echo -e "${RED}✗${NC} NEXTAUTH_SECRET not configured. Generating..."
    SECRET=$(openssl rand -base64 32)
    sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$SECRET/" .env.local
    echo -e "${GREEN}✓${NC} NEXTAUTH_SECRET generated"
fi

# Check dependencies
echo -e "\n${YELLOW}Checking dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Installing dependencies..."
    pnpm install
fi

# Check database migrations
echo -e "\n${YELLOW}Database Migration Status...${NC}"
echo -e "${YELLOW}To run migrations:${NC}"
echo "  pnpm db:push"
echo ""
echo -e "${YELLOW}To view database (Drizzle Studio):${NC}"
echo "  pnpm db:studio"

# Show next steps
echo -e "\n${GREEN}✅ Setup verification complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure DATABASE_URL in .env.local"
echo "2. Run: pnpm db:push"
echo "3. Run: pnpm dev"
echo "4. Open: http://localhost:3000"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "- GETTING_STARTED.md - Quick start guide"
echo "- ARCHITECTURE.md - System architecture"
echo "- CODE_REVIEW.md - Issues found and fixes"
echo "- SECURITY_HARDENING.md - Security features"
echo ""
