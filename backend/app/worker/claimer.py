from app.repositories.job_repository import job_repo
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

class JobClaimer:
    @staticmethod
    async def claim_next_job(db: AsyncSession, worker_id: uuid.UUID):
        """
        Uses the highly reliable PostgreSQL FOR UPDATE SKIP LOCKED pattern
        from the JobRepository.
        """
        job = await job_repo.claim_job(db, worker_id)
        return job
