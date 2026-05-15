---
name: playwright-cli
description: Use this skill whenever the user wants to set up, install, or use Playwright CLI (@playwright/cli) for browser automation with AI coding agents.
---

# Playwright CLI

A guide for setting up and using `@playwright/cli` — a command-line interface for browser automation designed for AI coding agents.

## Overview

Playwright CLI is token-efficient: it outputs concise accessibility snapshots after every command instead of loading large tool schemas. Agents interact using element refs from those snapshots.

**Key architecture:**

- Daemon process — persistent browser, no startup cost per command
- Ref-based — each command returns an accessibility tree with element refs
- Skill-based — agents discover capabilities through installable skills
- Cross-browser — Chromium (default), Firefox, WebKit, Edge

---

## Installation

Before running Playwright CLI, you need to check/install it and its dependencies. Follow the steps to get set up - [installation](./references/installation.md)

---

## CLI

Check the CLI reference for specific commands and use cases: [cli](./references/cli.md)

> Check `playwright-cli --help` or `npx playwright-cli --help` for more available commands.\

---

## Specific Tasks

- **Running and Debugging Playwright tests** [playwright-tests](./references/playwright-tests.md)
- **Request mocking** [request-mocking](./references/request-mocking.md)
- **Running Playwright code** [running-code](./references/running-code.md)
- **Browser session management** [session-management](./references/session-management.md)
- **Spec-driven testing (plan / generate / heal)** [spec-driven-testing](./references/spec-driven-testing.md)
- **Storage state (cookies, localStorage)** [storage-state](./references/storage-state.md)
- **Test generation** [test-generation](./references/test-generation.md)
- **Tracing** [tracing](./references/tracing.md)
- **Video recording** [video-recording](./references/video-recording.md)
- **Inspecting element attributes** [element-attributes](./references/element-attributes.md)
- **Debugging with devtools** [devtools-debugging](./references/debugging-with-devtools.md)
- **Form Submission** [form-submission](./references/form-submission.md)
- **Interactive Sessions** [interactive-session](./references/interactive-session.md)
- **Multiple Tabs** [multi-tab](./references/multi-tab.md)

---

## Reference Links

- [Playwright CLI Introduction](https://playwright.dev/agent-cli/introduction)
