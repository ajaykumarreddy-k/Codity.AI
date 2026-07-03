from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.models import Job, JobLog, JobExecution, Queue, JobStatus
from app.schemas.job import JobCreate, JobResponse
from app.repositories.job_repository import job_repo
from app.repositories.base import BaseRepository
from app.core.logging import logger
from sqlalchemy.future import select

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("", response_model=JobResponse)
async def create_job(job_in: JobCreate, db: AsyncSession = Depends(get_db)):
    queue = await db.get(Queue, job_in.queue_id)
    if not queue:
        raise HTTPException(status_code=404, detail="Queue not found")
    if queue.paused:
        raise HTTPException(status_code=400, detail="Queue is paused")
        
    status = JobStatus.SCHEDULED if job_in.scheduled_at else JobStatus.QUEUED
    
    job = await job_repo.create(db=db, obj_in={
        "queue_id": job_in.queue_id,
        "type": job_in.type,
        "payload": job_in.payload,
        "priority": job_in.priority,
        "scheduled_at": job_in.scheduled_at,
        "status": status,
        "max_attempts": job_in.max_attempts,
    })
    logger.info("job_created", job_id=str(job.id), type=job.type, queue_id=str(queue.id))
    return job

@router.get("", response_model=List[JobResponse])
async def list_jobs(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    return await job_repo.get_multi(db=db, skip=skip, limit=limit)

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    job = await job_repo.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/{job_id}/retry", response_model=JobResponse)
async def retry_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    job = await job_repo.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status not in [JobStatus.FAILED, JobStatus.DEAD_LETTER]:
        raise HTTPException(status_code=400, detail="Only failed or dead-letter jobs can be retried")
    job.status = JobStatus.QUEUED
    job.attempts = 0
    db.add(job)
    await db.commit()
    await db.refresh(job)
    logger.info("job_manual_retry", job_id=str(job_id))
    return job

@router.post("/{job_id}/cancel", response_model=JobResponse)
async def cancel_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    job = await job_repo.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status in [JobStatus.COMPLETED, JobStatus.DEAD_LETTER]:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed or dead-letter job")
    job.status = JobStatus.FAILED
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job

@router.get("/{job_id}/logs")
async def get_job_logs(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobLog).filter(JobLog.job_id == job_id).order_by(JobLog.created_at))
    return result.scalars().all()

@router.get("/{job_id}/executions")
async def get_job_executions(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(JobExecution).filter(JobExecution.job_id == job_id).order_by(JobExecution.started_at))
    return result.scalars().all()
