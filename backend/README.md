# Codity.ai — Backend

> Production-grade distributed job scheduling engine built with **FastAPI**, **PostgreSQL**, and **async Python**. Atomically claims and executes background jobs across multiple concurrent workers using PostgreSQL's `FOR UPDATE SKIP LOCKED` — no Redis locking, no race conditions.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Tech Stack](#tech-stack)
3. [Module Map](#module-map)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Job Lifecycle](#job-lifecycle)
7. [Retry Strategies](#retry-strategies)
8. [Worker Internals](#worker-internals)
9. [Security](#security)
10. [Configuration](#configuration)
11. [Running Tests](#running-tests)
12. [Design Decisions](#design-decisions)

---

## Quick Start

### Docker (One Command)

```bash
# From the backend/ directory
docker compose up --build
```

This starts:
- **PostgreSQL 17** on `localhost:5432`
- **Redis 8** on `localhost:6379`
- **FastAPI API** on `localhost:8000` (auto-reloads)
- **Worker Process** (polls + executes jobs)

Interactive docs: http://localhost:8000/docs

---

### Local Development

**Prerequisites:** Python 3.13+, [uv](https://github.com/astral-sh/uv), PostgreSQL 17, Redis 8

```bash
# 1. Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Install all dependencies
cd backend
uv sync

# 3. Copy and configure environment
cp ../env.example .env
# Edit .env with your local DB and Redis URLs

# 4. Apply DB migrations
uv run alembic upgrade head

# 5. Start the API (terminal 1)
uv run uvicorn app.main:app --reload --port 8000

# 6. Start the worker (terminal 2)
uv run python -m app.worker.worker
```

---

## Tech Stack

| Concern | Technology | Why |
|---|---|---|
| Web Framework | FastAPI 0.110+ | Native async, Pydantic v2, auto-docs |
| ORM | SQLAlchemy 2.0 (async) | Async sessions, clean model DSL |
| Database | PostgreSQL 17 | `FOR UPDATE SKIP LOCKED`, JSONB, ACID |
| Cache | Redis 8 | Future pub-sub, session state |
| Migrations | Alembic | Schema versioning, rollback support |
| Auth | PyJWT + passlib/bcrypt | Industry-standard JWT HS256 |
| Logging | structlog | Structured JSON logs, named fields |
| Scheduling | APScheduler 3.x | Cron expression parsing |
| Package Mgr | uv | Fast, reproducible Python env |
| Linter | Ruff | Fast Python linting |
| Testing | pytest-asyncio + httpx | Async test client, SQLite override |

---

## Module Map

```
backend/
├── app/
│   ├── main.py                  # FastAPI app factory, CORS, router mount, lifespan
│   │
│   ├── api/                     # HTTP layer — thin, no business logic
│   │   ├── auth.py              # POST /auth/register, /auth/login, GET /auth/me
│   │   ├── queues.py            # CRUD + pause/resume
│   │   ├── jobs.py              # CRUD + retry + cancel + logs + executions
│   │   ├── workers.py           # register + heartbeat + list
│   │   ├── metrics.py           # system / queue / worker metrics
│   │   ├── dlq.py               # dead-letter queue: list, retry, delete
│   │   └── deps.py              # get_current_user JWT dependency
│   │
│   ├── core/
│   │   ├── config.py            # Settings (pydantic-settings, reads .env)
│   │   ├── database.py          # Async engine, AsyncSessionLocal, get_db
│   │   ├── security.py          # bcrypt hash/verify, create_access_token, create_refresh_token
│   │   └── logging.py           # structlog JSON processor setup
│   │
│   ├── models/
│   │   └── models.py            # 12 SQLAlchemy ORM models + JobStatus / RetryStrategy enums
│   │
│   ├── repositories/
│   │   ├── base.py              # Generic BaseRepository: get, get_multi, create, update, remove
│   │   └── job_repository.py    # claim_job (SKIP LOCKED), update_status
│   │
│   ├── schemas/
│   │   ├── auth.py              # UserCreate, UserResponse, Token
│   │   └── job.py               # JobCreate, JobResponse
│   │
│   ├── worker/
│   │   ├── worker.py            # WorkerProcess: register → poll → claim → execute loop
│   │   ├── claimer.py           # Thin wrapper: delegates to job_repository.claim_job
│   │   ├── executor.py          # JobExecutor: runs job, writes JobLog entries
│   │   ├── heartbeat.py         # Background coroutine: upserts WorkerHeartbeat every 5s
│   │   └── lifecycle.py         # State machine: RUNNING → COMPLETED / FAILED / DEAD_LETTER
│   │
│   └── scheduler/
│       └── cron_scheduler.py    # APScheduler setup for recurring/cron jobs
│
├── alembic/                     # Migration scripts
├── tests/
│   └── test_api.py              # 8 async tests: auth, workers, metrics
├── Dockerfile                   # python:3.13-slim + uv, no dev deps
├── docker-compose.yml           # API + Worker + PostgreSQL + Redis
├── pyproject.toml               # Dependencies, pytest, ruff config
└── alembic.ini                  # Migration DSN config
```

---

## Database Schema

All tables use **UUID primary keys** and **timezone-aware timestamps**.

### Tables

| Table | Purpose |
|---|---|
| `users` | Accounts with bcrypt-hashed passwords |
| `organizations` | Multi-tenant org grouping |
| `organization_members` | Composite PK join: user ↔ org with role |
| `projects` | Owned by an org; groups queues |
| `retry_policies` | Reusable FIXED / LINEAR / EXPONENTIAL configs |
| `queues` | Belongs to project; has priority, concurrency cap, paused flag |
| `workers` | Registered worker processes with hostname and status |
| `worker_heartbeats` | 1-to-1 with worker; `last_seen` upserted every 5s |
| `jobs` | Core entity: type, JSONB payload, status, attempts, timestamps |
| `job_executions` | One row per attempt: duration_ms, error_message |
| `job_logs` | Append-only INFO/ERROR log lines per job |
| `scheduled_jobs` | cron_expression + next_run for recurring jobs |
| `dead_letter_queue` | Permanent failures with failure_reason |

### Critical Index

```sql
CREATE INDEX idx_jobs_status_priority_created
    ON jobs (status, priority DESC, created_at ASC);
```

This index is the hot path for every worker poll. Without it, claiming a job requires a full table scan.

### Atomic Claim Query

```sql
UPDATE jobs
SET status     = 'CLAIMED',
    worker_id  = :worker_id,
    claimed_at = NOW(),
    updated_at = NOW()
WHERE id = (
    SELECT id FROM jobs
    WHERE status = 'QUEUED'
      AND (scheduled_at IS NULL OR scheduled_at <= NOW())
    ORDER BY priority DESC, created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
)
RETURNING *;
```

`FOR UPDATE SKIP LOCKED` means concurrent workers atomically skip rows already locked by another transaction. No job is ever claimed twice.

### FK Cascade Behaviour

| Relationship | On Delete |
|---|---|
| org → org_members | CASCADE |
| project → queues | CASCADE |
| queue → jobs | CASCADE |
| job → job_executions | CASCADE |
| job → job_logs | CASCADE |
| job → dead_letter_queue | CASCADE |
| job → scheduled_jobs | CASCADE |
| worker → jobs | SET NULL (job survives) |
| worker → worker_heartbeats | CASCADE |
| retry_policy → queues | SET NULL (queue survives) |

---

## API Endpoints

### Auth — `/auth`

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/auth/register` | `{email, password}` | Create user account |
| `POST` | `/auth/login` | `{email, password}` | Returns `access_token` + `refresh_token` |
| `GET` | `/auth/me` | — (JWT header) | Current authenticated user |

### Queues — `/queues`

| Method | Path | Description |
|---|---|---|
| `GET` | `/queues` | List all queues |
| `POST` | `/queues` | Create queue (project_id, name, priority, max_concurrency) |
| `GET` | `/queues/{id}` | Get single queue |
| `POST` | `/queues/{id}/pause` | Pause queue (new jobs rejected) |
| `POST` | `/queues/{id}/resume` | Resume queue |

### Jobs — `/jobs`

| Method | Path | Description |
|---|---|---|
| `GET` | `/jobs` | List jobs — `?skip=0&limit=50` |
| `POST` | `/jobs` | Create job (queue_id, type, payload, priority, scheduled_at, max_attempts) |
| `GET` | `/jobs/{id}` | Get job detail |
| `POST` | `/jobs/{id}/retry` | Re-queue a FAILED or DEAD_LETTER job |
| `POST` | `/jobs/{id}/cancel` | Cancel a job (marks as FAILED) |
| `GET` | `/jobs/{id}/logs` | All JobLog entries for a job |
| `GET` | `/jobs/{id}/executions` | All JobExecution records for a job |

### Workers — `/workers`

| Method | Path | Description |
|---|---|---|
| `GET` | `/workers` | List all workers |
| `POST` | `/workers/register` | Register a new worker (hostname) |
| `POST` | `/workers/{id}/heartbeat` | Update last_seen timestamp |

### Metrics — `/metrics`

| Method | Path | Description |
|---|---|---|
| `GET` | `/metrics/system` | Total/completed/failed/running/queued counts, success rate |
| `GET` | `/metrics/queues` | Per-queue running/queued/failed breakdown |
| `GET` | `/metrics/workers` | Per-worker status + last heartbeat |

### Dead Letter Queue — `/dlq`

| Method | Path | Description |
|---|---|---|
| `GET` | `/dlq` | List DLQ entries (newest first) |
| `POST` | `/dlq/{id}/retry` | Reset attempts, re-queue job, remove DLQ entry |
| `DELETE` | `/dlq/{id}` | Permanently delete DLQ entry |

### Other

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | `{"status": "ok", "version": "1.0.0"}` |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc |
| `GET` | `/openapi.json` | Raw OpenAPI schema |

---

## Job Lifecycle

```
  Submit Job (POST /jobs)
         │
         ▼
   ┌───────────┐   scheduled_at set?   ┌─────────────┐
   │  QUEUED   │──────── yes ─────────►│  SCHEDULED  │
   └─────┬─────┘                       └──────┬──────┘
         │                                    │ time arrives
         │◄───────────────────────────────────┘
         │  Worker polls + SKIP LOCKED claim
         ▼
   ┌───────────┐
   │  CLAIMED  │  (atomic, row-level lock)
   └─────┬─────┘
         │ worker processes
         ▼
   ┌───────────┐
   │  RUNNING  │  (JobExecution row created, attempt++)
   └─────┬─────┘
    ┌────┴────┐
  success   failure
    │          │
    ▼          ▼
┌──────────┐  attempts < max_attempts?
│COMPLETED │       │ yes               │ no
└──────────┘       ▼                   ▼
              back to QUEUED     ┌─────────────┐
              (with delay)       │ DEAD_LETTER │
                                 └─────────────┘
```

Every transition writes a `JobExecution` row and one or more `JobLog` rows.

---

## Retry Strategies

Set `strategy` on a `RetryPolicy` and attach it to a queue.

| Strategy | Delay Formula | Attempts (base=30s) |
|---|---|---|
| `FIXED` | `base_delay_seconds` | 30s → 30s → 30s |
| `LINEAR` | `attempt × base_delay_seconds` | 30s → 60s → 90s |
| `EXPONENTIAL` | `2^(attempt-1) × base_delay_seconds` | 30s → 60s → 120s |

When `attempts >= max_attempts` the job moves to `DEAD_LETTER` and a `DeadLetterQueue` record is created with the `failure_reason`.

---

## Worker Internals

The worker is a **standalone async Python process** (`python -m app.worker.worker`), completely separate from the API.

```
WorkerProcess.run()
 │
 ├── setup_db()        → creates tables if missing (dev safety net)
 ├── register()        → INSERT Worker + WorkerHeartbeat
 ├── heartbeat_loop()  → asyncio.create_task() — runs every 5s in background
 │                        upserts WorkerHeartbeat.last_seen
 └── poll loop (while True)
      │
      ├── JobClaimer.claim_next_job()
      │    └── job_repo.claim_job()
      │         └── UPDATE ... FOR UPDATE SKIP LOCKED ... RETURNING *
      │
      ├── if job found:
      │    └── JobLifecycle.process_job()
      │         ├── update_status(RUNNING)
      │         ├── create JobExecution(attempt=N, started_at)
      │         ├── JobExecutor.execute()
      │         │    ├── write JobLog("Started execution")
      │         │    ├── asyncio.sleep(payload["simulate_delay"])
      │         │    ├── raise if payload["simulate_fail"]
      │         │    └── write JobLog("Completed" / "ERROR: ...")
      │         └── update_status(COMPLETED | QUEUED | DEAD_LETTER)
      │              └── if DEAD_LETTER: INSERT DeadLetterQueue
      │
      └── if no job: asyncio.sleep(1)  ← idle back-off
```

**Concurrency:** `WORKER_CONCURRENCY=10` determines how many jobs can execute simultaneously per process. Multiple worker processes can run in parallel — each independently claims separate jobs via `SKIP LOCKED`.

**Error handling:** Any unhandled exception in the poll loop is caught, logged with `structlog`, and the loop retries after a 5-second back-off.

---

## Security

| Mechanism | Implementation |
|---|---|
| Password hashing | `passlib` with `bcrypt` scheme |
| Access token | JWT HS256, 30-minute expiry |
| Refresh token | JWT HS256, 7-day expiry, `"type": "refresh"` claim |
| Token validation | `deps.py → get_current_user` reads `Authorization: Bearer <token>` |
| Secret key | `SECRET_KEY` env var — **must be rotated in production** |

All protected routes use `Depends(get_current_user)`. Public routes: `/health`, `/auth/register`, `/auth/login`, `/docs`, `/redoc`.

---

## Configuration

All settings are loaded from `.env` via `pydantic-settings`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://codity:codity_pass@localhost:5432/codity_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Security — CHANGE IN PRODUCTION
SECRET_KEY=supersecretkey_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Worker
WORKER_CONCURRENCY=10
WORKER_HEARTBEAT_INTERVAL=5

# Environment
ENVIRONMENT=development
```

Docker Compose injects these automatically. For local dev, copy and edit `.env`.

---

## Running Tests

Tests use **SQLite in-memory** via `aiosqlite` — no running Postgres or Redis needed.

```bash
cd backend

# Run all tests
uv run pytest tests/ -v

# Run with short traceback
uv run pytest tests/ -v --tb=short
```

### Test Cases

| Test | Coverage |
|---|---|
| `test_health_check` | API is alive and returns `{"status": "ok"}` |
| `test_register_user` | Creates user, returns `id` + `email` |
| `test_register_duplicate_user` | 400 on duplicate email |
| `test_login` | Returns `access_token` + `refresh_token` |
| `test_login_wrong_password` | 401 on bad credentials |
| `test_register_worker` | Worker registration returns `id` + `hostname` |
| `test_worker_heartbeat` | Heartbeat endpoint returns `{"status": "ok"}` |
| `test_system_metrics` | `/metrics/system` returns all required counters |

The test suite overrides the database dependency with a fresh SQLite DB per session and tears it down after all tests complete.

---

## Design Decisions

### `FOR UPDATE SKIP LOCKED` over Redis-based distributed locking
PostgreSQL's `SKIP LOCKED` is ACID-compliant and built into the storage layer. No external coordination service is needed, there are no TOCTOU gaps, and crashed workers release their locks automatically when their database connection drops. A Redis-based lock adds operational complexity and a second failure domain.

### Async-first (asyncio + asyncpg)
All I/O is non-blocking. The worker executes up to `WORKER_CONCURRENCY` jobs concurrently in a single Python process using `asyncio.create_task`. No threads, no GIL contention.

### Repository pattern
`BaseRepository` provides typed generic CRUD. `JobRepository` extends it with domain operations (`claim_job`, `update_status`). API route handlers stay thin — they delegate to repos and return Pydantic responses.

### Separate worker process
The worker is a standalone `python -m` entry-point, not a background thread in the API. This allows independent horizontal scaling: `N` API replicas + `M` worker replicas, each claiming separate jobs via `SKIP LOCKED`.

### Alembic + auto-create fallback
`Base.metadata.create_all` runs on startup as a development convenience. Production deployments should always use `alembic upgrade head` for controlled, versioned migrations.

### structlog for observability
Every critical event emits a structured log line: `{"event": "job_claimed", "job_id": "...", "type": "...", "timestamp": "..."}`. These are trivially queryable in any log aggregation stack (Loki, CloudWatch, Datadog).

### SQLite for tests, PostgreSQL for production
`SKIP LOCKED` and `JSONB` are PostgreSQL-specific. Tests use an SQLite override via `app.dependency_overrides[get_db]` to run without infrastructure. PostgreSQL-specific paths are covered by the running integration environment.
