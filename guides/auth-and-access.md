# Auth and Access

Custom magic code (OTP) authentication implementation for Next.js App Router.

**IMPORTANT: App Router is mandatory (see workflow: `/load-api-guides` for architecture details).**

---

## Architecture Overview

**Custom Magic Code Auth** (~500 lines): Simplest, most flexible, production-ready.

✅ Full UX control  
✅ No external auth service dependencies  
✅ No per-user licensing fees  
✅ Easy feature additions (2FA, social login, etc.)

---

## Core Principles

- **Fail-fast auth**: Surface failures immediately; no silent fallbacks.
- **Codes hashed**: Never stored plain (HMAC-SHA256).
- **Attempt limiting**: Max 3 attempts per code.
- **Expiration**: 5-minute code validity.
- **User enumeration prevention**: Generic message if email not found.
- **httpOnly cookies**: Can't be accessed by JavaScript.
- **JWT validation**: Verified on every protected request.

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
```

### Verification Code Table
```sql
CREATE TABLE verification_code (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) UNIQUE NOT NULL,
  code VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_verification_code_identifier ON verification_code(identifier);
```

---

## Server Actions

### sendMagicCode()
1. Check user exists (prevent enumeration)
2. Generate 6-digit code
3. Hash with HMAC-SHA256
4. Store in DB with 5-min expiration
5. Send email with dark-themed HTML
6. Return generic success/error message

### verifyMagicCode()
1. Retrieve hashed code from DB
2. Validate expiration
3. Validate attempt limit (max 3)
4. Hash submitted code, compare with stored
5. Increment attempts on failure
6. Create JWT token (1-week expiration, HS256)
7. Set httpOnly cookie with `path=/`
8. Delete used code
9. Return success with userId

**Critical**: Use `window.location.href` (hard redirect) not `router.push()` to ensure cookie pickup.

---

## API Routes

### GET /api/auth/user
- Extracts JWT from `auth_session` cookie
- Verifies JWT with JWT_SECRET
- Returns user data (id, name, email, image, is_admin)
- Returns 401 if no cookie or invalid token

**Important**: Client must include `credentials: 'include'` in fetch.

### POST /api/auth/logout
- Clears `auth_session` cookie (maxAge: 0)
- Client redirects to /auth/signin

---

## Route Protection

Middleware validates JWT on protected routes:
- Redirects unauthenticated users to /auth/signin with redirect param
- Validates JWT on every request
- Fails fast on invalid/expired tokens

---

## Sign-In Page

### Two-Stage Form

**Stage 1 - Email**:
- Input email address
- Call sendMagicCode() on submit
- Transition to code stage on success

**Stage 2 - Code**:
- CodeInput component (6 individual boxes)
- Time left counter (300 seconds, red warning if < 60 sec)
- Attempts remaining counter (3 max, red warning if <= 1)
- Call verifyMagicCode() on submit
- **Hard redirect** with `window.location.href` after success

---

## CodeInput Component

- 6 individual digit input boxes
- Paste entire code support (auto-fills all boxes)
- Arrow key navigation (left/right)
- Backspace behavior (delete current or move left)
- Auto-submit callback when all 6 digits entered
- Numeric input only (inputMode="numeric")

---

## UserHeader Component

- Fetches user data from /api/auth/user
- Displays avatar, name, email
- Dropdown menu (Settings, Logout)
- Graceful fallback when not authenticated
- Shows loading state with faded avatar
- Listens for `user-profile-updated` event to refresh avatar

**Critical**: Must include `credentials: 'include'` in fetch call.

---

## Admin User Management

### Creating Users
- Email address (required, unique)
- Display name (optional)
- Profile image (optional, max 2MB)
- Admin status (checkbox)

**API**: `POST /api/admin/users` (admin only)

### Managing Admin Status
- Checkbox toggle: Checked = Admin, Unchecked = User
- **Self-demotion prevention**: Admins cannot remove their own admin status
- Only other admins can demote an admin

**API**: `PATCH /api/admin/users/[userId]` (admin only)

---

## Email Design

### Dark Theme Colors
- Background: #1a1a1a
- Card: #2a2a2a
- Text: #e0e0e0
- Accent: #4a90e2

### Layout
1. Logo from CDN (CloudFront)
2. "Your login code is:" subtitle
3. **Copyable code display** (large, monospace, easy to select)
4. Instruction text
5. **Visual digit boxes** (reference, not for copying)
6. Expiration time
7. Security tip box
8. Footer

### Rendering
- Table-based layout (email client compatibility)
- Inline styles (no CSS classes)
- Responsive max-width: 500px
- Works in all email clients

---

## Environment Variables

```bash
# Email (Resend)
RESEND_API_KEY=re_xxxxx
RESEND_FROM=login@email.yourdomain.com
RESEND_REPLY_TO=no-reply@yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Security (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
OTP_SECRET_KEY=<32-byte-hex>
JWT_SECRET=<32-byte-hex>

# CDN (CloudFront)
CLOUDFRONT_DOMAIN_URL=https://cdn.yourdomain.com
```

---

## Security Checklist

✅ Codes hashed (never stored plain)  
✅ Attempt limiting (max 3)  
✅ Expiration (5 minutes)  
✅ JWT validation (every protected request)  
✅ httpOnly cookies (no JavaScript access)  
✅ Secure flag (HTTPS only in production)  
✅ SameSite=lax (CSRF protection)  
✅ User enumeration prevention (generic message)  
✅ Auto-cleanup (used codes deleted immediately)

---

## Sign-In Flow

```
1. User visits /auth/signin
2. Enters email → sendMagicCode()
3. Code generated, hashed, stored in DB
4. Email sent with code
5. User enters code → verifyMagicCode()
6. Code validated, JWT created, cookie set
7. Hard redirect to protected route
8. Middleware validates JWT
9. Page loads, UserHeader fetches user data
10. User sees profile in header
```

---

## Common Issues

**UserHeader shows avatar but no user data**  
→ Ensure `credentials: 'include'` in fetch call

**Code doesn't auto-submit**  
→ Check onComplete callback is passed to CodeInput

**User stays on signin after login**  
→ Use `window.location.href` not `router.push()` for hard redirect

**Cookie not persisting**  
→ Ensure `path: '/'` is set in cookie options

**Email not sending**  
→ Verify RESEND_API_KEY and RESEND_FROM are correct
