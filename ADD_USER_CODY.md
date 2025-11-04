# Add User: Cody@fongo.com

## User Details
- **Email**: cody@fongo.com
- **Password**: Fongo2025!Cody
- **Name**: Cody
- **Role**: Admin

## Password Hash Generation

The password hash needs to be generated on the server. Run this command on your DigitalOcean server:

```bash
cd /var/www/nucleusai
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Fongo2025!Cody', 10).then(hash => console.log('Hash:', hash));"
```

Then update `auth/users.js` on the server with the generated hash, or run this complete script:

```bash
cd /var/www/nucleusai

# Generate hash
HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Fongo2025!Cody', 10).then(hash => console.log(hash));")

# Add user to auth/users.js (replace the TEMP HASH line)
sed -i "s|password: '\$2b\$10\$rZ8QqK5YvJxN3mF4pL9hHeO9QwR2sT6uV7xY8zA1bC3dE5fG7hI9j', // Fongo2025!Cody - TEMP HASH|password: '\$HASH', // Fongo2025!Cody|" auth/users.js

# Restart app
pm2 restart nucleusai

echo "✓ User cody@fongo.com added!"
echo "   Password: Fongo2025!Cody"
```

## Or Manual Method

1. SSH to server: `ssh root@134.122.37.50`
2. Generate hash:
   ```bash
   cd /var/www/nucleusai
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Fongo2025!Cody', 10).then(hash => console.log(hash));"
   ```
3. Copy the hash output
4. Edit `auth/users.js`:
   ```bash
   nano auth/users.js
   ```
5. Replace the TEMP HASH line with the actual hash
6. Restart: `pm2 restart nucleusai`

## Quick Deploy from Local

If you have the updated `auth/users.js` locally, deploy it:

```bash
# From local machine
scp auth/users.js root@134.122.37.50:/var/www/nucleusai/auth/
ssh root@134.122.37.50 "cd /var/www/nucleusai && pm2 restart nucleusai"
```

