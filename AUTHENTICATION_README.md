# 🔐 Authentication & Dashboard Access

## Dashboard URL
**Production**: `http://134.122.37.50:3000/`

## 👥 User Credentials

### Administrator Accounts

#### Pete (Nucleus AI)
- **Email**: `pete@nucleus.com`
- **Password**: `NucleusAI2025!Secure`
- **Role**: Admin
- **Access**: Full dashboard access

#### Joe (Fongo)
- **Email**: `joe@fongo.com`
- **Password**: `FongoAdmin2025#Safe`
- **Role**: Admin
- **Access**: Full dashboard access

---

## 🎨 Dashboard Features

### Professional Salesforce-Style UI
- ✅ Clean, modern design inspired by Salesforce Lightning
- ✅ Fongo official branding and colors (#032d60, #0066cc)
- ✅ Real Fongo logos from `/public/Images/`
- ✅ Responsive design for mobile and desktop
- ✅ Font Awesome icons throughout

### Authentication
- ✅ Secure login with bcrypt password hashing (10 rounds)
- ✅ Session management (24-hour sessions)
- ✅ Protected dashboard routes
- ✅ User avatar with initials
- ✅ Logout functionality

### Dashboard Components

#### 1. Top Navigation Bar
- Fongo logo (white version for dark background)
- User avatar with initials
- User name display
- Logout button

#### 2. Stats Cards
- **Total Calls**: All-time call count with phone icon
- **Successful**: Completed updates with check icon (green)
- **Failed**: Errors encountered with X icon (red)
- **Avg Duration**: Average call time with clock icon (orange)

#### 3. Reports & Export Section
Six powerful reporting options:
- 📅 **Today's Calls**: Export today's data as CSV
- 📆 **This Week**: Export last 7 days
- 📈 **This Month**: Export last 30 days
- 💾 **Export All (CSV)**: Complete database export
- ✅ **Success Rate**: View statistics with percentages
- 💳 **Card Types**: Distribution breakdown

#### 4. Search Functionality
- Real-time search by phone number, customer name, or date
- Auto-complete with 500ms debounce
- Search icon indicator

#### 5. Calls Table
Professional table with:
- Date & Time
- **Customer** (cardholder name from credit card)
- Phone Number (formatted)
- Card Type (Visa/MasterCard/Amex with badges)
- Last 4 Digits (masked: •••• 1234)
- New Expiry Date
- Duration (seconds)
- Status (Success/Failed/Pending badges)

#### 6. Auto-Refresh
- Automatic data refresh every 30 seconds
- Manual refresh button (floating action button)

---

## 🔒 Security Features

### Password Security
- All passwords hashed with bcrypt (salt rounds: 10)
- Passwords never stored in plain text
- Password validation on login

### Session Management
- Express-session with secure cookies
- HttpOnly cookies (prevents XSS attacks)
- Secure flag enabled in production (HTTPS only)
- 24-hour session duration
- Session data stored server-side

### Route Protection
- Protected routes: `/`, `/dashboard/*`
- Public routes: `/login`, `/webhook`, `/llm-websocket`, `/health`
- Authentication middleware checks all protected routes
- Automatic redirect to login for unauthorized access
- JSON responses for AJAX requests

### API Security
- Webhook endpoints remain public for Retell AI
- Dashboard API endpoints require authentication
- Session validation on every request

---

## 🎨 Branding & Colors

### Fongo Color Palette
- **Primary Blue**: `#032d60` (Dark Navy)
- **Secondary Blue**: `#0066cc` (Bright Blue)
- **Success Green**: `#04844b` (Dark Green)
- **Warning Orange**: `#ffb75d` (Orange)
- **Error Red**: `#ea001e` (Red)
- **Background**: `#f3f3f3` (Light Gray)
- **Text Primary**: `#032d60` (Dark Navy)
- **Text Secondary**: `#706e6b` (Gray)

### Typography
- **Font Family**: Salesforce Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
- **Headers**: Bold (700), 18-28px
- **Body**: Regular (400), 13-14px
- **Stats**: Bold (700), 32px

### Logos Used
- **Top Navigation**: `/Images/fongo-wp-logo-white.svg` (white version)
- **Login Page**: `/Images/fongo-logo-canada-header.svg` (blue version)
- **Fallback**: Text logo if images fail to load

---

## 📁 File Structure

```
/Users/petercross/Fongo Credit Card Updates/
├── auth/
│   └── users.js                 # User credentials and verification
├── middleware/
│   └── auth.js                  # Authentication middleware
├── routes/
│   ├── auth.js                  # Login/logout endpoints
│   ├── dashboard.js             # Dashboard API
│   ├── webhook.js               # Retell AI webhooks
│   └── llm.js                   # WebSocket for LLM
├── public/
│   ├── login.html               # Login page
│   ├── dashboard.html           # Main dashboard (protected)
│   └── Images/
│       ├── fongo-wp-logo-white.svg
│       ├── fongo-logo-canada-header.svg
│       └── ...
├── services/
│   └── database.js              # SQLite database service
├── database/
│   ├── schema.sql               # Database schema
│   └── calls.db                 # SQLite database (gitignored)
└── index.js                     # Main server file
```

---

## 🚀 Deployment Notes

### Environment Variables
```bash
PORT=3000
NODE_ENV=production
SESSION_SECRET=fongo-nucleus-ai-secret-key-2025  # Change in production!
NUCLEUS_API_KEY=key_dfc6862d300570f9dc8950062ea8
NUCLEUS_AGENT_ID=agent_5d5544d760a895af6b862c1318
WEBHOOK_SECRET=fongo-webhook-secret-2025
FONGO_API_URL=https://secure.freephoneline.ca/mobile/updatecc.pl
```

### Server Details
- **IP**: `134.122.37.50`
- **Provider**: DigitalOcean
- **OS**: Ubuntu
- **Process Manager**: PM2
- **Port**: 3000

### Deployment Commands
```bash
# Local: Push changes
git add -A && git commit -m "Update" && git push origin main

# Deploy to server
scp -i ~/.ssh/nucleusai_server -r auth middleware routes public index.js package.json root@134.122.37.50:/var/www/nucleusai/

# Restart server
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "cd /var/www/nucleusai && npm install && pm2 restart nucleusai"
```

---

## 📝 Adding New Users

To add a new user, follow these steps:

### 1. Generate Password Hash
```javascript
const bcrypt = require('bcrypt');
const password = 'YourSecurePassword123!';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

### 2. Add to auth/users.js
```javascript
{
  email: 'newuser@example.com',
  password: '$2b$10$...', // paste hash here
  name: 'User Name',
  role: 'Admin'
}
```

### 3. Deploy Changes
```bash
scp -i ~/.ssh/nucleusai_server auth/users.js root@134.122.37.50:/var/www/nucleusai/auth/
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "pm2 restart nucleusai"
```

---

## 🐛 Troubleshooting

### "Cannot GET /" Error
- Verify server is running: `pm2 status`
- Check logs: `pm2 logs nucleusai`
- Restart: `pm2 restart nucleusai`

### Login Not Working
1. Check browser console for errors
2. Verify credentials are correct
3. Check server logs for authentication errors
4. Ensure session secret is set in `.env`

### Dashboard Not Loading Data
1. Check if you're logged in
2. Verify database exists: `/var/www/nucleusai/database/calls.db`
3. Check API endpoints: `/dashboard/api/summary`, `/dashboard/api/calls`
4. Review server logs for database errors

### Session Expires Too Quickly
- Default: 24 hours
- Change in `index.js`: `maxAge: 24 * 60 * 60 * 1000`

---

## 📞 Support

For issues or questions:
- **Technical**: pete@nucleus.com
- **Fongo**: joe@fongo.com

---

## 🔄 Version History

### v2.0.0 (October 8, 2025)
- ✅ Added secure authentication system
- ✅ Complete dashboard redesign (Salesforce-style)
- ✅ Integrated Fongo official logos
- ✅ Updated to Fongo brand colors
- ✅ Added user management
- ✅ Enhanced security with bcrypt and sessions
- ✅ Improved mobile responsiveness
- ✅ Added Font Awesome icons

### v1.0.0 (October 7, 2025)
- ✅ Initial dashboard with basic stats
- ✅ Call logging and monitoring
- ✅ CSV export functionality
- ✅ Real-time updates

---

© 2025 Fongo. All rights reserved. • Powered by NUCLEUS AI

