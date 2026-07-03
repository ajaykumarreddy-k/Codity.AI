import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.models import WorkerHeartbeat, utcnow
from app.core.database import AsyncSessionLocal
from app.core.logging import logger
import uuid

async def heartbeat_loop(worker_id: uuid.UUID, interval: int = 5):
    while True:
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(select(WorkerHeartbeat).filter(WorkerHeartbeat.worker_id == worker_id))
                hb = result.scalars().first()
                if hb:
                    hb.last_seen = utcnow()
                    await db.commit()
        except Exception as e:
            logger.error("heartbeat_failed", error=str(e))
            
        await asyncio.sleep(interval)
