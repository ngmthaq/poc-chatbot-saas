# Phase 5 — API Security

**Mass Assignment (CWE-915):** Never pass `req.body` directly to a model constructor.
Explicitly allowlist fields: `User.create({ name: req.body.name, email: req.body.email })`.

**Input Validation:** Validate shape and types at every entry point with a schema library
(Zod, Joi, Pydantic). Unvalidated input reaching a sink is an automatic flag.

**Rate Limiting:** Apply `express-rate-limit` (or equivalent) to auth and sensitive endpoints.
Never pass secrets in query parameters — use `Authorization` headers.
