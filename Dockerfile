FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY data ./data
COPY exports ./exports
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 8088
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8088"]
