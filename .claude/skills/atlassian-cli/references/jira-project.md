# jira project Commands

## list

```bash
acli jira project list
acli jira project list --json
```

## view

```bash
acli jira project view PROJ
acli jira project view PROJ --json
```

## create

```bash
# Clone from an existing project (company-managed only)
acli jira project create --from-project "TEMPLATE" --key "NEWP" --name "New Project"

# Full options
acli jira project create \
  --from-project "TEMPLATE" \
  --key "NEWP" \
  --name "New Project" \
  --description "Our new project" \
  --url "https://example.com" \
  --lead-email "lead@example.com"

# Generate JSON template, then create from it
acli jira project create --generate-json
acli jira project create --from-json project.json
```

**Flags:** `-f/--from-project`, `-k/--key`, `-n/--name`, `-d/--description`, `-u/--url`,
`-l/--lead-email`, `-j/--from-json`, `-g/--generate-json`

## update

```bash
acli jira project update PROJ --name "Renamed Project"
acli jira project update PROJ --description "Updated description" --url "https://new-url.com"
```

## archive / restore / delete

```bash
acli jira project archive PROJ
acli jira project restore PROJ
acli jira project delete PROJ
```

## Notes

- Only **company-managed** projects can be used as `--from-project` templates.
- `--key` must be uppercase letters only (e.g. `NEWP`, `TEAM2`).
- `delete` is permanent. Use `archive` / `restore` for reversible decommission.

## Reference

- https://developer.atlassian.com/cloud/acli/reference/commands/jira-project/
