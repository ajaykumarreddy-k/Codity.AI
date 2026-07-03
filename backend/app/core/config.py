from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Codity.ai Backend"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://codity:codity_pass@localhost:5432/codity_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Worker Config
    WORKER_CONCURRENCY: int = 10
    WORKER_HEARTBEAT_INTERVAL: int = 5
    
    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()
