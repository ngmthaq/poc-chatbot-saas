# SOLID

## S — Single Responsibility Principle

Every class, module, or function has **one and only one reason to change**.

```javascript
// Bad — validates, saves, emails, and logs in one class
class UserService {
  createUser(data) {
    /* validates + saves to DB + sends email + logs audit */
  }
}

// Good — each class owns one concern
class UserValidator {
  validate(data) {
    ...
  }
}
class UserRepository {
  save(user) {
    ...
  }
}
class UserNotifier {
  sendWelcomeEmail(user) {
    ...
  }
}
class UserService {
  constructor(validator, repository, notifier) {
    ...
  }
  createUser(data) {
    /* orchestrates the above */
  }
}
```

## O — Open/Closed Principle

Open for extension, closed for modification. Add behavior without editing existing code.

```javascript
// Bad — must edit this function for every new discount type
function calculateDiscount(type) {
  if (type === "student") return 0.2;
  if (type === "senior") return 0.3;
}

// Good — new discount = new class, no existing code touched
interface DiscountStrategy {
  calculate(): number;
}
class StudentDiscount implements DiscountStrategy {
  calculate() {
    return 0.2;
  }
}
class SeniorDiscount implements DiscountStrategy {
  calculate() {
    return 0.3;
  }
}
```

## L — Liskov Substitution Principle

Subtypes must be substitutable for their base types without breaking correctness.

```javascript
// Bad — Penguin breaks the Bird contract
class Bird {
  fly() {
    ...
  }
}
class Penguin extends Bird {
  fly() {
    throw new Error("Cannot fly");
  }
}

// Good — redesign the hierarchy to match reality
class Bird {
  move() {
    ...
  }
}
class FlyingBird extends Bird {
  fly() {
    ...
  }
}
class Penguin extends Bird {
  swim() {
    ...
  }
}
```

## I — Interface Segregation Principle

Clients should not be forced to depend on interfaces they don't use.

```javascript
// Bad — Robot must implement eat() and sleep()
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

// Good — split into focused interfaces
interface Workable {
  work(): void;
}
interface Feedable {
  eat(): void;
}
interface Restable {
  sleep(): void;
}
// Robot implements only Workable
```

## D — Dependency Inversion Principle

High-level modules depend on abstractions, not concrete implementations.

```javascript
// Bad — tightly coupled to MySQL and SMTP
class OrderService {
  private db = new MySQLDatabase();
  private mailer = new SmtpMailer();
}

// Good — depends on abstractions, injected externally
class OrderService {
  constructor(
    private db: Database,
    private mailer: Mailer,
  ) {}
}
```

## SOLID Enforcement Rules

1. Before writing a class, identify its single responsibility and name it accordingly.
2. Before adding a conditional branch for a new variant, consider abstraction + extension.
3. Verify every subtype passes the substitutability test before merging.
4. Ask "will every implementor use every method?" — if not, split the interface.
5. High-level modules must reference abstractions, not concrete implementations.
6. Flag violations by principle name: "SRP violation: this class handles both X and Y."
