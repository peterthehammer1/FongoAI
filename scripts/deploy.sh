#!/bin/bash

# Fongo Credit Card Agent Deployment Script
# This script helps deploy the agent to various platforms

set -e

echo "🚀 Fongo Credit Card Agent Deployment Script"
echo "=============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please copy env.example to .env and fill in your values:"
    echo "   cp env.example .env"
    echo "   nano .env"
    exit 1
fi

# Check if required environment variables are set
echo "🔍 Checking environment variables..."

source .env

required_vars=("RETELL_API_KEY" "RETELL_AGENT_ID" "DOMAIN")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "your_${var,,}_here" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing or incomplete environment variables:"
    printf '   - %s\n' "${missing_vars[@]}"
    echo "📝 Please update your .env file with actual values"
    exit 1
fi

echo "✅ Environment variables look good!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test || echo "⚠️  Tests failed, but continuing with deployment..."

# Choose deployment platform
echo ""
echo "🌐 Choose deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Railway"
echo "3) Render"
echo "4) Manual deployment"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        echo "📝 Make sure you have:"
        echo "   - Vercel CLI installed (npm i -g vercel)"
        echo "   - GitHub repository set up"
        echo "   - Environment variables configured in Vercel dashboard"
        echo ""
        read -p "Press Enter to continue with Vercel deployment..."
        vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Railway..."
        echo "📝 Make sure you have Railway CLI installed and configured"
        echo ""
        read -p "Press Enter to continue with Railway deployment..."
        railway login
        railway init
        railway up
        ;;
    3)
        echo "🚀 Deploying to Render..."
        echo "📝 Please follow these steps:"
        echo "   1. Push your code to GitHub"
        echo "   2. Connect your GitHub repo to Render"
        echo "   3. Set environment variables in Render dashboard"
        echo "   4. Deploy"
        ;;
    4)
        echo "📋 Manual deployment checklist:"
        echo "   1. Push code to GitHub repository"
        echo "   2. Set up server with Node.js 16+"
        echo "   3. Install dependencies: npm install"
        echo "   4. Set environment variables"
        echo "   5. Start application: npm start"
        echo "   6. Configure reverse proxy (nginx/apache) for HTTPS"
        echo "   7. Update Retell AI webhook URLs"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📞 Next steps:"
echo "   1. Update Retell AI agent webhook URLs with your domain"
echo "   2. Test the agent with a phone call"
echo "   3. Monitor logs for any issues"
echo ""
echo "🔗 Useful links:"
echo "   - Retell AI Dashboard: https://dashboard.retellai.com"
echo "   - Health check: https://$DOMAIN/health"
echo "   - Webhook endpoint: https://$DOMAIN/webhook"
echo ""
echo "📚 Documentation: README.md"
