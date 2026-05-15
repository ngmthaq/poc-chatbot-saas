# Admin User Commands

## Synopsis

Manage Atlassian organization user accounts.

```bash
acli admin user <subcommand> --account-id <accountId>
```

## Subcommands

### activate

Re-enable a deactivated user account.

```bash
acli admin user activate --account-id <accountId>
```

### deactivate

Suspend a user account (user loses product access but data is retained).

```bash
acli admin user deactivate --account-id <accountId>
```

### delete

Permanently delete a user account.

```bash
acli admin user delete --account-id <accountId>
```

### cancel-delete

Cancel a pending account deletion.

```bash
acli admin user cancel-delete --account-id <accountId>
```

## Notes

- Requires `admin auth login` first.
- `--account-id` is the Atlassian account ID (not email). Find it via Atlassian Admin or Jira user profile.
- `delete` is irreversible — use `cancel-delete` only while deletion is still pending.

## Reference

- https://developer.atlassian.com/cloud/acli/reference/commands/admin-user/
