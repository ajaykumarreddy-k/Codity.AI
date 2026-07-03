import asyncio
import uuid
import socket
from app.core.database import AsyncSessionLocal, engine
from app.models.models import Base, Worker, WorkerHeartbeat
from app.worker.claimer import JobClaimer
from app.worker.lifecycle import JobLifecycle
from app.worker.heartbeat import heartbeat_loop
from app.core.logging import logger
from app.core.config import get_settings

settings = get_settings()

class WorkerProcess:
    def __init__(self):
        self.worker_id = uuid.uuid4()
        self.hostname = socket.gethostname()
        self.concurrency = settings.WORKER_CONCURRENCY

    async def setup_db(self):
        """Create tables if they don't exist yet (handles running worker before API)."""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def register(self):
        async with AsyncSessionLocal() as db:
            worker = Worker(id=self.worker_id, hostname=self.hostname)
            db.add(worker)
            await db.flush()
            hb = WorkerHeartbeat(worker_id=self.worker_id)
            db.add(hb)
            await db.commit()
            logger.info("worker_started", worker_id=str(self.worker_id), concurrency=self.concurrency)

    async def run(self):
        await self.setup_db()
        await self.register()
        
        # Start heartbeat in background
        asyncio.create_task(heartbeat_loop(self.worker_id, settings.WORKER_HEARTBEAT_INTERVAL))
        
        logger.info("worker_polling", worker_id=str(self.worker_id))
        
        # Start worker loop
        while True:
            try:
                async with AsyncSessionLocal() as db:
                    job = await JobClaimer.claim_next_job(db, self.worker_id)
                    
                    if job:
                        logger.info("job_claimed", job_id=str(job.id), type=job.type)
                        # Open a new session for lifecycle (claimer session is closed)
                        async with AsyncSessionLocal() as exec_db:
                            await JobLifecycle.process_job(exec_db, job, self.worker_id)
                    else:
                        await asyncio.sleep(1)
            except Exception as e:
                logger.error("worker_loop_error", error=str(e), exc_info=True)
                await asyncio.sleep(5)

if __name__ == "__main__":
    worker = WorkerProcess()
    asyncio.run(worker.run())
