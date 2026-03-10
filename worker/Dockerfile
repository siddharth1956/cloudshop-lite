# worker/Dockerfile
FROM python:3.11-slim AS base
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN adduser --disabled-password --gecos '' appuser
USER appuser

HEALTHCHECK --interval=60s --timeout=5s \
  CMD python -c "import redis, os; r=redis.from_url(os.environ.get('REDIS_URL','redis://localhost:6379')); r.ping()" || exit 1

CMD ["python", "-u", "worker.py"]
