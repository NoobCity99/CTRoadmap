FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim

ARG CTR_VERSION=0.3.0-beta
ARG CTR_BUILD_SHA=unknown
ARG CTR_BUILD_DATE=unknown

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV CTR_VERSION=${CTR_VERSION}
ENV CTR_BUILD_SHA=${CTR_BUILD_SHA}
ENV CTR_BUILD_DATE=${CTR_BUILD_DATE}
ENV CTR_DEPLOYMENT_TYPE=docker
ENV CTR_CHANNEL=beta

LABEL org.opencontainers.image.title="CTRoadmap"
LABEL org.opencontainers.image.description="Local-first infrastructure atlas"
LABEL org.opencontainers.image.source="https://github.com/NoobCity99/CTRoadmap"
LABEL org.opencontainers.image.version="${CTR_VERSION}"
LABEL org.opencontainers.image.revision="${CTR_BUILD_SHA}"
LABEL org.opencontainers.image.created="${CTR_BUILD_DATE}"

WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY data ./data
COPY exports ./exports
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 8088
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8088"]
