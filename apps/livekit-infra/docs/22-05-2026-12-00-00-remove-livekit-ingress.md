# Plan Response — Remove LiveKit Ingress Service & Related Config Cleanup

- From: planner
- To: Root Agent
- Title: Plan Response — Remove LiveKit Ingress from All Docker Compose and Config Files
- Description: Surgically remove the `ingress` service from both compose files, delete orphaned ingress config files, and clean up all references in nginx.conf, livekit.yaml, init_script.sh, .env.example, .env, and README.md.

---

## Approach Summary

Remove the `livekit/ingress` service entirely from both `docker-compose.yml` and `docker-compose.development.yml`, then cascade the cleanup to every file that referenced the ingress service or its domains/ports. The orphaned `ingress.yaml` and `ingress.development.yaml` are deleted via `git rm`. No application source code is touched since the app has zero RTMP/WHIP/IngressClient usage.

## Functional Requirements

- The `ingress` service block is removed from both compose files
- Nginx no longer references the WHIP upstream or livekit-whip server block
- `livekit.yaml` no longer has an `ingress:` config section
- `LIVEKIT_WHIP_DOMAIN` is removed from all env files and scripts
- `ingress.yaml` and `ingress.development.yaml` are deleted (tracked by git)
- `README.md` is updated to remove all Ingress references from tables and setup steps
- A grep check confirms no stray ingress/RTMP/WHIP references remain in infra files

## Non-Functional Requirements

- No sensitive values are read from `.env`; only the `LIVEKIT_WHIP_DOMAIN` key line is removed
- All edits are surgical — no unrelated cleanup
- Changes are tracked in git history

## Files in Scope

**Modify:**
- `apps/livekit-infra/docker-compose.yml`
- `apps/livekit-infra/docker-compose.development.yml`
- `apps/livekit-infra/nginx/nginx.conf`
- `apps/livekit-infra/livekit.yaml`
- `apps/livekit-infra/init_script.sh`
- `apps/livekit-infra/.env.example`
- `apps/livekit-infra/.env`
- `apps/livekit-infra/README.md`

**Delete:**
- `apps/livekit-infra/ingress.yaml`
- `apps/livekit-infra/ingress.development.yaml`

## Risks & Assumptions

- `.env` is gitignored; developer edits only the `LIVEKIT_WHIP_DOMAIN` key line without reading sensitive values
- All ingress references confirmed absent from app source code
- No tests required — pure infrastructure/config change

## Open Questions / Blockers

None.

## Status

- [x] Ready to execute

## Task List

| #  | Status | Task                                                                                                              | Responsible Role | Dependencies | Skills       |
|----|--------|-------------------------------------------------------------------------------------------------------------------|------------------|--------------|--------------|
| 1  | DONE   | `docker-compose.yml`: Remove ingress service block, remove `- ingress` from nginx depends_on, remove LIVEKIT_WHIP_DOMAIN env var from livekit service, update header comment | developer | none | `clean-code` |
| 2  | DONE   | `docker-compose.development.yml`: Remove ingress service block, update header and redis-livekit comments          | developer        | none         | `clean-code` |
| 3  | DONE   | `nginx/nginx.conf`: Remove WHIP header comment, livekit_whip_backend upstream block, and livekit-whip map entry   | developer        | none         | `clean-code` |
| 4  | DONE   | `livekit.yaml`: Remove entire `ingress:` section                                                                  | developer        | none         | `clean-code` |
| 5  | DONE   | `init_script.sh`: Remove LIVEKIT_WHIP_DOMAIN variable, remove from certbot args, update domain count log message  | developer        | none         | `clean-code` |
| 6  | DONE   | `.env.example`: Remove LIVEKIT_WHIP_DOMAIN variable and its comment                                              | developer        | none         | `clean-code` |
| 7  | DONE   | `.env`: Remove LIVEKIT_WHIP_DOMAIN variable and its comment                                                       | developer        | none         | `clean-code` |
| 8  | DONE   | `README.md`: Remove ingress from DNS table, firewall ports, service inventory, setup steps, dev port reference     | developer        | none         | `clean-code` |
| 9  | DONE   | Delete `ingress.yaml` and `ingress.development.yaml` via `git rm`                                                 | developer        | none         | `clean-code` |
