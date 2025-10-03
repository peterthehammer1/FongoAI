# Fongo Credit Card Update AI Agent

An AI-powered voice agent built with Retell AI that handles inbound calls for updating customer credit card information. The agent authenticates callers by their caller ID and securely collects new credit card details.

## 🚀 Features

- **Voice Authentication**: Uses caller ID for automatic authentication
- **Secure Data Collection**: Collects credit card information through natural conversation
- **API Integration**: Updates credit cards via Fongo's secure API endpoint
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Conversation State Management**: Tracks conversation flow and user data
- **Real-time Processing**: WebSocket-based communication with Retell AI

## 📋 Prerequisites

- Node.js 16+ 
- Retell AI account and API key
- Domain with HTTPS support for webhooks
- Fongo API access

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   cd "Fongo Credit Card Updates"
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your actual values:
   ```env
   RETELL_API_KEY=your_retell_api_key_here
   RETELL_AGENT_ID=your_agent_id_here
   PORT=3000
   WEBHOOK_SECRET=your_webhook_secret_here
   FONGO_API_URL=https://secure.freephoneline.ca/mobile/updatecc.pl
   DOMAIN=your-domain.com
   NODE_ENV=production
   ```

## 🤖 Creating the Retell AI Agent

1. **Go to Retell AI Dashboard:**
   - Visit [https://dashboard.retellai.com](https://dashboard.retellai.com)
   - Sign up or log in to your account

2. **Create New Agent:**
   - Click "Create Agent"
   - Use the configuration from `retell-agent-config.json`
   - Update the webhook URLs with your domain:
     - Webhook URL: `https://your-domain.com/webhook`
     - LLM WebSocket URL: `wss://your-domain.com/llm-websocket`

3. **Configure Agent Settings:**
   - **Voice**: Anna (11labs_anna) - professional female voice
   - **Language**: English (US)
   - **Transcriber**: Deepgram Nova-2
   - **Max Duration**: 30 minutes
   - **Silence Timeout**: 30 seconds

4. **Get Agent ID:**
   - Copy the Agent ID from the dashboard
   - Add it to your `.env` file

## 🚀 Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/fongo-credit-card-agent.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Update Retell AI Configuration:**
   - Update webhook URLs in Retell AI dashboard with your Vercel domain
   - Test the agent

### Option 2: Deploy to Other Platforms

The application can be deployed to any platform that supports Node.js:
- Railway
- Render
- Heroku
- AWS Lambda
- Google Cloud Run

## 🔧 Local Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test webhook endpoint:**
   ```bash
   curl -X POST http://localhost:3000/webhook \
     -H "Content-Type: application/json" \
     -d '{"event": "test", "call": {"call_id": "test123"}}'
   ```

3. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

## 📞 How It Works

### Conversation Flow

1. **Greeting**: Agent greets caller and confirms phone number
2. **Authentication**: Uses caller ID for automatic authentication
3. **Data Collection**: Collects credit card number, expiration month/year
4. **Validation**: Validates credit card using Luhn algorithm
5. **Confirmation**: Confirms details with caller
6. **API Call**: Updates credit card via Fongo API
7. **Result**: Provides success confirmation or error message

### API Integration

The agent makes GET requests to:
```
https://secure.freephoneline.ca/mobile/updatecc.pl?phone=15195551234&payinfo=5524000000000000&month=09&year=2026
```

**Parameters:**
- `phone`: 11-digit phone number
- `payinfo`: 16-digit credit card number
- `month`: 2-digit expiration month (01-12)
- `year`: 4-digit expiration year

**Responses:**
- Success: `{ success: 1 }`
- Error: `{ success: 0, error: "Reason" }`

## 🛡️ Security Features

- **PII Redaction**: Deepgram transcriber redacts sensitive information
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Secure error messages without exposing sensitive data
- **HTTPS Only**: All webhooks require HTTPS
- **Rate Limiting**: Built-in protection against abuse

## 📊 Monitoring

The application logs all important events:
- Call start/end events
- API requests and responses
- Error conditions
- Conversation state changes

Monitor logs through your deployment platform's logging system.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test individual components:
```bash
# Test API integration
node -e "const api = require('./services/fongoApi'); console.log('API module loaded successfully');"

# Test conversation state
node -e "const state = require('./services/conversationState'); console.log('Conversation state module loaded successfully');"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RETELL_API_KEY` | Your Retell AI API key | Yes |
| `RETELL_AGENT_ID` | Your Retell AI agent ID | Yes |
| `PORT` | Server port (default: 3000) | No |
| `WEBHOOK_SECRET` | Webhook secret for security | Yes |
| `FONGO_API_URL` | Fongo API endpoint | Yes |
| `DOMAIN` | Your domain for webhooks | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Agent Configuration

Key settings in `retell-agent-config.json`:
- **Voice**: Professional female voice (Anna)
- **Language**: English (US)
- **Transcriber**: Deepgram Nova-2 with PII redaction
- **Max Duration**: 30 minutes
- **Silence Timeout**: 30 seconds

## 🚨 Error Handling

The agent handles various error scenarios:

- **Customer Not Found**: Invalid phone number
- **Payment Type Error**: Current payment method incompatible
- **No Existing Card**: No card on file to update
- **API Faults**: Technical issues with Fongo API
- **Invalid Data**: Malformed credit card information
- **Network Issues**: Connection problems

## 📞 Support

For issues or questions:
1. Check the logs for error details
2. Verify environment variables are set correctly
3. Test API endpoints manually
4. Contact Retell AI support for agent issues
5. Contact Fongo support for API issues

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: Remember to deploy from GitHub rather than locally, as per your preferences. The agent will be accessible via the phone number you configure in Retell AI dashboard.
