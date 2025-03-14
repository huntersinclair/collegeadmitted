FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Node.js for Supabase CLI
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the migration script and make it executable
COPY migration.sh .
RUN chmod +x migration.sh

# Copy the rest of the application
COPY . .

# Create a non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Create a startup script that runs migrations and then starts the application
RUN echo '#!/bin/bash\n\
./migration.sh\n\
uvicorn app.main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

# Command to run the startup script
CMD ["/app/start.sh"] 