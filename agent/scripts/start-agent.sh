#!/bin/bash

# Script to start the agent

# Check if .env file exists, create from example if not
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
fi

# Check if build exists
if [ ! -d "dist" ]; then
  echo "Building TypeScript code..."
  npm run build
fi

# Start the agent
echo "Starting the Agent..."
npm start 