# Fix Nginx Config - Commands for Server

## Find Nginx Config File

Run this to find the correct config file:

```bash
# List all Nginx sites
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/

# Check what's currently configured
sudo nginx -T | grep -A 20 "server_name fongoai.com"
```

## Update Nginx Config

Once you find the correct file, update it:

```bash
# Option 1: If file is /etc/nginx/sites-available/fongoai.com
sudo nano /etc/nginx/sites-available/fongoai.com

# Option 2: Or create it if it doesn't exist
sudo nano /etc/nginx/sites-available/fongoai.com
```

In the `/webhook` location block, add:
```
client_max_body_size 10M;
```

Should look like:
```
location /webhook {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30;
    client_max_body_size 10M;  # <-- Add this line
}
```

Then:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Quick Alternative: Add to Main Config

If you can't find the site config, add to main nginx.conf:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside the `http {` block:
```
client_max_body_size 10M;
```

Then:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

