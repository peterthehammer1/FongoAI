#!/bin/bash
# Deploy Cody user to DigitalOcean server

echo "Generating password hash for cody@fongo.com..."
cd /var/www/nucleusai

# Generate the hash
HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Fongo2025!Cody', 10).then(hash => console.log(hash));")

# Wait for hash generation
sleep 2

# Backup users file
cp auth/users.js auth/users.js.backup

# Check if user already exists
if grep -q "cody@fongo.com" auth/users.js; then
  echo "User cody@fongo.com already exists. Updating..."
  # Update existing user's password hash
  sed -i "s|email: 'cody@fongo.com',|email: 'cody@fongo.com',|" auth/users.js
  # Replace the password line for cody
  sed -i "/email: 'cody@fongo.com'/,/role: 'Admin'/{s|password: '[^']*',|password: '$HASH',|}" auth/users.js
else
  echo "Adding new user cody@fongo.com..."
  # Add user before closing bracket
  sed -i "/email: 'joe@fongo.com'/,/role: 'Admin'/a\\
  ,\\
  {\\
    email: 'cody@fongo.com',\\
    password: '$HASH', // Fongo2025!Cody\\
    name: 'Cody',\\
    role: 'Admin'\\
  }" auth/users.js
fi

echo "Restarting application..."
pm2 restart nucleusai

sleep 2
pm2 status nucleusai

echo ""
echo "✓ User cody@fongo.com added!"
echo "   Email: cody@fongo.com"
echo "   Password: Fongo2025!Cody"
echo "   Name: Cody"
echo "   Role: Admin"

