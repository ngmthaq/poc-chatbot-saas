# Code Review Checklist

Apply this checklist to any pull request regardless of language or paradigm.

## SOLID _(OOP)_

- [ ] SRP: Does each class/module have exactly one reason to change?
- [ ] OCP: Are new variants added by extension, not by editing existing conditionals?
- [ ] LSP: Do all subtypes honor the base class contract?
- [ ] ISP: Are interfaces focused — no methods that implementors won't use?
- [ ] DIP: Do high-level modules depend on abstractions, not concrete classes?

## DRY _(All)_

- [ ] No duplicated logic, magic numbers, or copy-pasted blocks
- [ ] Shared types/schemas defined in one place
- [ ] Test setup uses factory functions, not repeated literals

## KISS _(All)_

- [ ] No abstraction added for hypothetical future needs
- [ ] Nesting depth ≤ 2 levels (use guard clauses otherwise)
- [ ] No clever one-liners that require study to decode

## Separation of Concerns _(All)_

- [ ] Business logic is free of UI, DB, and HTTP dependencies
- [ ] Controllers/handlers are thin
- [ ] Auth, logging, validation handled by middleware — not inline

## Atomic Design _(UI only)_

- [ ] No data fetching below the Page level
- [ ] No business logic inside components
- [ ] No hierarchy inversions (molecule importing organism, etc.)
