# Python 3.11 slim 이미지 (Cloud Run 최적화)
FROM python:3.11-slim

# 환경변수 설정
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# 시스템 의존성 설치 (빌드/미디어 처리용)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 의존성 먼저 복사 (캐시 활용)
COPY requirements.txt .

# 의존성 설치
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# Cloud Run은 PORT 환경변수를 사용
EXPOSE 8080

# Uvicorn 실행 (workers는 Cloud Run이 자동 스케일링하므로 1개 권장)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
