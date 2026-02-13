import logging
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, String, Text, func, select
from sqlalchemy.dialects.postgresql import insert
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
    original_url = Column(Text, nullable=False)
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

        async_engine = create_async_engine(
            db_url,
            echo=False,
            pool_pre_ping=True,
            connect_args={"statement_cache_size": 0},  # pgbouncer 호환
        )
        async_session_factory = async_sessionmaker(
            async_engine, class_=AsyncSession, expire_on_commit=False
        )
    except Exception as e:
        logger.error("Database engine 초기화 실패: %s", e)


@asynccontextmanager
async def get_db_session(*, commit: bool = True):
    if not async_session_factory:
        yield None
        return

    async with async_session_factory() as session:
        try:
            yield session
            if commit and session.in_transaction():
                await session.commit()
        except Exception:
            if session.in_transaction():
                await session.rollback()
            raise


class SermonCacheService:
    @classmethod
    async def get_cached_sermon(cls, video_id: str) -> dict | None:
        if not async_session_factory:
            return None

        try:
            async with get_db_session(commit=False) as session:
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
                        "original_url": row.original_url,
                        "is_non_sermon": row.is_non_sermon,
                        "created_at": row.created_at,
                    }
                return None
        except Exception as e:
            logger.warning("DB 조회 실패 (video_id=%s): %s", video_id, e)
            return None

    @classmethod
    async def save_sermon(
        cls,
        video_id: str,
        summary: str,
        original_url: str,
        is_non_sermon: bool = False,
    ) -> datetime | None:
        """설교 저장 후 created_at 반환"""
        if not async_session_factory:
            return None

        try:
            async with get_db_session() as session:
                if not session:
                    return None
                now = datetime.now(UTC)
                insert_stmt = (
                    insert(SermonSummary)
                    .values(
                        video_id=video_id,
                        summary=summary,
                        original_url=original_url,
                        is_non_sermon=is_non_sermon,
                        created_at=now,
                    )
                    .on_conflict_do_nothing(index_elements=[SermonSummary.video_id])
                    .returning(SermonSummary.created_at)
                )
                insert_result = await session.execute(insert_stmt)
                inserted_created_at = insert_result.scalar_one_or_none()
                if inserted_created_at:
                    return inserted_created_at

                existing_result = await session.execute(
                    select(SermonSummary.created_at).where(
                        SermonSummary.video_id == video_id
                    )
                )
                return existing_result.scalar_one_or_none()
        except Exception as e:
            logger.warning("DB 저장 실패 (video_id=%s): %s", video_id, e)
            return None
