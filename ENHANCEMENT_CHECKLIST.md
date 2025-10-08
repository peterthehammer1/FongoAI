# Enhancement Checklist
## Before Making ANY Changes

### 1. Pre-Change Steps
- [ ] Read `WORKING_PROMPT_BACKUP.md` to understand current working state
- [ ] Create a new Git branch for the enhancement
- [ ] Document what you're trying to achieve
- [ ] Identify which files will be modified

### 2. Making Changes
- [ ] Make ONE change at a time
- [ ] Test after each change
- [ ] Document the change in this file
- [ ] Commit to Git with clear message

### 3. Testing After Changes
- [ ] Test Visa card (16 digits, 3-digit CVV)
- [ ] Test MasterCard (16 digits, 3-digit CVV)
- [ ] Test American Express (15 digits, 4-digit CVV)
- [ ] Test DTMF input (keypad entry)
- [ ] Test Voice input (spoken numbers)
- [ ] Test English language
- [ ] Test at least one other language (French/Spanish)
- [ ] Verify read-back format (individual digits, natural pauses)
- [ ] Verify no "pause" word spoken
- [ ] Verify no reading after each piece
- [ ] Verify successful API call to Fongo
- [ ] Verify correct success/failure message

### 4. If Something Breaks
- [ ] Check `pm2 logs nucleusai` on server
- [ ] Check webhook response in Retell AI dashboard
- [ ] Rollback using instructions in `WORKING_PROMPT_BACKUP.md`
- [ ] Document what went wrong

### 5. If Everything Works
- [ ] Merge branch to main
- [ ] Update `WORKING_PROMPT_BACKUP.md` with new version
- [ ] Create new JSON backup
- [ ] Tag the commit: `git tag -a v1.X -m "Description"`

---

## Enhancement Log

### Template for New Enhancements
```
### [Date] - [Enhancement Name]
**Goal**: What are we trying to achieve?
**Files Modified**: List of files
**Changes Made**: Description of changes
**Testing Results**: Pass/Fail for each test
**Status**: ✅ Working / ❌ Broken / 🔄 In Progress
**Rollback Needed**: Yes/No
**Notes**: Any additional information
```

---

### October 8, 2025 - Baseline (Version 5)
**Goal**: Document current working state
**Status**: ✅ Working
**Notes**: All features tested and working perfectly
- Visa/MC/Amex support ✅
- DTMF support ✅
- Multilingual support ✅
- Correct read-back format ✅
- Fongo API integration ✅

---

## Next Enhancement (Planned)

### [Date] - [Name]
**Goal**: 
**Expected Impact**: 
**Risk Level**: Low / Medium / High
**Rollback Plan**: 


