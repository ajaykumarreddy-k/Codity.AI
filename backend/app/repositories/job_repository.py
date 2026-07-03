from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, text
from app.models.models import Job, JobStatus, utcnow
from app.repositories.base import BaseRepository
import uuid

class JobRepository(BaseRepository[Job, dict, dict]):
    def __init__(self):
        super().__init__(Job)

    async def claim_job(self, db: AsyncSession, worker_id: uuid.UUID) -> Optional[Job]:
        """
        ATOMIC JOB CLAIMING
        CRITICAL REQUIREMENT: Workers must never execute the same job twice.
        Uses PostgreSQL FOR UPDATE SKIP LOCKED.
        """
        # We use a pure SQL text query for the complex UPDATE ... FROM (SELECT ...) RETURNING
        # which is the most robust way to do SKIP LOCKED in Postgres.
        query = text("""
            UPDATE jobs
            SET status = 'CLAIMED',
                worker_id = :worker_id,
                claimed_at = NOW(),
                updated_at = NOW()
            WHERE id = (
                SELECT id
                FROM jobs
                WHERE status = 'QUEUED'
                  AND (scheduled_at IS NULL OR scheduled_at <= NOW())
                ORDER BY priority DESC, created_at ASC
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            )
            RETURNING *;
        """)
        
        result = await db.execute(query, {"worker_id": str(worker_id)})
        row = result.mappings().first()
        if row:
            await db.commit()
            # Fetch the actual ORM object so we can use relationships
            job = await self.get(db, id=row['id'])
            return job
        
        await db.commit()
        return None

    async def update_status(self, db: AsyncSession, job_id: uuid.UUID, status: JobStatus) -> Job:
        job = await self.get(db, id=job_id)
        if job:
            job.status = status
            job.updated_at = utcnow()
            if status == JobStatus.RUNNING:
                job.started_at = utcnow()
            elif status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.DEAD_LETTER]:
                job.completed_at = utcnow()
            db.add(job)
            await db.commit()
            await db.refresh(job)
        return job

job_repo = JobRepository()
