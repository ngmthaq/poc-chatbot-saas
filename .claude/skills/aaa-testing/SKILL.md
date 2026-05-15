---
name: aaa-testing
description: "AAA (Arrange-Act-Assert) — Enforces the Arrange-Act-Assert pattern for writing clear, structured, and maintainable tests. Use when writing, reviewing, or refactoring any unit or integration tests that are hard to read, mix setup with assertions, have unclear intent, or lack a consistent structure. Applies to any language and any testing framework (Jest, PyTest, JUnit, RSpec, Go testing, etc.)."
---

# AAA — Arrange, Act, Assert

## The Pattern

Every test has exactly three phases:

| Phase       | Question                              | What belongs here                                  |
| ----------- | ------------------------------------- | -------------------------------------------------- |
| **Arrange** | What is the world before this action? | Object creation, mocks, test data                  |
| **Act**     | What is being tested?                 | The single method call or event under test         |
| **Assert**  | Did it do the right thing?            | Expectations on return values, state, side effects |

```javascript
it("applies 10% discount when order exceeds $100", () => {
  // Arrange
  const cart = new Cart();
  cart.add({ name: "Widget", price: 60 });
  cart.add({ name: "Gadget", price: 50 });

  // Act
  const total = cart.calculateTotal();

  // Assert
  expect(total).toBe(99); // 110 - 10% discount
});
```

## Common Violations

**1. No phase separation — multiple acts/asserts collapsed into one test.**
Split into one test per behavior. When a test fails, you must know exactly what broke.

**2. Assertions in Arrange.** Trust your fixtures. If you need to verify fixture state, write a separate test for it.

**3. Act buried in Arrange.** The thing being tested must be on its own line in the Act phase.

```python
# Bad — register() is the Act, hidden in Arrange
user = UserService(mailer=mailer).register(payload)

# Good
service = UserService(mailer=mailer)   # Arrange
service.register(payload)              # Act
```

**4. Asserting too much.** Assert only what the test is _about_. Unrelated assertions make tests fragile and failure messages misleading.

## Shared Arrange

Extract repeated setup into `beforeEach`/fixtures, but keep Act and Assert in each test:

```javascript
describe("Cart", () => {
  let cart;
  beforeEach(() => {
    cart = new Cart();
    cart.add({ name: "Widget", price: 10 });
  });

  it("calculates correct total", () => {
    const total = cart.calculateTotal(); // Act
    expect(total).toBe(10); // Assert
  });

  it("applies coupon discount", () => {
    cart.applyCoupon("SAVE10"); // Act
    expect(cart.calculateTotal()).toBe(9); // Assert
  });
});
```

## Test Naming

Name tests after behavior: **`[unit]_[scenario]_[expected outcome]`** or plain prose.

| Bad          | Good                                            |
| ------------ | ----------------------------------------------- |
| `test_login` | `returns auth token when credentials are valid` |
| `test_error` | `throws ValidationError when email is missing`  |

## Enforcement Rules

1. **All three phases must be present** — no Act = not testing anything; no Assert = test can never fail.
2. **One Act per test** — two method calls under test means two tests.
3. **No assertions in Arrange** — verify fixture correctness in a separate test.
4. **Assert only what the test is about** — omit unrelated field checks.
5. **Name tests after behavior**, not implementation.
6. **Shared setup in `beforeEach`/fixtures** — never repeat Arrange, but keep Act+Assert per test.
7. **In code review**, flag as: "AAA violation: [phase] is [missing/mixed/bloated]."
