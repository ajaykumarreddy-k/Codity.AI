from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.models.models import Worker, WorkerHeartbeat, WorkerStatus, utcnow
from app.schemas.worker import WorkerRegister, WorkerResponse, HeartbeatResponse
from app.core.logging import logger

router = APIRouter(prefix="/workers", tags=["workers"])

@router.post("/register", response_model=WorkerResponse)
async def register_worker(worker_in: WorkerRegister, db: AsyncSession = Depends(get_db)):
    worker = Worker(hostname=worker_in.hostname)
    db.add(worker)
    await db.flush()
    
    hb = WorkerHeartbeat(worker_id=worker.id)
    db.add(hb)
    await db.commit()
    await db.refresh(worker)
    
    logger.info("worker_registered_api", worker_id=str(worker.id), hostname=worker.hostname)
    return worker

@router.get("", response_model=List[WorkerResponse])
async def list_workers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Worker))
    return result.scalars().all()

@router.get("/{worker_id}", response_model=WorkerResponse)
async def get_worker(worker_id: UUID, db: AsyncSession = Depends(get_db)):
    worker = await db.get(Worker, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

@router.post("/{worker_id}/heartbeat", response_model=HeartbeatResponse)
async def worker_heartbeat(worker_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkerHeartbeat).filter(WorkerHeartbeat.worker_id == worker_id))
    hb = result.scalars().first()
    if not hb:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    hb.last_seen = utcnow()
    await db.commit()
    return {"status": "ok"}
