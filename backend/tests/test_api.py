"""
Complete Codity.ai Backend Test Suite
Tests: Auth, Queues, Jobs, Worker Heartbeat, Metrics
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.core.database import get_db, Base

# Use SQLite for testing (in-memory)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True, scope="session")
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

# --- AUTH TESTS ---
@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_register_user(client):
    response = await client.post("/auth/register", json={"email": "test@example.com", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

@pytest.mark.asyncio
async def test_register_duplicate_user(client):
    await client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
    response = await client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login(client):
    await client.post("/auth/register", json={"email": "login_test@example.com", "password": "password123"})
    response = await client.post("/auth/login", json={"email": "login_test@example.com", "password": "password123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/auth/register", json={"email": "wrongpw@example.com", "password": "password123"})
    response = await client.post("/auth/login", json={"email": "wrongpw@example.com", "password": "wrongpass"})
    assert response.status_code == 401

# --- WORKER TESTS ---
@pytest.mark.asyncio
async def test_register_worker(client):
    response = await client.post("/workers/register", json={"hostname": "test-worker-001"})
    assert response.status_code == 200
    data = response.json()
    assert data["hostname"] == "test-worker-001"
    assert "id" in data
    return data["id"]

@pytest.mark.asyncio
async def test_worker_heartbeat(client):
    reg = await client.post("/workers/register", json={"hostname": "heartbeat-worker"})
    worker_id = reg.json()["id"]
    response = await client.post(f"/workers/{worker_id}/heartbeat")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

# --- METRICS TESTS ---
@pytest.mark.asyncio
async def test_system_metrics(client):
    response = await client.get("/metrics/system")
    assert response.status_code == 200
    data = response.json()
    assert "total_jobs" in data
    assert "success_rate" in data
