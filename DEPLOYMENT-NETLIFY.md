# ⚠️ Netlify Deployment Limitation

## Issue with WebSocket Support

**Netlify Functions do not support WebSockets**, which is required for the LLM communication with Retell AI. The `llm-websocket` endpoint needs persistent WebSocket connections that Netlify cannot provide.

## Recommended Solutions

### Option 1: Use Vercel (Recommended)
Vercel has excellent WebSocket support and is perfect for this project:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Use Railway
Railway supports WebSockets and is easy to deploy:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Option 3: Use Render
Render also supports WebSockets:

1. Connect your GitHub repository
2. Set environment variables
3. Deploy

## Alternative: Netlify + External WebSocket Service

If you must use Netlify, you could:

1. Deploy the webhook and health endpoints to Netlify
2. Use a separate service (like Railway or Render) for the WebSocket endpoint
3. Update the Retell AI configuration to use the external WebSocket URL

## Current Netlify Configuration

The current setup will work for:
- ✅ Webhook endpoint (`/webhook`)
- ✅ Health check (`/health`)
- ❌ WebSocket endpoint (`/llm-websocket`) - Not supported

## Recommendation

**Use Vercel instead of Netlify** for this project. Vercel:
- ✅ Supports WebSockets
- ✅ Easy GitHub integration
- ✅ Environment variables management
- ✅ Automatic deployments
- ✅ Better for Node.js applications

Would you like me to help you deploy to Vercel instead?
