from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Queue, Project

router = APIRouter(prefix="/queues", tags=["queues"])

class QueueCreate(BaseModel):
    project_id: UUID
    name: str
    priority: int = 10
    max_concurrency: Optional[int] = None

class QueueResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    priority: int
    max_concurrency: Optional[int]
    paused: bool

    class Config:
        from_attributes = True

@router.post("", response_model=QueueResponse)
async def create_queue(queue_in: QueueCreate, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, queue_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    queue = Queue(**queue_in.model_dump())
    db.add(queue)
    await db.commit()
    await db.refresh(queue)
    return queue

@router.get("", response_model=List[QueueResponse])
async def list_queues(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Queue))
    return result.scalars().all()

@router.get("/{queue_id}", response_model=QueueResponse)
async def get_queue(queue_id: UUID, db: AsyncSession = Depends(get_db)):
    q = await db.get(Queue, queue_id)
    if not q:
        raise HTTPException(status_code=404, detail="Queue not found")
    return q

@router.post("/{queue_id}/pause")
async def pause_queue(queue_id: UUID, db: AsyncSession = Depends(get_db)):
    q = await db.get(Queue, queue_id)
    if not q:
        raise HTTPException(status_code=404, detail="Queue not found")
    q.paused = True
    await db.commit()
    return {"status": "paused"}

@router.post("/{queue_id}/resume")
async def resume_queue(queue_id: UUID, db: AsyncSession = Depends(get_db)):
    q = await db.get(Queue, queue_id)
    if not q:
        raise HTTPException(status_code=404, detail="Queue not found")
    q.paused = False
    await db.commit()
    return {"status": "resumed"}
