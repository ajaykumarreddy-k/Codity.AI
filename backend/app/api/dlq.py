from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.models.models import DeadLetterQueue, Job, JobStatus

router = APIRouter(prefix="/dlq", tags=["dead-letter-queue"])

@router.get("")
async def list_dlq(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DeadLetterQueue).order_by(DeadLetterQueue.failed_at.desc()))
    return result.scalars().all()

@router.post("/{dlq_id}/retry")
async def retry_dlq_job(dlq_id: UUID, db: AsyncSession = Depends(get_db)):
    dlq = await db.get(DeadLetterQueue, dlq_id)
    if not dlq:
        raise HTTPException(status_code=404, detail="DLQ entry not found")
    
    job = await db.get(Job, dlq.job_id)
    if job:
        job.status = JobStatus.QUEUED
        job.attempts = 0
        db.add(job)
    
    await db.delete(dlq)
    await db.commit()
    return {"status": "job re-queued", "job_id": str(dlq.job_id)}

@router.delete("/{dlq_id}")
async def delete_dlq_entry(dlq_id: UUID, db: AsyncSession = Depends(get_db)):
    dlq = await db.get(DeadLetterQueue, dlq_id)
    if not dlq:
        raise HTTPException(status_code=404, detail="DLQ entry not found")
    await db.delete(dlq)
    await db.commit()
    return {"status": "deleted"}
