#!/bin/bash

# Start Backend in background
echo "Starting Backend..."
(cd server && ./run.sh) &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for Server to be ready on port 8080..."
until curl -s http://localhost:8080/healthz > /dev/null; do
  echo "Still waiting..."
  sleep 1
done

echo "✅ Server is ready! Starting frontend..."

# Start frontend
(cd client && npm run dev) &

# Wait for both
wait
