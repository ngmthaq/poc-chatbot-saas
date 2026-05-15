# Installation

## Step 1 — Node.js Prerequisites

Playwright CLI requires **Node.js 20 or newer**.

```bash
# Check current version
node --version

# If missing or outdated, install via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20

# Or download directly from https://nodejs.org/
```

Verify: `node --version` should print `v20.x.x` or higher.

---

## Step 2 — Install Playwright CLI Globally

```bash
npm install -g @playwright/cli@latest

# Verify installation
playwright-cli --help
```

**Alternative (no global install):**

```bash
npx playwright-cli --help
```

Use `npx playwright-cli <command>` anywhere in place of `playwright-cli <command>` if you prefer not to install globally.

---

## Step 3 — Install Browsers

The CLI auto-downloads Chromium on first use. To install explicitly:

```bash
# Install default browser (Chromium)
playwright-cli install-browser

# Install a specific browser
playwright-cli install-browser firefox
playwright-cli install-browser webkit

# Install with system dependencies (recommended on Linux/CI)
playwright-cli install-browser --with-deps
```

**Browser options:** `chromium` (default), `firefox`, `webkit`, `chrome`, `edge`
