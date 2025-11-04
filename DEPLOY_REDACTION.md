# Deploy Credit Card Redaction

Credit card numbers will now be redacted in transcripts, showing only the last 4 digits.

## Deployment:

Run this on the server:

```bash
cd /var/www/nucleusai && curl -o public/call-details.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/call-details.html && curl -o public/comprehensive-call-details.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/comprehensive-call-details.html && pm2 restart nucleusai && echo "✓ Redaction deployed"
```

## What This Does:

- **Detects credit card numbers** in transcripts (13-19 digits)
- **Redacts** to show only last 4 digits: `**** **** **** 1234`
- **Preserves formatting** (spaces, dashes if present)
- **Only affects display** - full numbers remain in database
- **Applies to both**:
  - Call Details page (`/dashboard/call/:callId`)
  - Comprehensive Call Details page (`/dashboard/comprehensive-call/:callId`)

## Examples:

- `1234567890123456` → `****3456`
- `1234 5678 9012 3456` → `**** **** **** 3456`
- `1234-5678-9012-3456` → `****-****-****-3456`

