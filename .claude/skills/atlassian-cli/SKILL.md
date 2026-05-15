---
name: atlassian-cli
description: Expert guide for using the Atlassian CLI (acli) — a command-line tool for automating Jira Cloud,Atlassian Admin, and Rovo Dev tasks.
---

# acli Guide Agent

Use this skill whenever the user asks how to use acli, wants to construct an acli command, is scripting Jira automation from the terminal, or mentions any acli subcommand (jira workitem, jira project, jira sprint, jira board, jira filter, jira field, jira dashboard, admin user, admin auth, jira auth, rovodev). This skill is also triggered whenever a user or agent wants to interact with acli, admin, jira, rovodev, etc.

Full docs: https://developer.atlassian.com/cloud/acli/reference/commands/

---

## Installation

Before running Atlassian CLI, you need to check/install it and its dependencies. Follow the steps to get set up - [installation](./references/installation.md)

---

## Command Tree

- `admin`
  - `auth` `login` | `logout` | `status` | `switch` → [references/auth.md](./references/auth.md)
  - `user` `activate` | `cancel-delete` | `deactivate` | `delete` → [references/admin-user.md](./references/admin-user.md)
- `feedback` — use `--help`; no reference file needed
- `jira`
  - `auth` `login` | `logout` | `status` | `switch` → [references/auth.md](./references/auth.md)
  - `board` `list-sprints` | `search` → [references/jira-board-sprint.md](./references/jira-board-sprint.md)
  - `dashboard` `search` → [references/jira-filter-field-dashboard.md](./references/jira-filter-field-dashboard.md)
  - `field` `cancel-delete` | `create` | `delete` → [references/jira-filter-field-dashboard.md](./references/jira-filter-field-dashboard.md)
  - `filter` `add-favourite` | `change-owner` | `list` | `search` → [references/jira-filter-field-dashboard.md](./references/jira-filter-field-dashboard.md)
  - `project` `archive` | `create` | `delete` | `list` | `restore` | `update` | `view` → [references/jira-project.md](./references/jira-project.md)
  - `sprint` `list-workitems` → [references/jira-board-sprint.md](./references/jira-board-sprint.md)
  - `workitem` (20 subcommands) → [references/jira-workitem.md](./references/jira-workitem.md)
- `rovodev`
  - `auth` `login` | `logout` | `status` → [references/auth.md](./references/auth.md)

---

## Common output flags (all commands)

| Flag         | Effect                       |
| ------------ | ---------------------------- |
| `--json`     | Machine-readable JSON        |
| `--csv`      | CSV output (search commands) |
| `--web`      | Open result in browser       |
| `--paginate` | Auto-fetch all pages         |
| `--limit N`  | Cap results at N             |
| `-h, --help` | Per-command flag reference   |

---

## Troubleshooting

- **Not authenticated** → run `acli jira auth login` (or `admin` / `rovodev` variant); see `references/auth.md`
- **Wrong org/site** → run `acli jira auth switch`
- **Unknown flags** → run `acli <command> --help`; flags vary per subcommand
- **JQL errors** → test JQL in Jira's issue search UI first, then pass via `--jql`
- **Bulk JSON format** → always generate template with `--generate-json` before editing manually
