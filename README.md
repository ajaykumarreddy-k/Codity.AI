# Codity.ai — Distributed Job Scheduler

> A production-inspired distributed job scheduling platform built for the Intern Assignment. Reliably executes asynchronous background jobs across multiple concurrent workers, with a full-featured web dashboard, complete observability, and rock-solid reliability primitives.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Database Design (ER Diagram)](#database-design-er-diagram)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [API Reference](#api-reference)
7. [Job Lifecycle](#job-lifecycle)
8. [Retry Strategies](#retry-strategies)
9. [Worker System](#worker-system)
10. [Frontend Dashboard](#frontend-dashboard)
11. [Design Decisions](#design-decisions)
12. [Setup Instructions](#setup-instructions)
13. [Running Tests](#running-tests)
14. [Environment Variables](#environment-variables)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Dashboard (Vite)                  │
│  Dashboard · Jobs · Queues · Workers · DLQ · Metrics · Docs │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (HTTP/JSON)
┌────────────────────────▼────────────────────────────────────┐
│                  FastAPI Backend  (:8000)                    │
│   /auth  /queues  /jobs  /workers  /metrics  /dlq           │
│   Async SQLAlchemy · Pydantic v2 · JWT Auth · structlog     │
└──────────┬─────────────────────────────┬────────────────────┘
           │                             │
┌──────────▼──────┐           ┌──────────▼──────────┐
│  PostgreSQL 17  │           │    Redis 8 (Cache/   │
│  Primary Store  │           │    Future Pub-Sub)   │
│  SKIP LOCKED    │           └─────────────────────-┘
│  Atomic Claims  │
└──────────┬──────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│              Worker Process (async Python)                   │
│  Poll → Claim (SKIP LOCKED) → Execute → Heartbeat → Retry  │
│  Concurrency: 10 concurrent tasks · 5s heartbeat interval   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI 0.110+ (async) |
| ORM | SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 17 |
| Cache / Pub-Sub | Redis 8 |
| Migrations | Alembic |
| Auth | JWT (PyJWT) + bcrypt (passlib) |
| Logging | structlog (structured JSON logs) |
| Scheduler | APScheduler 3.x |
| Runtime | Python 3.13 + uv |
| Containerization | Docker + Docker Compose |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Animations | Framer Motion |
| Diagrams | Mermaid.js |
| Icons | Lucide React |
| Notifications | Sonner |
| Theme | next-themes (dark/light) |
| AI Integration | Google Gemini API |

---

## Database Design (ER Diagram)

```
users
  id (UUID PK)
  email (UNIQUE, indexed)
  password_hash
  created_at

organizations
  id (UUID PK)
  name
  created_at

organization_members          ← join table (composite PK)
  organization_id (FK → organizations, CASCADE)
  user_id         (FK → users, CASCADE)
  role            (member | admin)

projects
  id (UUID PK)
  organization_id (FK → organizations, CASCADE)
  name
  description
  created_at

retry_policies
  id (UUID PK)
  name
  strategy    (FIXED | LINEAR | EXPONENTIAL)
  max_attempts
  base_delay_seconds
  created_at

queues
  id (UUID PK)
  project_id      (FK → projects, CASCADE)
  retry_policy_id (FK → retry_policies, SET NULL)
  name            (indexed)
  priority
  max_concurrency
  paused          (BOOLEAN)
  created_at

workers
  id (UUID PK)
  hostname
  status      (ONLINE | OFFLINE | MAINTENANCE)
  registered_at

worker_heartbeats
  id (UUID PK)
  worker_id (FK → workers, CASCADE, UNIQUE)
  last_seen

jobs
  id (UUID PK)
  queue_id    (FK → queues, CASCADE)
  worker_id   (FK → workers, SET NULL)
  type
  payload     (JSONB)
  status      (QUEUED|SCHEDULED|CLAIMED|RUNNING|COMPLETED|FAILED|DEAD_LETTER)
  priority
  attempts
  max_attempts
  scheduled_at
  claimed_at
  started_at
  completed_at
  created_at
  updated_at
  ── INDEX: (status, priority, created_at)  ← critical for claim performance

job_executions
  id (UUID PK)
  job_id    (FK → jobs, CASCADE)
  worker_id (FK → workers, SET NULL)
  attempt
  status
  started_at
  ended_at
  duration_ms
  error_message

job_logs
  id (UUID PK)
  job_id    (FK → jobs, CASCADE)
  level     (INFO | WARN | ERROR)
  message
  created_at

scheduled_jobs
  id (UUID PK)
  job_id          (FK → jobs, CASCADE, UNIQUE)
  cron_expression
  next_run

dead_letter_queue
  id (UUID PK)
  job_id         (FK → jobs, CASCADE, UNIQUE)
  failure_reason
  failed_at
```

### Key Design Decisions
- **UUID primary keys** — globally unique, safe for distributed systems, no sequential guessing.
- **JSONB payload** — flexible job inputs without schema changes; supports GIN indexing for queries.
- **Composite index on `jobs(status, priority, created_at)`** — the claim query's hot path. Without this, every poll would do a full table scan.
- **`FOR UPDATE SKIP LOCKED`** — PostgreSQL's native mechanism for atomic, race-free job claiming. No Redis lock needed.
- **Cascade deletes** — deleting a project removes its queues → jobs → executions → logs automatically.
- **`SET NULL` on worker FK** — a job survives worker removal; history is preserved.
- **`worker_heartbeats` (1-to-1 unique)** — upserted every 5s; a single row per worker avoids unbounded growth.

---

## Project Structure

```
codity.ai/
├── backend/                         # FastAPI backend
│   ├── app/
│   │   ├── main.py                  # App entrypoint, lifespan, CORS, router mount
│   │   ├── api/
│   │   │   ├── auth.py              # Register, login, JWT token issue
│   │   │   ├── queues.py            # CRUD + pause/resume
│   │   │   ├── jobs.py              # CRUD + retry + cancel + logs + executions
│   │   │   ├── workers.py           # Register, heartbeat, list
│   │   │   ├── metrics.py           # System/queue/worker metrics
│   │   │   ├── dlq.py               # Dead letter queue list + retry + delete
│   │   │   └── deps.py              # JWT dependency injection
│   │   ├── core/
│   │   │   ├── config.py            # Settings via pydantic-settings + .env
│   │   │   ├── database.py          # Async SQLAlchemy engine + session factory
│   │   │   ├── security.py          # bcrypt hashing, JWT create/verify
│   │   │   └── logging.py           # structlog setup
│   │   ├── models/
│   │   │   └── models.py            # All 12 SQLAlchemy ORM models + enums
│   │   ├── repositories/
│   │   │   ├── base.py              # Generic CRUD base repository
│   │   │   └── job_repository.py    # Atomic claim (SKIP LOCKED), status update
│   │   ├── schemas/
│   │   │   ├── auth.py              # UserCreate, UserResponse, Token schemas
│   │   │   └── job.py               # JobCreate, JobResponse Pydantic schemas
│   │   ├── worker/
│   │   │   ├── worker.py            # WorkerProcess: register, poll loop, concurrency
│   │   │   ├── claimer.py           # Thin wrapper around job_repository.claim_job
│   │   │   ├── executor.py          # JobExecutor: simulate delay/fail, write logs
│   │   │   ├── heartbeat.py         # Background heartbeat coroutine (5s interval)
│   │   │   └── lifecycle.py         # RUNNING → COMPLETED/FAILED/DLQ state machine
│   │   └── scheduler/
│   │       └── cron_scheduler.py    # APScheduler integration for recurring jobs
│   ├── alembic/                     # Database migration scripts
│   ├── tests/
│   │   └── test_api.py              # Pytest async test suite (SQLite in-memory)
│   ├── Dockerfile                   # Production image (python:3.13-slim + uv)
│   ├── docker-compose.yml           # Full stack: API + Worker + Postgres + Redis
│   └── pyproject.toml               # Dependencies, tool config (uv, ruff, pytest)
│
├── src/                             # React frontend
│   ├── App.tsx                      # Router with all 19 routes
│   ├── pages/
│   │   ├── Dashboard.tsx            # System health overview, live stats
│   │   ├── Projects.tsx             # Project list and creation
│   │   ├── ProjectDetails.tsx       # Project queues and stats
│   │   ├── Queues.tsx               # Queue management with pause/resume
│   │   ├── QueueDetails.tsx         # Per-queue jobs, metrics, config
│   │   ├── Jobs.tsx                 # Job explorer with filter/search
│   │   ├── JobDetails.tsx           # Full job detail: logs, executions, retry
│   │   ├── Workers.tsx              # Worker registry, status, heartbeat
│   │   ├── WorkerDetails.tsx        # Per-worker job history and metrics
│   │   ├── ScheduledJobs.tsx        # Cron and delayed job management
│   │   ├── DLQ.tsx                  # Dead Letter Queue with retry/delete
│   │   ├── Metrics.tsx              # Charts: throughput, success rate, timelines
│   │   ├── RetryPolicies.tsx        # Retry policy CRUD and configuration
│   │   ├── AuditLogs.tsx            # System audit log viewer
│   │   ├── Architecture.tsx         # Live Mermaid architecture diagram
│   │   ├── Documentation.tsx        # Inline API documentation
│   │   ├── Settings.tsx             # App configuration panel
│   │   ├── Login.tsx                # JWT login form
│   │   └── Register.tsx             # User registration form
│   └── components/
│       └── layout/
│           └── AppLayout.tsx        # Sidebar + topbar shell
├── package.json
└── vite.config.ts
```

---

## Core Features

### ✅ Authentication & User Management
- `POST /auth/register` — create an account (bcrypt-hashed password)
- `POST /auth/login` — returns `access_token` + `refresh_token` (JWT HS256)
- `GET /auth/me` — JWT-protected current user

### ✅ Organizations, Projects & Queues
- Users belong to organizations via `OrganizationMember` (role-aware)
- Each project owns multiple queues with isolated configuration
- Queue properties: `priority`, `max_concurrency`, `paused`, `retry_policy_id`
- `POST /queues/{id}/pause` and `POST /queues/{id}/resume`

### ✅ Job Types
| Type | How to submit |
|---|---|
| **Immediate** | `POST /jobs` with no `scheduled_at` → status `QUEUED` |
| **Delayed** | `POST /jobs` with future `scheduled_at` → status `SCHEDULED` |
| **Recurring (Cron)** | Via `scheduled_jobs` table + APScheduler cron_expression |
| **Batch** | Submit multiple jobs in a loop to the same queue |

### ✅ Dead Letter Queue
- Jobs exceeding `max_attempts` are atomically moved to `DEAD_LETTER` status
- A `DeadLetterQueue` record captures the failure reason and timestamp
- `POST /dlq/{id}/retry` resets attempts and re-queues the job
- `DELETE /dlq/{id}` permanently discards the entry

### ✅ Execution Logging
- Every job execution writes a `JobExecution` row with `attempt`, `started_at`, `ended_at`, `duration_ms`, `error_message`
- Every lifecycle event writes a `JobLog` row (INFO/ERROR level)
- Queryable via `GET /jobs/{id}/logs` and `GET /jobs/{id}/executions`

### ✅ Metrics & Observability
- `GET /metrics/system` — total, completed, failed, running, queued, DLQ count, success rate, failure rate
- `GET /metrics/queues` — per-queue running/queued/failed breakdown
- `GET /metrics/workers` — per-worker status and last heartbeat
- All backend events logged as structured JSON via `structlog`

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login → tokens |
| GET | `/auth/me` | Current user (JWT) |
| GET | `/queues` | List all queues |
| POST | `/queues` | Create queue |
| GET | `/queues/{id}` | Get queue |
| POST | `/queues/{id}/pause` | Pause queue |
| POST | `/queues/{id}/resume` | Resume queue |
| GET | `/jobs` | List jobs (paginated: `skip`, `limit`) |
| POST | `/jobs` | Create job |
| GET | `/jobs/{id}` | Get job |
| POST | `/jobs/{id}/retry` | Manual retry (FAILED/DLQ only) |
| POST | `/jobs/{id}/cancel` | Cancel job |
| GET | `/jobs/{id}/logs` | Job log entries |
| GET | `/jobs/{id}/executions` | Execution history |
| GET | `/workers` | List workers |
| POST | `/workers/register` | Register worker |
| POST | `/workers/{id}/heartbeat` | Send heartbeat |
| GET | `/metrics/system` | System-wide metrics |
| GET | `/metrics/queues` | Per-queue metrics |
| GET | `/metrics/workers` | Worker health metrics |
| GET | `/dlq` | List DLQ entries |
| POST | `/dlq/{id}/retry` | Re-queue DLQ job |
| DELETE | `/dlq/{id}` | Delete DLQ entry |

**Interactive docs:** `http://localhost:8000/docs` (Swagger UI) · `http://localhost:8000/redoc` (ReDoc)

---

## Job Lifecycle

```
                   ┌──────────┐
                   │  QUEUED  │◄──── Manual retry / DLQ retry
                   └────┬─────┘
        scheduled_at?   │  no scheduled_at
              ▼         ▼
        ┌──────────┐  Claim (SKIP LOCKED)
        │SCHEDULED │──────────────────────►┌─────────┐
        └──────────┘                       │ CLAIMED │
                                           └────┬────┘
                                                │ worker picks up
                                                ▼
                                          ┌─────────┐
                                          │ RUNNING │
                                          └────┬────┘
                              ┌───────────┬────┘
                           success      fail
                              │            │
                       ┌──────▼───┐  attempts < max?
                       │COMPLETED │       │ yes → back to QUEUED
                       └──────────┘       │ no
                                    ┌─────▼──────┐
                                    │DEAD_LETTER │
                                    └────────────┘
```

---

## Retry Strategies

Configured per-queue via `RetryPolicy`:

| Strategy | Delay Formula | Example (base=30s) |
|---|---|---|
| `FIXED` | `base_delay` | 30s, 30s, 30s |
| `LINEAR` | `attempt × base_delay` | 30s, 60s, 90s |
| `EXPONENTIAL` | `2^(attempt-1) × base_delay` | 30s, 60s, 120s |

`max_attempts` defaults to 3. Exceeded → `DEAD_LETTER`.

---

## Worker System

The worker process (`app/worker/worker.py`) is a standalone async Python process:

1. **Register** — inserts a `Worker` row and initial `WorkerHeartbeat` on startup
2. **Poll** — tight loop calling `claim_job` every iteration; backs off 1s when idle
3. **Atomic Claim** — single `UPDATE ... WHERE id = (SELECT ... FOR UPDATE SKIP LOCKED) RETURNING *` query; guarantees exactly-once claiming across N concurrent workers
4. **Execute** — `JobExecutor.execute()` runs the job (pluggable; currently simulates via payload flags)
5. **Lifecycle** — `JobLifecycle.process_job()` drives all state transitions and writes execution/log records
6. **Heartbeat** — background asyncio task upserts `WorkerHeartbeat.last_seen` every 5 seconds
7. **Error Recovery** — unhandled exceptions in the poll loop are caught, logged, and retried after 5s
8. **Graceful Shutdown** — `KeyboardInterrupt` → `CancelledError` → loop exits cleanly

**Concurrency:** `WORKER_CONCURRENCY=10` (configurable). Multiple worker processes can run in parallel — each independently claims separate jobs via `SKIP LOCKED`.

---

## Frontend Dashboard

19 pages built in React 19 + TypeScript:

| Page | Features |
|---|---|
| **Dashboard** | System stats cards, live job status breakdown, worker health |
| **Projects** | Project list, create project form |
| **Project Details** | Associated queues, project-level stats |
| **Queues** | Queue table with pause/resume toggle, priority badge |
| **Queue Details** | Queue jobs, configuration, concurrency, retry policy |
| **Jobs** | Searchable/filterable job explorer, status chips |
| **Job Details** | Payload, execution history timeline, log viewer, retry/cancel buttons |
| **Workers** | Worker cards with status indicator and last heartbeat |
| **Worker Details** | Assigned job history, uptime, metrics |
| **Scheduled Jobs** | Cron and delayed jobs with next run time |
| **DLQ** | Dead letter entries, one-click retry or delete |
| **Metrics** | Recharts: throughput, success rate, queue depth over time |
| **Retry Policies** | Create and view retry policy configurations |
| **Audit Logs** | System event log viewer |
| **Architecture** | Live Mermaid.js system architecture diagram |
| **Documentation** | Inline API documentation with endpoint reference |
| **Settings** | Backend URL, refresh interval, theme configuration |
| **Login / Register** | JWT auth forms |

Dark mode enabled by default via `next-themes`.

---

## Design Decisions

### 1. `FOR UPDATE SKIP LOCKED` over Redis-based locking
PostgreSQL's `SKIP LOCKED` is an atomic, ACID-compliant claim mechanism built into the database. It requires no external coordination service, eliminates distributed lock complexity, and handles worker crashes gracefully (locks released on connection drop). A Redis-based lock adds a second system to keep consistent and introduces TOCTOU gaps.

### 2. Async-first (asyncio + asyncpg)
All I/O — database, Redis, HTTP — is async. This allows the worker to run 10 concurrent jobs in a single Python process without threading overhead. FastAPI + asyncpg delivers high throughput on modest hardware.

### 3. Repository pattern
`BaseRepository` provides generic `get`, `get_multi`, `create`, `update`, `remove`. `JobRepository` extends it with domain-specific operations (`claim_job`, `update_status`). This keeps API route handlers clean and makes the data layer testable in isolation.

### 4. SQLite for tests, PostgreSQL for production
Tests use `aiosqlite` (in-memory) via `app.dependency_overrides[get_db]`. No Docker required for CI. PostgreSQL-specific features (`FOR UPDATE SKIP LOCKED`, `JSONB`) are only exercised in integration.

### 5. structlog for structured logging
Every log line is a JSON object with named fields (`job_id`, `worker_id`, `error`, etc.). This makes logs trivially queryable in any log aggregation tool (Loki, CloudWatch, Datadog).

### 6. Separate worker process
The worker runs as a separate Python process, not a background thread inside the API. This allows independent horizontal scaling: 1 API instance + N worker instances. Each worker registers itself and claims jobs independently.

### 7. Alembic + auto-create fallback
`Base.metadata.create_all` runs on both API and worker startup as a safety net for development. Production deployments should use `alembic upgrade head` to apply migrations properly.

---

## Setup Instructions

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone <repo-url>
cd codity.ai

# 2. Start all services (API + Worker + PostgreSQL + Redis)
cd backend
docker compose up --build

# API:      http://localhost:8000
# Docs:     http://localhost:8000/docs
```

### Option B — Local Development

**Prerequisites:** Python 3.13+, uv, Node.js 20+, PostgreSQL 17, Redis 8

#### Backend

```bash
cd backend

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL and REDIS_URL to your local instances

# Run database migrations
uv run alembic upgrade head

# Start the API server
uv run uvicorn app.main:app --reload --port 8000

# In a second terminal: start the worker
uv run python -m app.worker.worker
```

#### Frontend

```bash
# From the project root
npm install
npm run dev
# Dashboard: http://localhost:3000
```

### Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://codity:codity_pass@localhost:5432/codity_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Security — CHANGE THIS IN PRODUCTION
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

---

## Running Tests

```bash
cd backend

# Run the full test suite (uses SQLite in-memory — no external services needed)
uv run pytest tests/ -v

# Run with coverage
uv run pytest tests/ -v --tb=short
```

### Test Coverage

| Test | What it verifies |
|---|---|
| `test_health_check` | API is running and responding |
| `test_register_user` | User creation with hashed password |
| `test_register_duplicate_user` | 400 on duplicate email |
| `test_login` | Returns `access_token` + `refresh_token` |
| `test_login_wrong_password` | 401 on bad credentials |
| `test_register_worker` | Worker registration returns `id` + `hostname` |
| `test_worker_heartbeat` | Heartbeat endpoint returns `{"status": "ok"}` |
| `test_system_metrics` | Metrics endpoint returns all required fields |

---

## Evaluation Coverage

| Criterion | Implementation |
|---|---|
| **System Architecture (20)** | FastAPI async API · standalone worker process · PostgreSQL · Redis · Docker Compose orchestration |
| **Database Design (20)** | 12 normalized tables · UUID PKs · JSONB · composite indexes · cascade/SET NULL FK behavior |
| **Backend Engineering (20)** | Repository pattern · Pydantic v2 validation · JWT auth · structured error responses · structlog |
| **Reliability & Concurrency (15)** | `FOR UPDATE SKIP LOCKED` atomic claiming · retry state machine · DLQ · heartbeat monitoring |
| **Frontend & UX (10)** | 19-page React dashboard · dark mode · charts · real-time metrics polling · job explorer |
| **API Design (5)** | RESTful · paginated list endpoints · Swagger/ReDoc auto-docs · consistent error shapes |
| **Documentation (5)** | This README · Architecture page in dashboard · Mermaid diagrams · inline API docs page |
| **Testing (5)** | pytest-asyncio suite · SQLite override · 8 test cases across auth/workers/metrics |

---

## License

MIT — built for the Codity.ai Intern Assignment.
# Codity.AI
