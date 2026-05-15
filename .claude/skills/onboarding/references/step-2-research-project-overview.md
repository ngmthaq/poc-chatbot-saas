# Step 2 — Research Project Overview

**Goal:** Read [PROJECT_OVERVIEW.md](../../../PROJECT_OVERVIEW.md) to check for existing information. Build a complete picture of the project. Write all findings to [PROJECT_OVERVIEW.md](../../../PROJECT_OVERVIEW.md).

## 2.1 — Project Name and Description

Scan for config files: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, `.csproj`, `pubspec.yaml`, `composer.json`. Extract `name` and `description` fields.

If not found, or the values are unclear or empty, ask the user:

> "What is the project name and description?"

## 2.2 — Programming Languages and Frameworks

Scan the repository for signals:

| Signal                     | Language / Framework |
| -------------------------- | -------------------- |
| `.ts`, `.tsx` files        | TypeScript           |
| `.js`, `.jsx` files        | JavaScript           |
| `next.config.*`            | Next.js              |
| `vite.config.*`            | Vite                 |
| `angular.json`             | Angular              |
| `nuxt.config.*`            | Nuxt                 |
| `.py` files                | Python               |
| `settings.py`, `manage.py` | Django               |
| `fastapi` in deps          | FastAPI              |
| `.go` files                | Go                   |
| `.rs` files                | Rust                 |
| `.java` + `pom.xml`        | Java / Maven         |
| `spring` in `pom.xml`      | Spring Boot          |
| `.cs` + `.csproj`          | C# / .NET            |
| `.dart` + `pubspec.yaml`   | Dart / Flutter       |
| `.rb` + `Gemfile`          | Ruby                 |
| `.php` + `composer.json`   | PHP / Laravel        |

For monorepos or microservices, list all discovered languages and frameworks per package or service.

## 2.3 — Package Manager

Detect by lock file:

| Lock File           | Package Manager |
| ------------------- | --------------- |
| `yarn.lock`         | Yarn            |
| `package-lock.json` | npm             |
| `pnpm-lock.yaml`    | pnpm            |
| `bun.lockb`         | Bun             |
| `Pipfile.lock`      | Pipenv          |
| `poetry.lock`       | Poetry          |
| `uv.lock`           | uv              |
| `Cargo.lock`        | Cargo           |
| `go.sum`            | Go modules      |
| `Gemfile.lock`      | Bundler         |
| `composer.lock`     | Composer        |

If multiple lock files exist for the same ecosystem, ask the user:

> "I found multiple lock files ([list them]). Which package manager should I use?"

## 2.4 — Key Libraries

Scan `package.json`, `requirements.txt`, `pyproject.toml`, or other manifests. List primary libraries that appear across multiple features or modules, such as `prisma`, `axios`, `formik`, `react-query`, `zod`, `express`, `sqlalchemy`, or `celery`. Omit dev-only or single-use utilities.

## 2.5 — Database

Skip this section for pure frontend repositories with no local database.

Look for:

- ORM or schema files: `prisma/schema.prisma`, `ormconfig.*`, `alembic.ini`, `database.yml`
- Environment variable names: `DATABASE_URL`, `DB_HOST`, `MONGO_URI`, `REDIS_URL`
- Dependencies: `pg`, `mysql2`, `mongodb`, `sqlite3`, `redis`, `typeorm`, `sequelize`, `sqlalchemy`

If nothing is found, ask:

> "Does this project use a database? If so, which one?"

## 2.6 — Doc Directory

Ask the user:

> "Where should agent-generated plan files be stored? (e.g., `docs/`, `.github/docs/`, `.claude/docs/`, `plans/`)"

## 2.7 — Testing Workflow

Ask the user:

> "What testing workflow do you follow?"
>
> - **Code-First** — Write code first, then add tests
> - **Test-First** — Write tests before implementation (TDD/BDD)
> - **Skip-Testing** — No automated tests in this project

## 2.8 — Playwright Check

Ask the user:

> "How should the reviewer and tester agents handle Playwright (browser) checks on UI-affecting changes?"
>
> - **Always** — Always run Playwright when UI changed
> - **None** — Skip Playwright checks entirely
> - **Ask-User** — Ask before running (default)

Default to `Ask-User` if the user does not respond.

## 2.9 — Write PROJECT_OVERVIEW.md

Write all findings to [PROJECT_OVERVIEW.md](../../../PROJECT_OVERVIEW.md).
