from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Job, JobStatus, JobExecution, DeadLetterQueue, Queue, RetryPolicy, RetryStrategy, utcnow
from app.repositories.job_repository import job_repo
from app.worker.executor import JobExecutor
from app.core.logging import logger
import uuid
from datetime import timedelta

class JobLifecycle:
    @staticmethod
    def _compute_retry_delay(policy: RetryPolicy, attempt: int) -> int:
        """
        Compute the delay in seconds before the next retry attempt.
        Strategies:
          FIXED:       base_delay (constant every time)
          LINEAR:      base_delay * attempt
          EXPONENTIAL: base_delay * 2^(attempt-1)
        """
        base = policy.base_delay_seconds
        if policy.strategy == RetryStrategy.LINEAR:
            return base * attempt
        elif policy.strategy == RetryStrategy.EXPONENTIAL:
            return base * (2 ** (attempt - 1))
        else:  # FIXED
            return base

    @staticmethod
    async def process_job(db: AsyncSession, job: Job, worker_id: uuid.UUID):
        # Re-fetch the job in this session so it's attached
        job = await job_repo.get(db, id=job.id)
        if not job:
            logger.error("lifecycle_job_not_found", job_id=str(job.id))
            return

        # 1. Mark as RUNNING
        job = await job_repo.update_status(db, job.id, JobStatus.RUNNING)
        job.attempts += 1
        db.add(job)
        await db.commit()
        await db.refresh(job)
        
        # Create execution record
        execution = JobExecution(
            job_id=job.id,
            worker_id=worker_id,
            attempt=job.attempts,
            status="RUNNING",
            started_at=utcnow()
        )
        db.add(execution)
        await db.commit()
        await db.refresh(execution)
        
        # 2. Execute
        success, error = await JobExecutor.execute(db, job)
        
        # 3. Handle Result
        ended_at = utcnow()
        execution.ended_at = ended_at
        execution.duration_ms = int((ended_at - execution.started_at).total_seconds() * 1000)
        
        if success:
            execution.status = "COMPLETED"
            await job_repo.update_status(db, job.id, JobStatus.COMPLETED)
        else:
            execution.status = "FAILED"
            execution.error_message = error
            
            if job.attempts >= job.max_attempts:
                # Move to DLQ
                await job_repo.update_status(db, job.id, JobStatus.DEAD_LETTER)
                dlq = DeadLetterQueue(job_id=job.id, failure_reason=error or "Max attempts exceeded")
                db.add(dlq)
                logger.warning("job_moved_to_dlq", job_id=str(job.id), attempts=job.attempts)
            else:
                # Compute retry delay based on the queue's retry policy
                queue = await db.get(Queue, job.queue_id)
                if queue and queue.retry_policy_id:
                    policy = await db.get(RetryPolicy, queue.retry_policy_id)
                    if policy:
                        delay_secs = JobLifecycle._compute_retry_delay(policy, job.attempts)
                        job.scheduled_at = utcnow() + timedelta(seconds=delay_secs)
                        logger.info(
                            "job_retry_scheduled",
                            job_id=str(job.id),
                            strategy=policy.strategy,
                            delay_secs=delay_secs,
                            next_attempt=job.attempts + 1
                        )

                # Back to QUEUED for retry
                await job_repo.update_status(db, job.id, JobStatus.QUEUED)
                db.add(job)
                logger.info("job_retrying", job_id=str(job.id), attempt=job.attempts, max=job.max_attempts)
        
        db.add(execution)
        await db.commit()
        logger.info("lifecycle_complete", job_id=str(job.id), success=success)

