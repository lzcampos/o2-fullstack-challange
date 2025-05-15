#!/bin/bash

# Script to pull Mistral model from Ollama
echo "=== Pulling Mistral model from Ollama ==="

# Check if Ollama is running
echo "Checking if Ollama is running..."

max_attempts=5
attempt=0
sleep_time=5

while [ $attempt -lt $max_attempts ]; do
  echo "Attempt $(($attempt + 1))/$max_attempts: Checking Ollama server..."
  
  curl -s http://localhost:11434/api/tags > /dev/null
  if [ $? -eq 0 ]; then
    echo "Ollama is running!"
    break
  fi
  
  attempt=$(($attempt + 1))
  
  if [ $attempt -eq $max_attempts ]; then
    echo "Error: Cannot connect to Ollama after $max_attempts attempts. Make sure Ollama is running at http://localhost:11434"
    exit 1
  fi
  
  echo "Ollama not yet available. Waiting for $sleep_time seconds..."
  sleep $sleep_time
done

# Pull the model
echo "Pulling Mistral model..."
echo "This may take a few minutes depending on your internet connection..."

curl -X POST http://localhost:11434/api/pull -d '{"name": "mistral"}' | tee /dev/null

if [ $? -ne 0 ]; then
  echo "Error: Failed to pull the Mistral model. Check your internet connection and try again."
  exit 1
fi

echo "Model pulled successfully!"
echo "The agent is now ready to use." 