# DRY — Don't Repeat Yourself

Every piece of knowledge has a **single, authoritative representation** in the system.

```javascript
// Bad — tax logic duplicated in three places
const tax = price * 0.08; // checkout
const tax = subtotal * 0.08; // order summary
const tax = amount * 0.08; // invoice

// Good — single source of truth
const TAX_RATE = 0.08;
function calculateTax(amount) {
  return amount * TAX_RATE;
}
```

```typescript
// Bad — same shape defined in three layers
type User = { id: string; email: string; role: string }; // API handler
type UserRecord = { id: string; email: string; role: string }; // DB layer
const mockUser = { id: "1", email: "a@b.com", role: "admin" }; // tests

// Good — import from one definition
// types/user.ts
export type User = { id: string; email: string; role: string };
```

## DRY Enforcement Rules

1. Before copy-pasting, stop — extract a function, constant, or module first.
2. Before hardcoding a value, check if it appears elsewhere — if so, name it as a constant.
3. "Rule of Three": abstract on the third repetition, not the first.
4. Do not DRY prematurely — coincidentally similar code representing different concepts should stay separate.
