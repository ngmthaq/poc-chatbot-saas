---
name: clean-code
description: "Clean Code — Unified reference for all clean code principles: SOLID, DRY, KISS, Separation of Concerns, and Atomic Design. Organized by development context: OOP, Functional, UI/Component, Backend/API, and Code Review. Use when writing, reviewing, or refactoring code in any language or paradigm."
---

# Clean Code

Use this skill when writing, reviewing, or refactoring code. The detailed patterns now live in the `references/` folder so the main skill stays short and the principle guides stay reusable.

## How to Use This Skill

1. Identify the task context below.
2. Load the linked references in the listed order.
3. Combine multiple references when the task crosses layers or paradigms.
4. For reviews, apply the relevant references first, then run the checklist.

---

## Five categories with explicit load order

| Context                      | Apply in order                                                          |
| ---------------------------- | ----------------------------------------------------------------------- |
| OOP Languages                | SOLID → Separation of Concerns → DRY                                    |
| Functional / General-Purpose | Separation of Concerns → DRY → KISS                                     |
| UI / Component Development   | Atomic Design → Separation of Concerns → DRY → KISS                     |
| Backend / API                | SOLID → Separation of Concerns → DRY → KISS                             |
| Code Review                  | SOLID + DRY + KISS + Separation of Concerns + Atomic Design + Checklist |

---

## Reference Index

- [SOLID](./references/solid.md)
- [DRY](./references/dry.md)
- [KISS](./references/kiss.md)
- [Atomic Design](./references/atomic-design.md)
- [Separation of Concerns](./references/separation-of-concerns.md)
- [Code Review Checklist](./references/code-review-checklist.md)

---

## Universal Rules

These apply unconditionally across all categories and principles:

1. **Name things after what they do.** If a name requires "and" or "or", it's doing too much.
2. **Test business logic in isolation.** No DB, no HTTP, no UI framework required.
3. **Flag violations by principle name** in reviews: "SRP violation", "DRY violation", "KISS violation", etc.
4. **Don't abstract prematurely.** Duplication must appear at least twice before extracting.
5. **Cross-cutting concerns** (auth, logging, validation) belong in middleware/decorators — never inline.
