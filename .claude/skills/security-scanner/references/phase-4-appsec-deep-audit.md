# Phase 4 — AppSec Deep Audit

Tools catch syntax; this phase catches logic. Trace data flows from untrusted sources
to dangerous sinks: `[input] → [processing] → [sink]`.

---

## 4.1 SQL Injection (CWE-89)

```js
// ❌ String concat / template literals reach the query — both are unsafe
const q = "SELECT * FROM users WHERE email = '" + req.body.email + "'";
const q = `SELECT * FROM users WHERE id = ${req.params.id}`;

// ✅ Parameterized query — input is data, never SQL
db.execute("SELECT * FROM users WHERE email = ?", [req.body.email]);
User.findOne({ where: { email: req.body.email } }); // ORM bound params
```

Look for `.query()`, `.execute()`, `.raw()` with any `+` or `${}` near user input.

---

## 4.2 Cross-Site Scripting — XSS (CWE-79)

```jsx
// ❌ Raw HTML injection — attacker injects <script> or event handlers
<div dangerouslySetInnerHTML={{ __html: userComment }} />
document.getElementById("out").innerHTML = userInput;

// ✅ Text content only (React escapes by default); sanitize if HTML is required
<div>{userComment}</div>
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />
```

Also flag server-side template unescaped output: `{{{ var }}}` (Handlebars), `| safe` (Jinja2).

---

## 4.3 CSRF (CWE-352)

```js
// ❌ State-changing endpoint with cookie auth, no origin check
app.post('/transfer', handler);

// ✅ Synchronizer token or SameSite cookie
app.use(csrf());
// Set-Cookie: session=x; SameSite=Strict; Secure; HttpOnly
```

APIs using only `Authorization: Bearer` headers are not CSRF-vulnerable — custom headers
cannot be sent cross-origin by default.

---

## 4.4 Command Injection (CWE-78)

```python
# ❌ User input reaches the shell — attacker appends "; rm -rf /"
os.system(f"convert {filename} output.png")
subprocess.call("convert " + filename, shell=True)

# ✅ Argument list form — no shell interpretation; allowlist input first
if not re.match(r'^[\w\-]+\.pdf$', filename):
    raise ValueError("Invalid filename")
subprocess.run(["convert", filename, "output.png"])
```

Also flag `exec()` / `child_process.exec()` (Node.js) and `Runtime.exec()` (Java) with
concatenated strings.

---

## 4.5 SSRF (CWE-918)

```js
// ❌ Attacker passes http://169.254.169.254/latest/meta-data/
const data = await fetch(req.query.webhook);

// ✅ Hostname allowlist — parse and verify before fetching
const parsed = new URL(req.query.webhook);
if (!ALLOWED_DOMAINS.includes(parsed.hostname))
  throw new Error("Disallowed domain");
const data = await fetch(req.query.webhook);
```

High-risk surfaces: webhook registration, URL preview, PDF/screenshot generators.

---

## 4.6 Broken Authorization / IDOR (CWE-284)

```js
// ❌ Authenticated but not authorized — any user can fetch any invoice
app.get('/invoice/:id', authenticate, async (req, res) => {
  res.json(await Invoice.findById(req.params.id));
});

// ✅ Scope the query to the requesting user's ownership
res.json(await Invoice.findOne({ _id: req.params.id, ownerId: req.user.id }));
```

Check every DB lookup by a user-supplied ID for a secondary ownership filter. Check
admin routes for role enforcement middleware.

---

## 4.7 Sensitive Data Exposure (CWE-798 / CWE-312)

```python
# ❌ Secret committed to source
STRIPE_SECRET_KEY = "sk_live_abc123"

# ✅ Environment variable only
STRIPE_SECRET_KEY = os.environ["STRIPE_SECRET_KEY"]
```

Also verify: stack traces not returned in production responses, passwords excluded from
API responses, PII not written to logs, `.env` files in `.gitignore`.
