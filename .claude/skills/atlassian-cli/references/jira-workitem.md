# jira workitem Commands

## create

```bash
# Minimal
acli jira workitem create --summary "Fix login bug" --project "PROJ" --type "Bug"

# Full options
acli jira workitem create \
  --summary "New feature" \
  --project "PROJ" \
  --type "Story" \
  --description "Implement OAuth2 login" \
  --assignee "user@example.com" \
  --label "auth,security" \
  --parent "PROJ-10"

# From plain-text file
acli jira workitem create --from-file workitem.txt --project "PROJ" --type "Task"

# Generate JSON template, then create from it
acli jira workitem create --generate-json
acli jira workitem create --from-json workitem.json
```

**Flags:** `-s/--summary`, `-p/--project`, `-t/--type`, `-a/--assignee`, `-d/--description`,
`--description-file`, `-l/--label`, `--parent`, `-f/--from-file`, `--from-json`, `--generate-json`, `-e/--editor`, `--json`

## create-bulk

```bash
acli jira workitem create-bulk --from-json workitems.json
```

Generate a single-item template with `--generate-json`, then extend the JSON array for bulk use.

## search

```bash
# JQL search
acli jira workitem search --jql "project = PROJ AND status = 'In Progress'"

# Paginate all results
acli jira workitem search --jql "project = PROJ" --paginate

# Specific fields as CSV
acli jira workitem search --jql "assignee = currentUser()" \
  --fields "key,summary,status,assignee" --csv

# Count only
acli jira workitem search --jql "project = PROJ AND type = Bug" --count

# JSON output (for scripting)
acli jira workitem search --jql "project = PROJ" --limit 50 --json

# Use a saved filter
acli jira workitem search --filter 10001

# Open results in browser
acli jira workitem search --jql "project = PROJ" --web
```

**Flags:** `-j/--jql`, `--filter`, `-f/--fields`, `--limit`, `--paginate`, `--csv`, `--json`, `--count`, `-w/--web`

## view

```bash
acli jira workitem view PROJ-123
acli jira workitem view PROJ-123 --json
```

## edit

```bash
acli jira workitem edit PROJ-123 --summary "Updated title"
acli jira workitem edit PROJ-123 --assignee "user@example.com" --label "urgent"
acli jira workitem edit PROJ-123 --description "New description"
```

## transition

```bash
acli jira workitem transition PROJ-123 --status "In Progress"
acli jira workitem transition PROJ-123 --status "Done"
```

## assign

```bash
acli jira workitem assign PROJ-123 --assignee "user@example.com"
acli jira workitem assign PROJ-123 --assignee "@me"         # self-assign
acli jira workitem assign PROJ-123 --assignee "default"     # project default assignee
```

## clone

```bash
acli jira workitem clone PROJ-123
```

## link

```bash
acli jira workitem link PROJ-123 --issue PROJ-456 --link-type "blocks"
acli jira workitem link PROJ-123 --issue PROJ-789 --link-type "is blocked by"
```

## delete

```bash
acli jira workitem delete PROJ-123
```

## archive / unarchive

```bash
acli jira workitem archive PROJ-123
acli jira workitem unarchive PROJ-123
```

## comment-create / comment-list / comment-update / comment-delete

```bash
acli jira workitem comment-create PROJ-123 --body "LGTM, merging."
acli jira workitem comment-list PROJ-123
acli jira workitem comment-update PROJ-123 --comment-id 10001 --body "Updated comment."
acli jira workitem comment-delete PROJ-123 --comment-id 10001
```

## comment-visibility

Restrict comment visibility to a role or group.

```bash
acli jira workitem comment-visibility PROJ-123 --comment-id 10001 --role "Service Desk Team"
```

## attachment-list / attachment-delete

```bash
acli jira workitem attachment-list PROJ-123
acli jira workitem attachment-delete PROJ-123 --attachment-id 10001
```

## watcher-remove

```bash
acli jira workitem watcher-remove PROJ-123 --account-id <accountId>
```

## Scripting patterns

```bash
# Pipe JSON results to jq
acli jira workitem search \
  --jql "project = PROJ AND type = Bug AND status != Done" \
  --json | jq '.[] | {key, summary: .fields.summary}'

# Transition all items in a sprint to Done
for key in $(acli jira sprint list-workitems --sprint-id 101 --json | jq -r '.[].key'); do
  acli jira workitem transition "$key" --status "Done"
done

# Bulk-create flow
acli jira workitem create --generate-json   # edit workitem.json, then:
acli jira workitem create-bulk --from-json workitem.json
```

## Reference

- https://developer.atlassian.com/cloud/acli/reference/commands/jira-workitem/
