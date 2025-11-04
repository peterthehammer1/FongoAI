# Quick Deploy - Copy to Server Console

Run these commands on your DigitalOcean server:

```bash
cd /var/www/nucleusai

# Create services directory if needed
mkdir -p services

# Since GitHub push was blocked, we'll need to manually copy files
# Option 1: Use git pull (if you allow the secret or push separately)
git pull origin main

# Option 2: Manual file transfer
# You'll need to copy the files manually or use the base64 method below
```

## Alternative: Base64 Transfer Method

If git pull doesn't work, I can provide base64-encoded versions of each file that you can paste into the server console.

