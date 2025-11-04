# Add DNS Records to DigitalOcean

## Quick Setup

### Option 1: Using the Script (Easiest)

1. **Get your DigitalOcean API Token:**
   - Go to: https://cloud.digitalocean.com/account/api/tokens
   - Click "Generate New Token"
   - Name it: "DNS Management"
   - Copy the token (you'll only see it once!)

2. **Run the script:**
   ```bash
   DIGITALOCEAN_API_TOKEN=your_token_here node scripts/add-dns-records.js
   ```

3. **Wait 5-10 minutes** for DNS propagation

4. **Test:**
   ```bash
   dig fongoai.com +short
   # Should show: 134.122.37.50
   ```

### Option 2: Manual Setup via DigitalOcean Dashboard

1. Go to: https://cloud.digitalocean.com/networking/domains
2. Click "Add Domain" (if `fongoai.com` isn't already there)
3. Enter domain: `fongoai.com`
4. Add these A records:
   - **Name:** `@` → **Value:** `134.122.37.50` → **TTL:** `3600`
   - **Name:** `www` → **Value:** `134.122.37.50` → **TTL:** `3600`
5. Click "Create Record" for each
6. Wait 5-10 minutes for propagation

## Verify DNS Records

After adding records, verify they're correct:

```bash
# Check if records are set
dig @ns1.digitalocean.com fongoai.com +short

# Should return: 134.122.37.50
```

## Troubleshooting

### "Domain not found" error
- The domain needs to be added to DigitalOcean first
- Go to DigitalOcean Dashboard → Networking → Domains
- Click "Add Domain" and enter `fongoai.com`

### DNS not resolving
- Wait longer (up to 24 hours for nameserver changes)
- Clear your DNS cache: `sudo dscacheutil -flushcache` (macOS)
- Check propagation: https://www.whatsmydns.net/#A/fongoai.com

### Records already exist
- The script will tell you if records already exist
- If they point to wrong IP, update them manually in DigitalOcean dashboard

