import asyncio
from app.models.models import Job, JobLog
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import logger

class JobExecutor:
    @staticmethod
    async def execute(db: AsyncSession, job: Job):
        logger.info("job_execution_started", job_id=str(job.id), type=job.type)
        
        # Log start
        log = JobLog(job_id=job.id, level="INFO", message=f"Started execution of {job.type}")
        db.add(log)
        await db.commit()
        
        try:
            # Simulated Execution based on payload
            delay = job.payload.get("simulate_delay", 2.0)
            fail = job.payload.get("simulate_fail", False)
            
            await asyncio.sleep(delay)
            
            if fail:
                raise Exception("Simulated execution failure")
                
            # Log success
            log = JobLog(job_id=job.id, level="INFO", message=f"Successfully completed in {delay}s")
            db.add(log)
            await db.commit()
            
            logger.info("job_execution_completed", job_id=str(job.id))
            return True, None
            
        except Exception as e:
            # Log error
            log = JobLog(job_id=job.id, level="ERROR", message=str(e))
            db.add(log)
            await db.commit()
            
            logger.error("job_execution_failed", job_id=str(job.id), error=str(e))
            return False, str(e)
