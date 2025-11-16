---
description: Set up or migrate to custom magic code authentication
auto_execution_mode: 3
---

# Setup Auth - Custom Magic Code Implementation

⛔ **CRITICAL: This workflow has mandatory sequential steps. Do not skip or reorder steps.**

## ⚠️ Windows Command Syntax Reminder

All commands in this workflow must use Windows syntax:
- Prefix all commands with `cmd /c`
- Use backslashes (`\`) for paths, not forward slashes (`/`)
- Quote paths containing spaces
- Example: `cmd /c node .windsurf\tools\schema-query.js --index`

---

## Purpose

This workflow guides implementation of custom magic code (OTP) authentication. It will:
1. Load the production-ready implementation guide
2. Check for existing auth systems
3. Present options: build from scratch or migrate
4. Guide the implementation process

**IMPORTANT: All steps must be completed sequentially. Do not skip steps.**

---

## Step 1: Load Custom Magic Code Guide (REQUIRED)

Read the complete implementation guide:

Read `/.windsurf/guides/auth-and-access.md`

This guide contains:
- Architecture overview (why custom auth wins)
- Database schema (users + verification_code tables)
- Server actions (sendMagicCode, verifyMagicCode)
- API routes (GET /api/auth/user, POST /api/auth/logout)
- Route protection via middleware
- Two-stage sign-in form
- Component specifications (CodeInput, UserHeader)
- Admin user management
- Email design (dark theme)
- Security checklist
- Complete sign-in flow
- Troubleshooting guide

**⚠️ Wait for Step 1 to complete before proceeding to Step 2.**

---

## Step 2: Check Current Auth System (REQUIRED)

**AI ACTION REQUIRED**: Inspect the current database schema to determine auth status.

Run this command to check for existing auth tables:

```bash
cmd /c node .windsurf\tools\schema-query.js --index
```

Then check for these tables:
- `users` table (indicates existing auth)
- `verification_code` table (indicates custom magic code already implemented)
- `sessions` table (indicates session-based auth)
- `accounts` table (indicates OAuth/external auth)

**Report findings**:
- ✅ No auth tables found → Proceed to Step 3a (Build from scratch)
- ✅ Custom magic code tables found → Proceed to Step 3b (Already implemented)
- ✅ Other auth system found → Proceed to Step 3c (Migration decision)

**⚠️ Do not proceed to Step 3 until auth system status is determined.**

---

## Step 3a: Build Custom Magic Code from Scratch (IF NO AUTH EXISTS)

**Scope**: Implement complete custom magic code authentication system

**Implementation checklist**:
- [ ] Database schema created (users + verification_code tables)
- [ ] Environment variables configured (RESEND_API_KEY, JWT_SECRET, OTP_SECRET_KEY)
- [ ] Server actions implemented (sendMagicCode, verifyMagicCode)
- [ ] API routes created (GET /api/auth/user, POST /api/auth/logout)
- [ ] Middleware configured for route protection (proxy.ts)
- [ ] Sign-in page built (two-stage form: email → code)
- [ ] CodeInput component implemented (6-digit boxes)
- [ ] UserHeader component implemented (profile display)
- [ ] Email template designed (dark theme)
- [ ] Admin user management implemented (create users, manage admin status)
- [ ] Testing completed (all checklist items from guide)

**Key implementation details from guide**:
- Use `window.location.href` (hard redirect) not `router.push()` for cookie pickup
- Include `credentials: 'include'` in all fetch calls
- Hash codes with HMAC-SHA256 (never store plain)
- Max 3 attempts per code, 5-minute expiration
- httpOnly cookies with path=/
- JWT validation on every protected request

**⚠️ Do not proceed until all checklist items are complete and tested.**

---

## Step 3b: Verify Custom Magic Code Implementation (IF ALREADY IMPLEMENTED)

**Status**: Custom magic code authentication is already in place.

**Verification checklist**:
- [ ] Database schema correct (users UUID PK, verification_code with hashed codes)
- [ ] Server actions working (sendMagicCode, verifyMagicCode)
- [ ] API routes functional (GET /api/auth/user, POST /api/auth/logout)
- [ ] Middleware protecting routes (proxy.ts)
- [ ] Sign-in page operational (two-stage form)
- [ ] CodeInput component functional (6-digit input, paste support)
- [ ] UserHeader component displaying correctly (profile with dropdown)
- [ ] Email sending correctly (dark theme, copyable code)
- [ ] Admin management working (create users, manage admin status)
- [ ] All security measures in place (hashed codes, attempt limiting, expiration)

**If all items verified**: Implementation is complete and production-ready.

**If issues found**: Refer to "Troubleshooting" section in auth-and-access.md guide.

---

## Step 3c: Migrate from Existing Auth System (IF OTHER AUTH EXISTS)

**Decision**: Determine if migration to custom magic code is necessary.

**Questions to answer**:
1. What is the current auth system? (e.g., NextAuth.js, Neon Auth, custom session-based)
2. Is it working well in production?
3. Do you want to migrate to custom magic code for simplicity/flexibility?

**If keeping current system**: No action needed. This workflow is complete.

**If migrating to custom magic code**:

1. **Plan migration**:
   - Backup current auth tables
   - Create new users + verification_code tables
   - Decide on user data migration strategy

2. **Implement custom magic code**:
   - Follow Step 3a implementation checklist
   - Run database migrations

3. **Test thoroughly**:
   - Verify new auth system works
   - Test user login flow
   - Verify protected routes redirect correctly

4. **Migrate existing users** (if applicable):
   - Copy user data to new users table
   - Invalidate old sessions
   - Notify users of auth system change

5. **Remove old auth system**:
   - Delete old auth tables/code
   - Remove old auth environment variables
   - Update middleware/route protection

**⚠️ Do not remove old auth system until new system is fully tested and users are migrated.**

---

## Workflow Completion Checklist

Before considering auth setup complete, verify:
- ✅ Auth system status determined (no auth / custom magic code / other)
- ✅ If building: All implementation checklist items complete
- ✅ If already implemented: All verification items confirmed
- ✅ If migrating: Migration plan executed and tested
- ✅ Database schema correct and indexed
- ✅ Environment variables configured
- ✅ Sign-in flow tested end-to-end
- ✅ Protected routes redirect correctly
- ✅ Email sending works
- ✅ Admin management functional
- ✅ Security measures verified

Only after all items are checked should you consider auth setup complete.

---

## Troubleshooting

**Issue**: Don't know current auth system status  
→ Run `schema-query.js --index` to inspect database tables

**Issue**: Need implementation details  
→ Refer to `/.windsurf/guides/auth-and-access.md` for complete guide

**Issue**: Auth system not working  
→ Check "Common Issues" section in auth-and-access.md guide

**Issue**: Need to restart workflow  
→ Run `/setup-auth` again from the beginning
