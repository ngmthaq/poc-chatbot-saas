# Phase 1 — Project Discovery

Build a complete picture of the attack surface before scanning.

Collect: languages and runtimes, dependency manifests (`package.json`, `requirements.txt`,
`go.mod`, `*.csproj`, `Gemfile`), lockfiles, framework signals, HTTP/CLI/queue entry points,
and trust boundaries — where does untrusted data enter?

**Output:** A one-paragraph threat model summary before proceeding. Example:

> "Node.js/Express API. Untrusted input enters via `req.body` and `req.query`. Three sinks:
> a PostgreSQL query builder, an `exec()` call in the export service, and an OpenAI prompt
> in the summarization endpoint. Auth is JWT with no role enforcement on admin routes."
