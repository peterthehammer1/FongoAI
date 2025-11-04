# Deploy call-details.html to Server

The call details page is missing on the server. Deploy it using:

```bash
cd /var/www/nucleusai && curl -o public/call-details.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/call-details.html && ls -lh public/call-details.html && pm2 restart nucleusai && echo "✓ call-details.html deployed"
```

