#!/usr/bin/env bash
#
# bootstrap.sh — Generate the backend-service `.env` with strong random
# secrets and sensible defaults for every non-secret key. Refuses to
# overwrite an existing `.env` unless `--force` is passed; on `--force` it
# writes a timestamped backup first.
#
# Stdout is safe to log: the only value printed on success is a short
# non-sensitive marker (first 8 chars of DB_USER). Generated secrets are
# never echoed.

set -euo pipefail

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log() {
  # Single-line, prefixed, no secret values. Operators can grep `[bootstrap]`.
  printf '[bootstrap] %s\n' "$1"
}

die() {
  printf '[bootstrap] ERROR: %s\n' "$1" >&2
  exit 1
}

# Trim base64 output to URL-safe characters (drops `=` padding, `+`, `/` and
# any stray newline). Required for secrets embedded in URLs — particularly
# `DATABASE_URL`, where `+`/`/` would otherwise need percent-encoding.
sanitize() {
  printf '%s' "$1" | tr -d '=+/\n'
}

# ---------------------------------------------------------------------------
# Argument parsing — only `--force` is supported.
# ---------------------------------------------------------------------------

FORCE=0
case "${1:-}" in
  "")          ;;
  --force)     FORCE=1 ;;
  -h|--help)
    cat <<'USAGE'
Usage: bootstrap.sh [--force]

  (no args)   Generate `.env` if it does not exist. Exits non-zero if it does.
  --force     Rotate secrets. Existing `.env` is backed up to `.env.bak.<ts>`.
  -h|--help   Show this message.
USAGE
    exit 0
    ;;
  *)
    die "unknown argument '$1' — see --help"
    ;;
esac

# ---------------------------------------------------------------------------
# Preconditions
# ---------------------------------------------------------------------------

# Resolve this script's directory so the script works regardless of CWD.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${BACKEND_DIR}/.env"

if ! command -v openssl >/dev/null 2>&1; then
  die "openssl is required but was not found in PATH. Install it and retry."
fi

if [ -f "${ENV_FILE}" ] && [ "${FORCE}" -eq 0 ]; then
  die ".env already exists at ${ENV_FILE} — pass --force to rotate secrets."
fi

# ---------------------------------------------------------------------------
# Backup existing .env when rotating.
# ---------------------------------------------------------------------------

if [ -f "${ENV_FILE}" ] && [ "${FORCE}" -eq 1 ]; then
  TIMESTAMP="$(date +%Y%m%d%H%M%S)"
  BACKUP_FILE="${ENV_FILE}.bak.${TIMESTAMP}"
  cp "${ENV_FILE}" "${BACKUP_FILE}"
  chmod 600 "${BACKUP_FILE}"
  log "backed up previous .env to $(basename "${BACKUP_FILE}")"
fi

# ---------------------------------------------------------------------------
# Generate secrets.
# ---------------------------------------------------------------------------

log "generating JWT_SECRET"
JWT_SECRET="$(sanitize "$(openssl rand -base64 48)")"

log "generating JWT_REFRESH_SECRET"
JWT_REFRESH_SECRET="$(sanitize "$(openssl rand -base64 48)")"

# AES-256-GCM requires a 32-byte key. Joi enforces exactly 64 hex chars at
# boot, so `openssl rand -hex 32` is the ONLY correct generator here.
# Do NOT pipe through sanitize() — it would corrupt the hex output.
log "generating ENCRYPTION_KEY"
ENCRYPTION_KEY="$(openssl rand -hex 32)"

log "generating REDIS_PASSWORD"
REDIS_PASSWORD="$(sanitize "$(openssl rand -base64 32)")"

log "generating DB_ROOT_PASSWORD"
DB_ROOT_PASSWORD="$(sanitize "$(openssl rand -base64 32)")"

log "generating DB_PASSWORD"
DB_PASSWORD="$(sanitize "$(openssl rand -base64 32)")"

# ---------------------------------------------------------------------------
# Defaults for non-secret keys.
# ---------------------------------------------------------------------------
# Operators are expected to edit these in `.env` after generation if they
# need to deviate (e.g. enable S3 storage, restrict CORS_ORIGINS). Defaults
# are tuned for the in-cluster compose topology: REDIS_HOST/DB_HOST point at
# the compose service names; ports are the canonical defaults.

NODE_ENV="production"
PORT="3000"
API_PREFIX="api"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS="10"
THROTTLE_TTL="60"
THROTTLE_LIMIT="100"
FILE_STORAGE_DRIVER="local"
UPLOAD_LOCAL_DIR="./uploads"
LOG_LEVEL="info"
SWAGGER_PATH="docs"
CORS_ORIGINS="*"

REDIS_HOST="redis"
REDIS_PORT="6379"

DB_HOST="mariadb"
DB_PORT="3306"
DB_NAME="backend"
DB_USER="backend"

# AWS S3 keys are blank by default; only required when FILE_STORAGE_DRIVER=s3.
AWS_REGION=""
AWS_S3_BUCKET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# DATABASE_URL is assembled from the DB_* parts so a single rotation updates
# both the DSN and the standalone DB_PASSWORD without drift. Password is
# pre-sanitised to URL-safe characters so no percent-encoding is needed.
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# ---------------------------------------------------------------------------
# Write .env atomically with mode 600.
# ---------------------------------------------------------------------------

# Restrict file mode of newly created files in this shell to 600.
umask 077

log "writing ${ENV_FILE}"
cat > "${ENV_FILE}" <<EOF
# Generated by scripts/bootstrap.sh on $(date -u +%Y-%m-%dT%H:%M:%SZ)
# DO NOT commit this file. To rotate, run: bash scripts/bootstrap.sh --force

# Application
NODE_ENV=${NODE_ENV}
PORT=${PORT}
API_PREFIX=${API_PREFIX}
LOG_LEVEL=${LOG_LEVEL}
SWAGGER_PATH=${SWAGGER_PATH}
CORS_ORIGINS=${CORS_ORIGINS}

# Database
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
DATABASE_URL=${DATABASE_URL}

# Redis
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN}

# Encryption (AES-256-GCM — must be exactly 64 hex chars / 32 bytes)
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Hashing
BCRYPT_SALT_ROUNDS=${BCRYPT_SALT_ROUNDS}

# Throttling
THROTTLE_TTL=${THROTTLE_TTL}
THROTTLE_LIMIT=${THROTTLE_LIMIT}

# File uploads
FILE_STORAGE_DRIVER=${FILE_STORAGE_DRIVER}
UPLOAD_LOCAL_DIR=${UPLOAD_LOCAL_DIR}

# AWS S3 (only required when FILE_STORAGE_DRIVER=s3)
AWS_REGION=${AWS_REGION}
AWS_S3_BUCKET=${AWS_S3_BUCKET}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
EOF

# Defensive — `umask 077` should already cover this, but be explicit.
chmod 600 "${ENV_FILE}"

# ---------------------------------------------------------------------------
# Report — print ONLY a non-sensitive marker (first 8 chars of DB_USER).
# ---------------------------------------------------------------------------

MARKER="$(printf '%s' "${DB_USER}" | cut -c1-8)"
log "done. db user marker (first 8 chars of DB_USER): ${MARKER}"
log "secrets stored at ${ENV_FILE} (mode 600). Never commit this file."
