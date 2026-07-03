from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from app.core.config import get_settings

settings = get_settings()

jobstores = {
    # Using the same database but synchronous driver for APScheduler storage for simplicity
    'default': SQLAlchemyJobStore(url=settings.DATABASE_URL.replace('+asyncpg', ''))
}

scheduler = AsyncIOScheduler(jobstores=jobstores)

def start_scheduler():
    scheduler.start()

def add_cron_job(func, cron_expression: str, args: tuple = None):
    # This maps to our ScheduledJobs architecture
    # Convert standard cron to APScheduler format if necessary, 
    # but APScheduler supports cron triggers directly.
    return scheduler.add_job(func, 'cron', args=args)
