# jira board & sprint Commands

## jira board

### search

Find boards by project or name.

```bash
acli jira board search --project "PROJ"
acli jira board search --query "team board"
acli jira board search --json
```

### list-sprints

List all sprints for a given board.

```bash
acli jira board list-sprints --board-id 42
acli jira board list-sprints --board-id 42 --json
```

## jira sprint

### list-workitems

List all work items in a sprint.

```bash
acli jira sprint list-workitems --sprint-id 101
acli jira sprint list-workitems --sprint-id 101 --json
acli jira sprint list-workitems --sprint-id 101 --fields "key,summary,assignee,status"
```

## Workflow example: iterate over all sprint items

```bash
# Get sprint ID from board
acli jira board list-sprints --board-id 42 --json | jq '.[] | select(.state=="active") | .id'

# List items in that sprint
acli jira sprint list-workitems --sprint-id 101 --json

# Transition all sprint items to Done
for key in $(acli jira sprint list-workitems --sprint-id 101 --json | jq -r '.[].key'); do
  acli jira workitem transition "$key" --status "Done"
done
```

## Reference

- https://developer.atlassian.com/cloud/acli/reference/commands/jira-board/
- https://developer.atlassian.com/cloud/acli/reference/commands/jira-sprint/
