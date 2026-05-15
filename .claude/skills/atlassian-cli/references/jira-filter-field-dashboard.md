# jira filter, field & dashboard Commands

## jira filter

### list

```bash
acli jira filter list
acli jira filter list --json
```

### search

```bash
acli jira filter search --query "my open bugs"
acli jira filter search --json
```

### add-favourite

Mark a filter as a favourite for the current user.

```bash
acli jira filter add-favourite --filter-id 10001
```

### change-owner

Transfer filter ownership to another user.

```bash
acli jira filter change-owner --filter-id 10001 --account-id <accountId>
```

---

## jira field

### create

```bash
acli jira field create --name "Story Points" --type "number"
acli jira field create --name "Release Date" --type "date"
```

### delete

```bash
acli jira field delete --field-id customfield_10001
```

### cancel-delete

Cancel a pending field deletion.

```bash
acli jira field cancel-delete --field-id customfield_10001
```

---

## jira dashboard

### search

```bash
acli jira dashboard search --query "team overview"
acli jira dashboard search --json
```

---

## Reference

- https://developer.atlassian.com/cloud/acli/reference/commands/jira-filter/
- https://developer.atlassian.com/cloud/acli/reference/commands/jira-field/
- https://developer.atlassian.com/cloud/acli/reference/commands/jira-dashboard/
