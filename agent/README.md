# AI Agent for Stock Management System

## Overview
This agent provides natural language processing capabilities for a stock management system, enabling users to interact with the application using everyday language.

## Architecture & Features

The AI agent employs a hybrid approach to natural language processing:

1. **Hugging Face LLM Intent Classification**: 
   - Primary method for classifying user intent
   - Uses the `google/flan-t5-small` model for efficient, lightweight classification
   - Processes Portuguese language queries to determine user intent

2. **Rule-Based Pattern Matching**:
   - Serves as both a fallback mechanism and parameter extraction system
   - Uses predefined patterns and regex to identify commands and extract structured data
   - Provides reliability when the LLM might struggle with specific extractions

3. **Parameter Extraction**:
   - Extracts dates, product IDs, quantities, and other parameters using regex
   - Handles time periods like "este mês", "semana atual", etc.
   - Combines LLM and rule-based approaches for optimal accuracy

4. **Fault Tolerance**:
   - Automatically falls back to rule-based processing if LLM fails
   - Ensures system reliability even when external services are unavailable

## Advantages
- **Fast Response Times**: Efficient processing with lightweight models
- **Robust Parameter Extraction**: Combines AI with deterministic rules
- **Graceful Degradation**: System continues functioning even if LLM service is unavailable
- **Easy Extensibility**: New patterns and rules can be added without retraining

## Supported Commands

The agent can interpret the following types of commands:

1. **GET_TOTAL_SALES**: Query sales data for specific periods
   - Example: "Mostrar vendas totais do mês atual"
   - Example: "Quanto foi o faturamento da semana passada?"

2. **GET_POPULAR_ITEMS**: Find the most popular or best-selling products
   - Example: "Quais são os produtos mais vendidos?"
   - Example: "Mostrar itens populares" 

3. **GET_STOCK**: Check current inventory levels
   - Example: "Mostrar estoque atual"
   - Example: "Qual o estoque do produto 5?"

4. **GET_METRICS**: View overall business metrics and statistics
   - Example: "Mostrar métricas de vendas"
   - Example: "Exibir dashboard de desempenho"

5. **REGISTER_MOVEMENT**: Register inventory movements (in/out)
   - Example: "Registrar entrada de 10 unidades do produto 2"
   - Example: "Adicionar saída de 5 itens do produto 3"

## Setup & Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
   - Make sure to add your Hugging Face API token
4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

- **GET /health**: Check if the server is running
- **POST /agent/query**: Send a natural language query to the agent
  ```json
  {
    "query": "Mostrar vendas totais deste mês"
  }
  ```

## Example Usage
```typescript
// Client-side example
const response = await fetch('http://localhost:3333/api/agent/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: "Qual o estoque atual do produto 5?"
  }),
});

const data = await response.json();
console.log(data);
``` 