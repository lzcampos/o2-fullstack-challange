#!/bin/bash

echo "=== Starting Stock Management System ==="

echo "Stopping any existing containers..."
docker-compose down

echo "Starting all services: database, backend, Ollama, agent, and frontend..."
docker-compose up -d

echo "Waiting for services to initialize..."
echo "This might take a few minutes on first run as Ollama downloads the Qwen3 model."
sleep 5

echo "=== System Started ==="
echo "Frontend: http://localhost:3001"
echo "Backend API: http://localhost:3000"
echo "Agent API: http://localhost:3003"
echo "Ollama API: http://localhost:11434"
echo
echo "To check container status, run: docker-compose ps"
echo "To view logs, run: docker-compose logs -f"
echo "To stop all services, run: docker-compose down" 