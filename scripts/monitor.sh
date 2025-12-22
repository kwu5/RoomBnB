#!/bin/bash

# Server Monitoring Script
# Run this to check the health of your RoomBnB deployment

echo "📊 RoomBnB Server Status"
echo "========================"
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    cd ~/RoomBnB 2>/dev/null || {
        echo "❌ Not in RoomBnB directory and can't find it"
        exit 1
    }
fi

# Container Status
echo "🐳 Docker Containers:"
docker-compose ps
echo ""

# Disk Usage
echo "💾 Disk Usage:"
df -h / | tail -1 | awk '{print "  Used: " $3 " / " $2 " (" $5 ")"}'
echo ""

# Memory Usage
echo "🧠 Memory Usage:"
free -h | grep Mem | awk '{print "  Used: " $3 " / " $2}'
echo ""

# CPU Load
echo "⚡ CPU Load:"
uptime | awk -F'load average:' '{print "  " $2}'
echo ""

# Docker Container Logs (last 10 lines)
echo "📝 Recent Backend Logs:"
docker-compose logs --tail=10 backend
echo ""

echo "📝 Recent Frontend Logs:"
docker-compose logs --tail=10 frontend
echo ""

# Database Status
echo "🗄️  Database Status:"
docker-compose exec -T postgres pg_isready -U roombnb
echo ""

# Check if services are responding
echo "🌐 Service Health:"
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "  Backend API: ✅ Running"
else
    echo "  Backend API: ❌ Not responding"
fi

if curl -s http://localhost:80 > /dev/null 2>&1; then
    echo "  Frontend: ✅ Running"
else
    echo "  Frontend: ❌ Not responding"
fi
echo ""

# Docker stats (press Ctrl+C to exit)
echo "💻 Live Container Stats (press Ctrl+C to exit):"
echo ""
docker stats --no-stream
