# Auth and Access

Authentication and authorization guidance for Neon Auth Stack.

**IMPORTANT: This guide assumes App Router is being used. App Router is mandatory for all projects (see workflow: `/load-api-guides` for architecture details).**

---

## Core Principles

- **Fail-fast auth**: Surface failures immediately; no silent fallbacks.
- **Clear error UX**: Actionable messages; never pretend success.
- **Simple RBAC**: Keep roles simple; avoid complex permission matrices unless necessary.
- **Strict environment separation**: Dev shortcuts never ship to production.

---

## Auth Patterns

### Route Protection
- Use middleware to protect routes at the edge (see `next-js-stack.md`)
- Validate session and role per operation
- Fail-fast on auth failures; never degrade gracefully

### Session Management
- Fetch session once in root layout; provide via context to all children
- Never refetch session in individual components
- Use server components for sensitive operations

### Error Handling
```typescript
// ✅ GOOD: Explicit error
if (!session) {
  throw new Error('Unauthorized: session required')
}

// ❌ BAD: Silent fallback
const data = session ? fetchUserData() : fetchGuestData()
```

### Consistent Response Format
- Success: `{ data, success: true, timestamp }`
- Error: `{ error, code, timestamp, retryable }`
- Validation errors: `{ errors: [{ field, message, code }] }`

---

## Environment Separation

- **Development**: Allow fast local auth flows behind env flags
- **Production**: Enforce secure session/token handling and expiry
- **Test**: Use deterministic tokens/fixtures; no external auth services

---

## Neon Auth Stack Specifics

### Server Actions for Auth
```typescript
'use server'
export async function loginAction(email: string, password: string) {
  try {
    const session = await auth.login({ email, password })
    if (!session) return { error: 'Invalid credentials' }
    redirect('/dashboard')
  } catch (err) {
    return { error: err.message }
  }
}
```

### Testing
Mock Neon Auth; use deterministic fixtures:
```typescript
jest.mock('@neon-auth/stack', () => ({
  auth: { login: jest.fn().mockResolvedValue({ user: { id: '123' } }) }
}))
```

---

## Logging and Metrics

Record auth failures for observability:
- Include operation, resource IDs, correlation IDs
- Use structured logging (not console.error)
- Distinguish between client/auth/business logic errors
