# Upload dashboard.html to Server

Since you're already on the server, the easiest way is to copy the file content directly. 

## Option 1: Copy from local machine (if you have SSH keys)

From your LOCAL machine (not the server), run:

```bash
scp public/dashboard.html root@134.122.37.50:/var/www/nucleusai/public/
```

## Option 2: Create file directly on server using base64

From your LOCAL machine, encode the file:

```bash
base64 public/dashboard.html > dashboard-base64.txt
```

Then on the SERVER, decode it:

```bash
cd /var/www/nucleusai
base64 -d > public/dashboard.html << 'EOF'
# Paste the base64 content here
EOF
```

## Option 3: Use the script I created

The script `create-dashboard-html-on-server.sh` contains the full HTML. You can:

1. Copy the script content to the server
2. Run it: `bash create-dashboard-html-on-server.sh`

Or, if you have the file locally, just upload it with the SCP command from Option 1.

## After uploading:

```bash
pm2 restart nucleusai
ls -lh public/dashboard.html  # Should show ~30KB file
```

