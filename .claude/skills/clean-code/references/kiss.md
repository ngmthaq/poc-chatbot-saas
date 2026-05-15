# KISS — Keep It Simple, Stupid

Solutions should be **as simple as possible** to fulfill their requirements — no simpler, no more complex.

```javascript
// Bad — factory for something that only needs a function
class DataFetcherFactory {
  static create(type, config, middleware = [], plugins = []) {
    ...
  }
}

// Good
async function fetchData(url) {
  const res = await fetch(url);
  return res.json();
}
```

```python
# Bad — clever one-liner that requires study to understand
result = [x for x in data if x % 2 == 0 and x > 0 and x < 100 and x not in seen and not seen.add(x)]

# Good — readable loop
result = []
for x in data:
    if x % 2 == 0 and 0 < x < 100 and x not in seen:
        seen.add(x)
        result.append(x)
```

```javascript
// Bad — deep nesting
function processOrder(order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.status !== "cancelled") {
          /* logic */
        }
      }
    }
  }
}

// Good — guard clauses
function processOrder(order) {
  if (!order?.items?.length) return;
  if (order.status === "cancelled") return;
  // logic
}
```

## KISS Enforcement Rules

1. Before adding an abstraction, ask: "What problem does this solve today?" If none, skip it.
2. When nesting more than 2 levels deep, use guard clauses or early returns.
3. Prefer language builtins over custom implementations.
4. Ask: "Would a competent developer unfamiliar with this codebase understand this in 30 seconds?" If no, simplify.
5. Flag complexity with: "KISS violation: can this be simplified to `[simpler form]`?"
