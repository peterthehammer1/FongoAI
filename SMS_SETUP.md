# SMS Integration Setup Guide

This guide explains how to set up SMS integration for sending account login links to customers.

## Overview

The SMS integration allows Fona to send account login links via text message when customers ask "Can I update my payment information myself online?"

## Supported Providers

### 1. Twilio (Recommended)
- **Pros**: Reliable, good documentation, easy setup
- **Cost**: ~$0.0075 per SMS in US/Canada
- **Setup**: Requires Twilio account and phone number

### 2. Vonage (Nexmo)
- **Pros**: Competitive pricing, good API
- **Cost**: ~$0.0055 per SMS in US/Canada  
- **Setup**: Requires Vonage account

## Setup Instructions

### Option 1: Twilio Setup

1. **Create Twilio Account**
   - Go to [twilio.com](https://twilio.com)
   - Sign up for a free account
   - Verify your phone number

2. **Get Credentials**
   - Go to Console Dashboard
   - Copy your Account SID and Auth Token
   - Purchase a phone number for sending SMS

3. **Update Environment Variables**
   ```bash
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token-here
   TWILIO_FROM_NUMBER=+1234567890
   TEST_PHONE_NUMBER=+1234567890
   ```

### Option 2: Vonage Setup

1. **Create Vonage Account**
   - Go to [developer.vonage.com](https://developer.vonage.com)
   - Sign up for a free account
   - Verify your phone number

2. **Get API Credentials**
   - Go to API Keys section
   - Copy your API Key and API Secret
   - Purchase a phone number for sending SMS

3. **Update Environment Variables**
   ```bash
   SMS_PROVIDER=vonage
   VONAGE_API_KEY=your-api-key-here
   VONAGE_API_SECRET=your-api-secret-here
   VONAGE_FROM_NUMBER=+1234567890
   TEST_PHONE_NUMBER=+1234567890
   ```

## Testing

1. **Update your .env file** with the credentials above

2. **Test the integration**
   ```bash
   node test-sms.js
   ```

3. **Expected output**
   ```
   🧪 SMS Integration Test

   📱 Testing SMS with twilio provider
   📞 Test number: +1234567890

   1. Testing SMS to +1234567890...
   ✅ SMS sent successfully!
      Provider: twilio
      Message ID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   🎉 SMS integration test completed successfully!
   ```

## Deployment

1. **Update server environment**
   ```bash
   # SSH into your server
   ssh root@134.122.37.50
   
   # Edit environment file
   nano /var/www/nucleusai/.env
   
   # Add SMS configuration
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your-sid
   TWILIO_AUTH_TOKEN=your-token
   TWILIO_FROM_NUMBER=your-number
   ```

2. **Restart the application**
   ```bash
   pm2 restart nucleusai
   ```

3. **Test on server**
   ```bash
   cd /var/www/nucleusai
   node test-sms.js
   ```

## Usage in Calls

When a customer asks "Can I update my payment information myself online?", Fona will:

1. Ask for their cell phone number
2. Send SMS with login link: `https://account.fongo.com/login/`
3. Confirm the SMS was sent
4. Explain the overnight charging process

## Message Format

The SMS message sent to customers:
```
Hi! Here's your Fongo account login link: https://account.fongo.com/login/

After updating your credit card, our system will automatically attempt to charge your outstanding balance overnight.
```

## Troubleshooting

### Common Issues

1. **"SMS credentials not configured"**
   - Check that all required environment variables are set
   - Verify the SMS_PROVIDER is correct (twilio or vonage)

2. **"Invalid phone number"**
   - Ensure phone numbers include country code (+1 for US/Canada)
   - Remove any spaces or special characters

3. **"SMS sending failed"**
   - Check API credentials are correct
   - Verify you have sufficient credits/balance
   - Check if the "from" number is verified

### Testing Commands

```bash
# Test SMS integration
node test-sms.js

# Check environment variables
echo $SMS_PROVIDER
echo $TWILIO_ACCOUNT_SID

# View application logs
pm2 logs nucleusai
```

## Cost Considerations

- **Twilio**: ~$0.0075 per SMS
- **Vonage**: ~$0.0055 per SMS
- **Estimated monthly cost**: $5-20 depending on volume

## Security Notes

- Never commit SMS credentials to version control
- Use environment variables for all sensitive data
- Consider rate limiting for SMS sending
- Monitor usage to prevent abuse

## Support

If you encounter issues:
1. Check the test script output
2. Review application logs: `pm2 logs nucleusai`
3. Verify credentials with provider dashboard
4. Test with a known working phone number
