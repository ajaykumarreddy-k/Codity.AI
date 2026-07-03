from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime
from app.models.models import JobStatus

class JobCreate(BaseModel):
    queue_id: UUID
    type: str
    payload: Dict[str, Any] = {}
    priority: int = 10
    scheduled_at: Optional[datetime] = None
    max_attempts: int = 3

class JobResponse(BaseModel):
    id: UUID
    queue_id: UUID
    type: str
    payload: Dict[str, Any]
    status: JobStatus
    priority: int
    attempts: int
    max_attempts: int
    scheduled_at: Optional[datetime]
    claimed_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    worker_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
