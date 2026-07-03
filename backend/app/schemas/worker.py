from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.models import WorkerStatus

class WorkerRegister(BaseModel):
    hostname: str

class WorkerResponse(BaseModel):
    id: UUID
    hostname: str
    status: WorkerStatus
    registered_at: datetime

    class Config:
        from_attributes = True

class HeartbeatResponse(BaseModel):
    status: str = "ok"
