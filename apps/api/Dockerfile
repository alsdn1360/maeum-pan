# Python 3.11 slim 이미지 (Cloud Run 최적화)
FROM python:3.11-slim

# 환경변수 설정
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# 의존성 먼저 복사 (캐시 활용)
COPY requirements.txt .

# 의존성 설치
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . ./api

# Cloud Run은 PORT 환경변수를 사용
EXPOSE 8080

# Uvicorn 실행 (workers는 Cloud Run이 자동 스케일링하므로 1개 권장)
CMD ["sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port $PORT"]
