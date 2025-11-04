# Retell to Nucleus Migration Plan

## Overview
This document outlines all instances of "Retell" in the codebase and categorizes them into 4 tiers based on removal/replacement impact.

**Total Instances Found:** ~310 occurrences across ~50+ files

---

## TIER 1: Least Impactful (Easy Wins)
**Impact:** Cosmetic/Visual - Comments, documentation, user-facing strings
**Risk:** Very Low
**Effort:** 1-2 hours
**Files to Update:** ~25 files

### User-Facing Text & Comments
- `public/call-details.html` (line 847): Comment "// Populate comprehensive Retell AI data"
- `routes/dashboard.js` (line 333): Comment "// ===== COMPREHENSIVE RETELL AI DATA ENDPOINTS ====="
- `routes/webhook.js`:
  - Line 6: Comment "// Process comprehensive Retell AI data"
  - Line 50: Comment "// Handle custom function calls from Retell AI"
  - Line 326: Comment "// Retell AI sends transcript"
  - Line 339: Comment "// If transcript not in webhook, fetch from Retell API"
- `index.js` (line 37): Comment "// Increase body size limit for Retell AI webhooks"
- `index.js` (line 53): Comment "// Retell AI webhooks don't need auth"

### Documentation Files (Markdown)
- `FIX_413_ERROR.md`: Multiple mentions of "Retell AI"
- `INVESTIGATE_MISSING_CALLS.md`: Multiple mentions
- `VERIFY_WEBHOOK_SETUP.md`: Multiple mentions
- `FIX_MISSING_CALLS.md`: Multiple mentions
- `CHECK_WEBHOOK_STATUS.md`: Multiple mentions
- `DIGITALOCEAN_SETUP_SUMMARY.md`: Multiple mentions
- `MANUAL_DEPLOY_INSTRUCTIONS.md`: Multiple mentions
- `QUICK_START.md`: Multiple mentions
- `DEPLOYMENT_STATUS.md`: Multiple mentions
- `DEPLOY_FONGOAI.md`: Multiple mentions
- `DASHBOARD_GUIDE.md`: Mentions "Retell AI call ID"
- `ENHANCEMENT_CHECKLIST.md`: Mentions "Retell AI dashboard"
- `WORKING_PROMPT_BACKUP.md`: Multiple mentions
- `DEPLOYMENT-GUIDE.md`: Multiple mentions
- `DEPLOYMENT.md`: Multiple mentions
- `README.md`: Multiple mentions

### Database Schema Comments
- `database/schema.sql` (lines 19-20): Comments about "Retell AI"
- `database/retell-comprehensive-schema.sql` (line 1): Comment "Comprehensive Retell AI Data Storage Schema"

### Service Comments
- `services/databaseComprehensive.js` (lines 6-7): Comments about "Retell AI Data"
- `services/retellDataProcessor.js` (lines 4-5): Comments about "Retell AI"

---

## TIER 2: Low Impact (Variable/Function Names)
**Impact:** Code readability - Internal variable names, function names
**Risk:** Low (requires code review)
**Effort:** 2-4 hours
**Files to Update:** ~15 files

### Service Files
- `services/retellDataProcessor.js`:
  - File name: `retellDataProcessor.js` → `nucleusDataProcessor.js`
  - Class name: `RetellDataProcessor` → `NucleusDataProcessor`
  - Method comments mentioning "Retell AI"
  - Variable references in method parameters

### Script Files (Non-Critical)
- `update-retell-prompt-fix-phone-number.js`:
  - File name → `update-nucleus-prompt-fix-phone-number.js`
  - Function name: `updateRetellPrompt()` → `updateNucleusPrompt()`
  - Comments and console.log messages

### Configuration Files
- `retell-agent-config.json` → `nucleus-agent-config.json`
- `retell-agent-config-minimal.json` → `nucleus-agent-config-minimal.json`

### Package.json
- `package.json` (line 4): Description "via Retell AI" → "via Nucleus AI"
- `package.json` (line 28): Keywords array - "retell-ai" → "nucleus-ai"

### Database Schema File Names
- `database/retell-comprehensive-schema.sql` → `database/nucleus-comprehensive-schema.sql`

### Script File Names (Non-Critical)
- `scripts/update-retell-webhook-url.js` → `scripts/update-nucleus-webhook-url.js`
- `scripts/create-retell-agent-http.js` → `scripts/create-nucleus-agent-http.js`
- `scripts/test-retell-connection.js` → `scripts/test-nucleus-connection.js`
- `scripts/create-retell-agent.js` → `scripts/create-nucleus-agent.js`

---

## TIER 3: Medium Impact (Configuration & Schema)
**Impact:** Environment variables, database schema, API references
**Risk:** Medium (requires testing and migration)
**Effort:** 4-8 hours
**Files to Update:** ~10 files

### Environment Variables
- `env.example` (line 1): Comment mentions "Retell AI" (already says "NUCLEUS" for vars)
- `routes/webhook.js` (line 340): `process.env.RETELL_API_KEY` → `process.env.NUCLEUS_API_KEY` (with fallback)
- `scripts/update-retell-webhook-url.js` (lines 10, 13, 16, 37, 62):
  - `RETELL_API_KEY` → `NUCLEUS_API_KEY` (already has fallback to NUCLEUS_API_KEY)
  - `RETELL_AGENT_ID` → `NUCLEUS_AGENT_ID` (already has fallback)

### Database Schema
- `database/retell-comprehensive-schema.sql`:
  - File name (Tier 2)
  - Line 58: Column name `retell_llm_dynamic_variables` → `nucleus_llm_dynamic_variables`
  - Comments throughout

### Service Files
- `services/databaseComprehensive.js`:
  - Line 12: Database path `fongo_comprehensive.db` (no retell in name, OK)
  - Line 30: Schema path references `retell-comprehensive-schema.sql` (needs update)
  - Line 61: Column name `retell_llm_dynamic_variables` in SQL
  - Line 75: Parameter reference `callData.retell_llm_dynamic_variables`

### Import Statements
- `routes/webhook.js` (line 6): `require('../services/retellDataProcessor')` → `require('../services/nucleusDataProcessor')`

### Multiple Script Files
- `scripts/create-agent.js`: `RETELL_API_KEY` references
- `scripts/create-new-custom-agent.js`: `RETELL_API_KEY` references
- `scripts/update-agent-complete.js`: `RETELL_API_KEY` references
- `scripts/update-existing-agent.js`: `RETELL_API_KEY` references
- `scripts/step-by-step-update.js`: `RETELL_API_KEY` references
- `scripts/update-agent-final.js`: `RETELL_API_KEY` references
- `scripts/test-update-agent.js`: `RETELL_API_KEY` references
- `scripts/create-agent-fixed.js`: `RETELL_API_KEY` references
- `scripts/update-fongo-agent-sdk.js`: `RETELL_API_KEY` references
- `scripts/update-fongo-agent.js`: `RETELL_API_KEY` references
- `scripts/create-retell-agent-http.js`: `RETELL_API_KEY` references
- `scripts/test-retell-connection.js`: `RETELL_API_KEY` references
- `scripts/create-retell-agent.js`: `RETELL_API_KEY` references
- `update-retell-prompt-fix-phone-number.js`: `RETELL_API_KEY` references

---

## TIER 4: High Impact (Critical Backend Changes)
**Impact:** API endpoints, SDK usage, core functionality
**Risk:** High (requires extensive testing)
**Effort:** 8-16 hours
**Files to Update:** ~8 critical files

### API Endpoints & URLs
**⚠️ CRITICAL:** These are actual Retell API endpoints that cannot be changed without backend API support

- `routes/webhook.js` (line 343):
  ```javascript
  `https://api.retellai.com/get-call/${callId}`
  ```
  **Action Required:** Check if white-label API endpoint exists (e.g., `api.nucleusai.com`)

- `scripts/update-retell-webhook-url.js` (lines 34, 58):
  ```javascript
  `https://api.retellai.com/get-retell-llm/${AGENT_ID}`
  `https://api.retellai.com/update-retell-llm/${AGENT_ID}`
  ```
  **Action Required:** Check if white-label API endpoints exist

- `update-retell-prompt-fix-phone-number.js` (line 40):
  ```javascript
  `https://api.retellai.com/update-agent/${agentId}`
  ```
  **Action Required:** Check if white-label API endpoint exists

- Multiple script files with `https://api.retellai.com/*` endpoints:
  - `scripts/create-agent.js`
  - `scripts/create-new-custom-agent.js`
  - `scripts/update-agent-complete.js`
  - `scripts/update-existing-agent.js`
  - `scripts/step-by-step-update.js`
  - `scripts/update-agent-final.js`
  - `scripts/test-update-agent.js`
  - `scripts/create-agent-fixed.js`
  - `scripts/update-fongo-agent.js`
  - `scripts/create-retell-agent-http.js`
  - `scripts/test-retell-connection.js`
  - `scripts/create-retell-agent.js`
  - `scripts/update-fongo-agent-sdk.js`

### SDK Import & Usage
**⚠️ CRITICAL:** The `retell-sdk` package name cannot be changed without a custom package

- `package.json` (line 19):
  ```json
  "retell-sdk": "^1.0.0"
  ```
  **Action Required:** 
  - Option A: Create wrapper module that imports `retell-sdk` and re-exports as `nucleus-sdk`
  - Option B: Fork and publish as `nucleus-sdk` (if allowed by license)
  - Option C: Keep package name but use aliases in code

- `scripts/create-agent.js` (line 3):
  ```javascript
  const { RetellClient } = require('retell-sdk');
  ```
  
- `scripts/update-fongo-agent-sdk.js` (line 1):
  ```javascript
  const { RetellClient } = require('retell-sdk');
  ```
  
- `scripts/create-retell-agent.js` (line 1):
  ```javascript
  const { RetellClient } = require('retell-sdk');
  ```

- `routes/llm.js`: May have RetellClient usage

### Dashboard URLs
- Multiple documentation files reference:
  - `https://dashboard.retellai.com`
  **Action Required:** Check if white-label dashboard exists (e.g., `dashboard.nucleusai.com`)

### Database Column Names
- `database/retell-comprehensive-schema.sql` (line 58):
  - Column: `retell_llm_dynamic_variables`
  **Action Required:** 
  - Create migration script to rename column
  - Update all references in code
  - Update `services/databaseComprehensive.js` SQL queries

---

## Summary Statistics

### By Tier:
- **Tier 1 (Easy):** ~150 instances in ~25 files
- **Tier 2 (Low Impact):** ~50 instances in ~15 files
- **Tier 3 (Medium Impact):** ~80 instances in ~10 files
- **Tier 4 (High Impact):** ~30 instances in ~8 critical files

### By Category:
- **Comments/Documentation:** ~150 instances
- **Variable/Function Names:** ~50 instances
- **Environment Variables:** ~30 instances
- **API Endpoints:** ~25 instances
- **SDK Usage:** ~5 instances
- **Database Schema:** ~10 instances
- **File Names:** ~10 files
- **Package Dependencies:** 1 package

---

## Recommended Migration Order

### Phase 1: Tier 1 (Week 1)
- Update all comments and documentation
- Update user-facing strings
- **Risk:** None
- **Testing:** Visual inspection

### Phase 2: Tier 2 (Week 1-2)
- Rename files (non-critical scripts)
- Update variable/function names
- Update package.json description
- **Risk:** Low
- **Testing:** Run scripts, check imports

### Phase 3: Tier 3 (Week 2-3)
- Update environment variable references
- Rename database schema file
- Update database column names (with migration)
- **Risk:** Medium
- **Testing:** Full integration tests, database migration testing

### Phase 4: Tier 4 (Week 3-4)
- **PREREQUISITE:** Verify white-label API endpoints exist
- Update API endpoint URLs (if white-label available)
- Create SDK wrapper or fork
- Update dashboard URLs in docs
- **Risk:** High
- **Testing:** Extensive end-to-end testing, webhook testing, API testing

---

## Critical Questions to Answer Before Tier 4

1. **Does Nucleus have white-label API endpoints?**
   - `api.nucleusai.com` or similar?
   - Same API structure as Retell?

2. **Does Nucleus have a white-label dashboard?**
   - `dashboard.nucleusai.com` or similar?

3. **Can we create a custom SDK package?**
   - License allows forking?
   - Or create wrapper module?

4. **Database migration strategy:**
   - Rename column in production?
   - Create view with aliases?
   - Full migration with downtime?

---

## Notes

- Some files already use `NUCLEUS_API_KEY` as fallback (good!)
- `env.example` already mentions "NUCLEUS" for variables
- Most critical paths already have fallbacks to NUCLEUS_* variables
- API endpoints are the biggest blocker - need white-label API confirmation

