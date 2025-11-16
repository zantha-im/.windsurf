# Custom Magic Code Authentication - Complete Implementation Guide

**Status**: Production-ready reference implementation  
**Last Updated**: November 16, 2025  
**Framework**: Next.js 16 (App Router), React 19, TypeScript, Neon PostgreSQL, Resend Email

---

## Executive Summary

This guide documents a complete, end-to-end custom magic code (OTP) authentication system that was chosen after evaluating Neon Auth, Stack Auth, and NextAuth.js. Custom implementation proved simplest (~500 lines), most flexible, and production-ready.

### Why Custom Auth Wins

✅ Simplicity: ~500 lines of code  
✅ Full control over UX and email design  
✅ No external auth service dependencies  
✅ No per-user licensing fees  
✅ Easy feature additions (2FA, social login, etc.)

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

**Key Design**: Codes are hashed with HMAC-SHA256, never stored plain. Max 3 attempts, 5-minute expiration, auto-cleanup.

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
OTP_SECRET_KEY=a7f3c9e2b1d4f6a8c5e9b2d7f1a4c8e3b6d9f2c5a8e1b4d7f0a3c6e9b2d5f8
JWT_SECRET=f8d5b2e9c6a3f0d7b4e1a8c5f2d9e6b3a0c7e4b1f8d5a2c9e6b3f0d7a4e1c8

# CDN (CloudFront)
CLOUDFRONT_DOMAIN_URL=https://cdn.yourdomain.com
```

---

## Core Server Actions

### sendMagicCode() - `app/actions/sendMagicCode.ts`

1. Check user exists (prevent enumeration)
2. Generate 6-digit code
3. Hash with HMAC-SHA256
4. Store in DB with 5-min expiration
5. Send email with dark-themed HTML
6. Return success/error

**Key Points**:
- Returns generic message if user not found (security)
- Overwrites previous code if new request made
- Email includes copyable code + visual boxes

### verifyMagicCode() - `app/actions/verifyMagicCode.ts`

1. Retrieve hashed code from DB
2. Validate expiration
3. Validate attempt limit (max 3)
4. Hash submitted code, compare with stored
5. Increment attempts on failure
6. Create JWT token (1-week expiration)
7. Set httpOnly cookie with path=/
8. Delete used code
9. Return success with userId

**Key Points**:
- All validations fail-fast
- JWT uses HS256 algorithm
- Cookie is httpOnly, secure in production, sameSite=lax
- Hard redirect required after login (see Sign-In Page)

---

## API Routes

### GET /api/auth/user - `app/api/auth/user/route.ts`

- Extracts JWT from auth_session cookie
- Verifies JWT with JWT_SECRET
- Returns user data (id, name, email, image, is_admin)
- Returns 401 if no cookie or invalid token

**Important**: Client must include `credentials: 'include'` in fetch.

### POST /api/auth/logout - `app/api/auth/logout/route.ts`

- Clears auth_session cookie (maxAge: 0)
- Returns success response
- Client redirects to /auth/signin

---

## Route Protection - proxy.ts

Middleware validates JWT on protected routes:
- /purchase-order-generator
- /velocity-analyzer
- /warehouse
- /data-admin
- /settings

Redirects unauthenticated users to /auth/signin with redirect param.

---

## Sign-In Page - `app/auth/signin/page.tsx`

### Two-Stage Form

**Stage 1 - Email**:
- Input email address
- Call sendMagicCode() on submit
- Transition to code stage on success

**Stage 2 - Code**:
- CodeInput component (6 individual boxes)
- Time left counter (300 seconds)
- Attempts remaining counter (3 max)
- Call verifyMagicCode() on submit
- **Hard redirect** with `window.location.href` after success

**Critical**: Use `window.location.href` not `router.push()` to ensure full page reload and cookie pickup.

### Stats Display

Inside card, positioned left/right:
- Time left (red warning if < 60 sec)
- Attempts remaining (red warning if <= 1)

---

## CodeInput Component - `components/CodeInput.tsx`

### Features

- 6 individual digit input boxes
- Paste entire code support (auto-fills all boxes)
- Arrow key navigation (left/right)
- Backspace behavior (delete current or move left)
- Auto-submit callback when all 6 digits entered
- Numeric input only (inputMode="numeric")

### Usage

```typescript
<CodeInput
  value={code}
  onChange={setCode}
  onComplete={() => form.dispatchEvent(new Event('submit'))}
  disabled={loading}
/>
```

---

## UserHeader Component - `components/UserHeader.tsx`

### Features

- Fetches user data from /api/auth/user
- Displays avatar, name, email
- Dropdown menu (Settings, Logout)
- Graceful fallback when not authenticated
- Shows loading state with faded avatar

### Critical Implementation

```typescript
const res = await fetch('/api/auth/user', {
  credentials: 'include'  // MUST include cookies
})
```

Without `credentials: 'include'`, cookies won't be sent and auth fails.

---

## Email Design

### Dark Theme Colors

- Background: #1a1a1a
- Card: #2a2a2a
- Text: #e0e0e0
- Accent: #4a90e2 (app blue)

### Layout

1. Zantha logo from CDN (CloudFront)
2. "Stock Insights" title
3. "Your login code is:" subtitle
4. **Copyable code display** (large, monospace, easy to select)
5. Instruction text: "Enter this code on the Stock Insights login page..."
6. **Visual digit boxes** (reference, not for copying)
7. Expiration time
8. Security tip box
9. Footer with copyright

### Email Rendering

- Table-based layout (email client compatibility)
- Inline styles (no CSS classes)
- Responsive max-width: 500px
- Works in all email clients (Gmail, Outlook, Apple Mail, etc.)

---

## Styling - `app/auth/auth.module.css`

### Key Classes

- `.container`: Flex center, full viewport height
- `.card`: White/dark card, shadow, rounded corners
- `.logoContainer`: Centered logo
- `.subtitle`: Only shows on email stage
- `.cardStats`: Flex row, positioned inside card, blue background
- `.stat`: Flex column, centered, label + value
- `.timerWarning`, `.attemptsWarning`: Red color when critical
- `.input`: Full width, padding, border, dark theme
- `.button`: Blue background (#4a90e2), full width, padding
- `.error`, `.success`: Red/green messages
- `.hint`: Muted text below input

---

## Complete Sign-In Flow

```
1. User visits /auth/signin
   ↓
2. Enters email → sendMagicCode()
   ↓
3. Code generated, hashed, stored in DB
   ↓
4. Email sent with code
   ↓
5. User enters code → verifyMagicCode()
   ↓
6. Code validated, JWT created, cookie set
   ↓
7. Hard redirect to /purchase-order-generator
   ↓
8. Middleware validates JWT
   ↓
9. Page loads, UserHeader fetches user data
   ↓
10. User sees profile in header
```

---

## Security Considerations

✅ **Codes hashed**: Never stored plain  
✅ **Attempt limiting**: Max 3 attempts  
✅ **Expiration**: 5 minutes  
✅ **JWT validation**: Verified on every protected request  
✅ **httpOnly cookies**: Can't be accessed by JavaScript  
✅ **Secure flag**: Only sent over HTTPS in production  
✅ **SameSite=lax**: CSRF protection  
✅ **User enumeration prevention**: Generic message if email not found  
✅ **Auto-cleanup**: Used codes deleted immediately  

---

## Testing Checklist

- [ ] User can request code
- [ ] Email arrives with correct code
- [ ] Code expires after 5 minutes
- [ ] Max 3 attempts enforced
- [ ] Correct code logs user in
- [ ] UserHeader displays after login
- [ ] Logout clears session
- [ ] Protected routes redirect to signin
- [ ] Hard redirect works (cookie picked up)
- [ ] Code paste support works
- [ ] Auto-submit on 6 digits works
- [ ] Time left counter updates
- [ ] Attempts counter updates
- [ ] Dark theme renders correctly in email

---

## User Administration

### Creating Users

Admins can create new users through the Users tab in Settings with:
- Email address (required, must be unique)
- Display name (optional)
- Profile image (optional, max 2MB)
- Admin status (checkbox to make user admin on creation)

**API Endpoint**: `POST /api/admin/users`
- Requires admin authentication
- Auto-generates UUID for user ID
- Returns created user object

### Managing Admin Status

- **Checkbox toggle**: Checked = Admin, Unchecked = User
- **Self-demotion prevention**: Admins cannot remove their own admin status
- Only other admins can demote an admin
- Disabled checkbox (50% opacity) for current user
- Tooltip explains action on hover

**API Endpoint**: `PATCH /api/admin/users/[userId]`
- Requires admin authentication
- Validates current user cannot self-demote
- Returns updated user object

### Access Control

- **Users tab visibility**: Only shown to admin users
- **API protection**: All admin endpoints verify JWT and admin role
- **Non-admins**: Cannot access `/api/admin/users` endpoints (403 Forbidden)

## User Header Component

### Features

- **Profile display**: Shows user avatar, name, and email
- **Dropdown menu**: Settings and Logout options
- **Click-outside dismiss**: Dropdown closes when clicking anywhere else
- **Real-time updates**: Avatar refreshes when profile is updated
- **Graceful fallback**: Shows user icon when not authenticated or loading

### Profile Image Updates

When user updates their profile image in My Account:
1. MyAccount saves changes and dispatches `user-profile-updated` event
2. UserHeader listens for event and refreshes user data
3. Avatar updates immediately in header
4. No page reload needed

**Implementation**: Uses custom window events for cross-component communication

### Authentication States

- **Loading**: Shows faded avatar icon
- **Unauthenticated**: Shows user icon (no dropdown)
- **Authenticated**: Shows avatar with dropdown menu

## Files Summary

| File | Purpose |
|------|---------|
| `app/actions/sendMagicCode.ts` | Generate, hash, store code; send email |
| `app/actions/verifyMagicCode.ts` | Validate code, create JWT, set cookie |
| `app/api/auth/user/route.ts` | Get current user from JWT |
| `app/api/auth/logout/route.ts` | Clear session cookie |
| `app/api/admin/users/route.ts` | List users, create new users (admin only) |
| `app/api/admin/users/[userId]/route.ts` | Update user admin status (admin only) |
| `proxy.ts` | Middleware for route protection |
| `app/auth/signin/page.tsx` | Two-stage sign-in form |
| `components/CodeInput.tsx` | 6-digit input component |
| `components/UserHeader.tsx` | User profile display with dropdown |
| `components/UsersManagement.tsx` | Admin user management interface |
| `app/(main)/settings/page.tsx` | Settings page with conditional Users tab |
| `app/auth/auth.module.css` | Sign-in page styling |
| `components/UserHeader.module.css` | Header styling |
| `migrations/001_fix_users_id_column.sql` | Database migration for UUID column |

---

## Deployment Notes

1. **Environment variables**: Set all required vars in production
2. **Database**: Ensure PostgreSQL is accessible
3. **Email**: Resend API key must be valid
4. **HTTPS**: Required for secure cookies in production
5. **CDN**: CloudFront domain must be configured
6. **Middleware**: Ensure proxy.ts is deployed

---

## Future Enhancements

- 2FA with authenticator apps
- Social login (Google, GitHub)
- Magic link alternative (email link instead of code)
- Rate limiting on code requests
- Session management dashboard
- Login history/audit log
- Email verification for new users
- Password reset flow (optional alternative to magic code)

---

## Troubleshooting

**Issue**: UserHeader shows avatar but no user data  
**Solution**: Ensure `credentials: 'include'` in fetch call

**Issue**: Code doesn't auto-submit  
**Solution**: Check onComplete callback is passed to CodeInput

**Issue**: User stays on signin after login  
**Solution**: Use `window.location.href` not `router.push()` for hard redirect

**Issue**: Cookie not persisting  
**Solution**: Ensure `path: '/'` is set in cookie options

**Issue**: Email not sending  
**Solution**: Verify RESEND_API_KEY and RESEND_FROM are correct

---

## References

- JOSE library: https://github.com/panva/jose
- Resend: https://resend.com
- Neon PostgreSQL: https://neon.tech
- Next.js App Router: https://nextjs.org/docs/app
