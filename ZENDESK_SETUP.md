# Zendesk Integration Setup Guide

## Overview
This guide will help you integrate the Fongo AI system with your Zendesk instance to automatically create support tickets when customers request callbacks.

## Prerequisites
- Zendesk Admin access
- API token generation permissions

## Step 1: Get Zendesk Credentials

### 1.1 Find Your Zendesk Subdomain
- Your Zendesk URL is: `https://YOUR-SUBDOMAIN.zendesk.com`
- Extract the subdomain (e.g., if URL is `https://fongo.zendesk.com`, subdomain is `fongo`)

### 1.2 Generate API Token
1. Go to **Admin Center** in your Zendesk
2. Navigate to **Apps and integrations** > **APIs** > **Zendesk API**
3. Enable **Token Access**
4. Click **Add API token**
5. Give it a name like "Fongo AI Integration"
6. Copy the generated token (you won't see it again!)

### 1.3 Get Your Email
- Use the email address associated with your Zendesk admin account

## Step 2: Configure Environment Variables

### 2.1 Update Server Environment
SSH into your server and update the `.env` file:

```bash
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50
nano /var/www/nucleusai/.env
```

Add these lines:
```bash
# Zendesk Integration
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-email@fongo.com
ZENDESK_TOKEN=your-api-token
```

### 2.2 Restart the Application
```bash
pm2 restart nucleusai
```

## Step 3: Test the Integration

### 3.1 Test Connection
```bash
cd /var/www/nucleusai
node test-zendesk.js
```

### 3.2 Expected Output
```
🧪 Testing Zendesk Integration...

1. Testing Zendesk connection...
✅ Zendesk connection successful: Your Name

2. Creating test ticket...
✅ Test ticket created successfully!
   Ticket ID: 12345
   Ticket URL: https://your-subdomain.zendesk.com/agent/tickets/12345

🎉 Zendesk integration test complete!
```

## Step 4: Verify Custom Fields

The system uses these Zendesk custom fields (IDs from Fongo's requirements):
- **22026703**: Phone number field
- **22075352**: Service type field  
- **22256532**: Inquiry type field
- **22038468**: Priority field

If these field IDs don't match your Zendesk instance, you'll need to:
1. Go to **Admin Center** > **Objects and rules** > **Tickets** > **Fields**
2. Find the correct field IDs
3. Update the field IDs in `routes/webhook.js`

## Step 5: Test Live Integration

### 5.1 Make a Test Call
1. Call your Fongo number
2. When Fona asks if you want to talk to a live agent, say "yes"
3. Provide the requested information
4. Check your Zendesk for the new ticket

### 5.2 Monitor Logs
```bash
pm2 logs nucleusai --lines 20
```

Look for:
- `✅ Zendesk ticket created: [ticket-id]`
- `❌ Zendesk ticket creation failed: [error]`

## Troubleshooting

### Common Issues

**1. Authentication Failed**
- Verify your email and token are correct
- Ensure token access is enabled in Zendesk

**2. Custom Field Errors**
- Check that field IDs exist in your Zendesk
- Verify field types match the expected values

**3. Permission Errors**
- Ensure your Zendesk user has ticket creation permissions
- Check that the API token has sufficient permissions

### Debug Commands

```bash
# Test connection only
node -e "require('./services/zendesk').testZendeskConnection()"

# Check environment variables
node -e "console.log(process.env.ZENDESK_SUBDOMAIN)"

# View recent logs
pm2 logs nucleusai --lines 50
```

## Security Notes

- Never commit API tokens to version control
- Use environment variables for all credentials
- Regularly rotate API tokens
- Monitor API usage in Zendesk

## Support

If you encounter issues:
1. Check the server logs: `pm2 logs nucleusai`
2. Verify Zendesk credentials
3. Test with the provided test script
4. Contact Zendesk support if API issues persist

---

**Once configured, the system will automatically create Zendesk tickets when customers request callbacks through Fona!** 🎉
