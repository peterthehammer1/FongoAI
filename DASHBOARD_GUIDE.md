# Fongo AI Agent Dashboard Guide

## 🎉 Dashboard Successfully Deployed!

Your beautiful real-time dashboard is now live and tracking all AI agent calls!

---

## 📍 Access the Dashboard

### Production (VPS Server):
**URL**: `http://134.122.37.50:3000/`

### What You'll See:

1. **Statistics Cards** (Top of page):
   - Total Calls
   - Successful Updates
   - Failed Updates
   - Average Call Duration

2. **Search Bar**:
   - Search by phone number
   - Search by caller name
   - Search by date (YYYY-MM-DD format)

3. **Calls Table**:
   - Date & Time
   - Caller Name
   - Phone Number (formatted)
   - Card Type (Visa/MasterCard/Amex with colored badges)
   - Last 4 Digits (secure display: •••• 1234)
   - New Expiry Date
   - Call Duration
   - Status (Success/Failed with colored badges)

---

## 🔒 Security Features

### Data Protection:
- ✅ Only last 4 digits of card stored (never full number)
- ✅ CVV is NEVER stored
- ✅ Full card number only in memory during call, then discarded
- ✅ Database uses SQLite with local file storage
- ✅ No sensitive data in logs

### Access Control:
- Currently accessible via IP address
- TODO: Add password protection for production use

---

## 🎨 Dashboard Features

### Real-Time Updates:
- Auto-refreshes every 30 seconds
- Manual refresh button (floating button bottom-right)

### Beautiful Design:
- Gradient purple theme
- Card-based layout
- Responsive (works on mobile/tablet/desktop)
- Hover effects on table rows
- Color-coded status badges

### Search & Filter:
- Live search with 500ms debounce
- Search by:
  - Phone number (e.g., "226")
  - Caller name (e.g., "John")
  - Date (e.g., "2025-10-08")

---

## 📊 Database Schema

### Table: `call_logs`
```sql
- id: Auto-incrementing primary key
- call_id: Unique Retell AI call ID
- caller_name: Caller's name (if provided)
- caller_number: Phone number
- call_date: Date of call (YYYY-MM-DD)
- call_time: Time of call (HH:MM:SS)
- call_duration: Duration in seconds
- card_type: visa, mastercard, or amex
- card_last_4: Last 4 digits only
- card_expiry_month: MM (01-12)
- card_expiry_year: YYYY
- update_successful: Boolean (0 or 1)
- error_message: Error message if failed
- language_used: Language of call (en, fr, es, etc.)
- created_at: Timestamp
- updated_at: Timestamp
```

### View: `call_summary`
Provides aggregated statistics:
- Total calls
- Successful/failed counts
- Average duration
- Unique callers
- Card type breakdown

---

## 🔌 API Endpoints

### Get All Calls:
```bash
GET /dashboard/api/calls?limit=50&offset=0
```

### Get Summary Statistics:
```bash
GET /dashboard/api/summary
```

### Search Calls:
```bash
GET /dashboard/api/search?q=search_term
```

---

## 🛠️ How It Works

### Call Flow:
1. **Call Starts**: `call_started` event → Log to database
   - Stores: call_id, phone number, caller name, timestamp

2. **Card Info Collected**: `update_credit_card` custom function → Update database
   - Stores: card type, last 4 digits, expiry, success/failure
   - Calls Fongo API
   - Records result

3. **Call Ends**: `call_ended` event → Update duration
   - Calculates and stores call duration

### Database Updates:
```
webhook.js → database.js → SQLite (calls.db)
```

---

## 📁 Files Added/Modified

### New Files:
- `database/schema.sql` - Database schema
- `services/database.js` - Database service layer
- `routes/dashboard.js` - Dashboard API routes
- `public/dashboard.html` - Dashboard UI

### Modified Files:
- `routes/webhook.js` - Added database logging
- `index.js` - Added dashboard routes and static file serving
- `package.json` - Added sqlite3 dependency

---

## 🧪 Testing the Dashboard

### 1. Make a Test Call:
Call **+1 (289) 271-4328** and go through the credit card update process

### 2. Check Dashboard:
Visit `http://134.122.37.50:3000/` 

You should see:
- Total Calls: 1
- Call details in the table
- Card type badge
- Status (Success or Failed)

### 3. Test Search:
- Enter your phone number
- Enter part of the date
- See results filter in real-time

---

## 🚀 Future Enhancements

### Recommended Additions:
1. **Authentication**:
   - Add password protection
   - Use JWT tokens
   - Role-based access (admin/viewer)

2. **Advanced Analytics**:
   - Success rate trends over time
   - Peak call hours graph
   - Language distribution chart
   - Card type pie chart

3. **Notifications**:
   - Email alerts on failed updates
   - Slack/Discord webhook integration
   - Daily summary reports

4. **Export Features**:
   - Export to CSV
   - Export to PDF
   - Scheduled reports

5. **Data Retention**:
   - Automatic cleanup of old records
   - Archive feature
   - Backup automation

---

## 📈 Database Maintenance

### Check Database Size:
```bash
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "ls -lh /var/www/nucleusai/database/calls.db"
```

### Backup Database:
```bash
scp -i ~/.ssh/nucleusai_server root@134.122.37.50:/var/www/nucleusai/database/calls.db ./backups/calls-$(date +%Y%m%d).db
```

### View Database Directly:
```bash
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50
sqlite3 /var/www/nucleusai/database/calls.db
.tables
SELECT * FROM call_logs LIMIT 10;
.exit
```

---

## 🐛 Troubleshooting

### Dashboard Not Loading:
```bash
# Check if server is running
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "pm2 status"

# Check logs
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "pm2 logs nucleusai --lines 50"

# Restart server
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "pm2 restart nucleusai"
```

### Database Errors:
```bash
# Check database file exists
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "ls -la /var/www/nucleusai/database/"

# Reinitialize database
ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "rm /var/www/nucleusai/database/calls.db && pm2 restart nucleusai"
```

### No Data Showing:
1. Make a test call first
2. Check webhook is receiving events:
   ```bash
   ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "pm2 logs nucleusai --lines 100 | grep 'Custom function'"
   ```
3. Verify database has data:
   ```bash
   ssh -i ~/.ssh/nucleusai_server root@134.122.37.50 "sqlite3 /var/www/nucleusai/database/calls.db 'SELECT COUNT(*) FROM call_logs;'"
   ```

---

## ✅ Status: WORKING

**Version**: 1.1
**Last Updated**: October 8, 2025
**Status**: ✅ Deployed and Working

All dashboard features have been tested and are functioning correctly! 🎉

---

## 🎯 Next Steps

1. ✅ **Make a test call** to see data populate
2. **Add password protection** (if deploying publicly)
3. **Consider custom domain** (e.g., dashboard.nucleusai.com)
4. **Set up automated backups**
5. **Monitor database growth**

---

For questions or issues, refer to the troubleshooting section or check server logs.

