# Auth Commands

## jira auth

```bash
acli jira auth login
acli jira auth logout
acli jira auth status
acli jira auth switch       # switch between orgs/sites
```

## admin auth

```bash
acli admin auth login
acli admin auth logout
acli admin auth status
acli admin auth switch
```

## rovodev auth

```bash
acli rovodev auth login
acli rovodev auth logout
acli rovodev auth status
```

## Notes

- Always run `login` before using any `jira`, `admin`, or `rovodev` commands.
- Use `switch` to change the active org/site without re-authenticating.
- Use `status` to confirm which account and site is currently active.

## Reference

- https://developer.atlassian.com/cloud/acli/reference/commands/jira-auth/
- https://developer.atlassian.com/cloud/acli/reference/commands/admin-auth/
- https://developer.atlassian.com/cloud/acli/reference/commands/rovodev-auth/
