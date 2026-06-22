# Step 3 — Fetch Reviewer Comments

Retrieve **every reviewer comment** on the PR using the access method chosen in Step 1. You need inline review comments (anchored to a file + line), review summary bodies, and each thread's resolved state.

## Using MCP

Use the available MCP tool(s) to list the PR's review comments / discussion threads. For each comment capture:

- Comment / thread ID (needed to reply and resolve in Step 6)
- File path and line
- Author and body
- Thread state: **resolved** vs **unresolved**, and whether the comment is **outdated** (anchored to a line that no longer exists)

## Using the CLI

| Platform  | List inline review comments                                            | Review summary bodies / thread state                                             |
| --------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| GitHub    | `gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate`       | `gh pr view <number> --json reviews`; resolved state via GraphQL `reviewThreads` |
| GitLab    | `glab api projects/:id/merge_requests/<number>/discussions --paginate` | `resolved` / `resolvable` fields are on each discussion note                     |
| Bitbucket | `bb pr comments <number>` (flags vary by CLI)                          | per-CLI                                                                          |

**GitHub — thread IDs and resolved state (GraphQL):** REST comment IDs cannot resolve a thread; you need the thread node ID.

```bash
gh api graphql -f query='
  query($owner:String!,$repo:String!,$number:Int!){
    repository(owner:$owner,name:$repo){
      pullRequest(number:$number){
        reviewThreads(first:100){
          nodes{ id isResolved isOutdated
            comments(first:50){ nodes{ id databaseId path line body author{login} } } } } } } }' \
  -F owner=<owner> -F repo=<repo> -F number=<number>
```

Identify from the fetched comments:

- Which files and lines each comment targets
- The author of each comment (a comment from the PR author themselves is usually a note, not a request)
- Which threads are already **resolved** or **outdated** — these are candidates to skip in Step 4

> Record each comment's ID, file, line, author, body, and resolved/outdated state. Step 6 replies to and resolves threads by these IDs, so keep them through the workflow.
