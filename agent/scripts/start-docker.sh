#!/bin/bash

# Script to start the Docker containers in the proper sequence
echo "=== Starting Ollama and Agent Containers ==="

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down

# Start Ollama container first
echo "Starting Ollama container..."
docker-compose up -d ollama


# Pull Qwen3 model
echo "Pulling Qwen3 model..."
docker-compose exec ollama ollama pull qwen3:0.6b
if [ $? -ne 0 ]; then
  echo "Error: Could not pull Qwen3 model. Check the logs with: docker-compose logs ollama"
  exit 1
fi

echo "Qwen3 model pulled successfully!"

# Start Agent container
echo "Starting Agent container..."
docker-compose up -d agent

echo "=== Setup Complete ==="
echo "Ollama is running at: http://localhost:11434"
echo "Agent is running at: http://localhost:3003"
echo
echo "To check container status, run: docker-compose ps"
echo "To view logs, run: docker-compose logs -f" 