from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.models.models import Job, JobStatus, Queue, Worker, WorkerHeartbeat, DeadLetterQueue

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/system")
async def system_metrics(db: AsyncSession = Depends(get_db)):
    total = (await db.execute(select(func.count(Job.id)))).scalar_one()
    completed = (await db.execute(select(func.count(Job.id)).filter(Job.status == JobStatus.COMPLETED))).scalar_one()
    failed = (await db.execute(select(func.count(Job.id)).filter(Job.status == JobStatus.FAILED))).scalar_one()
    running = (await db.execute(select(func.count(Job.id)).filter(Job.status == JobStatus.RUNNING))).scalar_one()
    queued = (await db.execute(select(func.count(Job.id)).filter(Job.status == JobStatus.QUEUED))).scalar_one()
    dlq = (await db.execute(select(func.count(DeadLetterQueue.id)))).scalar_one()
    workers = (await db.execute(select(func.count(Worker.id)))).scalar_one()
    
    success_rate = round((completed / total * 100), 2) if total > 0 else 0.0
    failure_rate = round((failed / total * 100), 2) if total > 0 else 0.0
    
    return {
        "total_jobs": total,
        "completed": completed,
        "failed": failed,
        "running": running,
        "queued": queued,
        "dead_letter_queue": dlq,
        "active_workers": workers,
        "success_rate": success_rate,
        "failure_rate": failure_rate,
        "throughput": completed,  # jobs processed all time
    }

@router.get("/queues")
async def queue_metrics(db: AsyncSession = Depends(get_db)):
    queues = (await db.execute(select(Queue))).scalars().all()
    result = []
    for q in queues:
        running = (await db.execute(select(func.count(Job.id)).filter(Job.queue_id == q.id, Job.status == JobStatus.RUNNING))).scalar_one()
        queued = (await db.execute(select(func.count(Job.id)).filter(Job.queue_id == q.id, Job.status == JobStatus.QUEUED))).scalar_one()
        failed = (await db.execute(select(func.count(Job.id)).filter(Job.queue_id == q.id, Job.status == JobStatus.FAILED))).scalar_one()
        result.append({"queue_id": str(q.id), "name": q.name, "running": running, "queued": queued, "failed": failed})
    return result

@router.get("/workers")
async def worker_metrics(db: AsyncSession = Depends(get_db)):
    workers = (await db.execute(select(Worker, WorkerHeartbeat).join(WorkerHeartbeat, WorkerHeartbeat.worker_id == Worker.id, isouter=True))).all()
    return [{"worker_id": str(w.id), "hostname": w.hostname, "status": w.status, "last_seen": hb.last_seen if hb else None} for w, hb in workers]
