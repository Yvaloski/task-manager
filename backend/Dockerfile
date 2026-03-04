FROM python:3.12

WORKDIR /app
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

RUN pip install -r requirements.txt

# Run quality checks and tests
RUN pytest -v --color=always --cov=app --cov-report=term-missing backend/app/tests

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
