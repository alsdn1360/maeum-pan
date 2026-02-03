import logging
from contextlib import asynccontextmanager

from sqlalchemy import Boolean, Column, DateTime, String, Text, func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

Base = declarative_base()


class SermonSummary(Base):
    __tablename__ = "sermon_summaries"

    video_id = Column(String, primary_key=True)
    summary = Column(Text, nullable=False)
    sermon_date = Column(String, nullable=False)
    is_non_sermon = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


async_engine = None
async_session_factory = None

if settings.DATABASE_URL:
    try:
        db_url = settings.DATABASE_URL
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif db_url.startswith("postgresql://"):
            db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

        async_engine = create_async_engine(db_url, echo=False, pool_pre_ping=True)
        async_session_factory = async_sessionmaker(
            async_engine, class_=AsyncSession, expire_on_commit=False
        )
    except Exception as e:
        logger.error("Database engine 초기화 실패: %s", e)


@asynccontextmanager
async def get_db_session():
    if not async_session_factory:
        yield None
        return

    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


class SermonCacheService:
    @classmethod
    async def get_cached_sermon(cls, video_id: str) -> dict | None:
        if not async_session_factory:
            return None

        try:
            async with get_db_session() as session:
                if not session:
                    return None
                result = await session.execute(
                    select(SermonSummary).where(SermonSummary.video_id == video_id)
                )
                row = result.scalar_one_or_none()
                if row:
                    return {
                        "video_id": row.video_id,
                        "summary": row.summary,
                        "sermon_date": row.sermon_date,
                        "is_non_sermon": row.is_non_sermon,
                    }
                return None
        except Exception as e:
            logger.warning("DB 조회 실패 (video_id=%s): %s", video_id, e)
            return None

    @classmethod
    async def save_sermon(
        cls, video_id: str, summary: str, sermon_date: str, is_non_sermon: bool = False
    ) -> bool:
        if not async_session_factory:
            return False

        try:
            async with get_db_session() as session:
                if not session:
                    return False
                result = await session.execute(
                    select(SermonSummary).where(SermonSummary.video_id == video_id)
                )
                existing = result.scalar_one_or_none()

                if existing:
                    existing.summary = summary
                    existing.sermon_date = sermon_date
                    existing.is_non_sermon = is_non_sermon
                else:
                    new_sermon = SermonSummary(
                        video_id=video_id,
                        summary=summary,
                        sermon_date=sermon_date,
                        is_non_sermon=is_non_sermon,
                    )
                    session.add(new_sermon)
                return True
        except Exception as e:
            logger.warning("DB 저장 실패 (video_id=%s): %s", video_id, e)
            return False
