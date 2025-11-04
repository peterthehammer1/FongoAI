# Fix SSL Certificate Issue

The error "No such authorization" means Let's Encrypt can't verify your domain. Common causes:

## Check 1: DNS Propagation

Run this on the server to verify DNS:
```bash
dig fongoai.com +short
dig www.fongoai.com +short
```

Both should return: `134.122.37.50`

## Check 2: Port 80 Accessibility

Let's Encrypt needs to access your server on port 80. Test from outside:

```bash
# From your local machine, test if port 80 is open:
curl -I http://fongoai.com/health
```

If this fails, check firewall:
```bash
# On server:
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Check 3: Nginx Configuration

Make sure Nginx is running and listening on port 80:
```bash
sudo systemctl status nginx
sudo netstat -tlnp | grep :80
```

## Fix: Try Again After Verification

Once DNS and firewall are correct, try again:

```bash
sudo certbot --nginx -d fongoai.com -d www.fongoai.com
```

## Alternative: Use HTTP for Now

If SSL setup is taking too long, you can use HTTP:
- Access: `http://fongoai.com/dashboard` (not https)
- This works right now and is fine for testing

