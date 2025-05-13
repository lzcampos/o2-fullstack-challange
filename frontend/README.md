# Stock Management System Frontend

## Overview
This is the frontend application for a stock management system that allows users to track inventory, sales, and product movements through a modern React interface.

## AI-powered Natural Language Interface

This application features an AI-powered chat interface that allows users to interact with the stock management system using everyday language in Portuguese. Users can type queries and commands in a natural way, and the system will interpret them and provide appropriate responses.

### Example Commands:
- "Mostrar vendas totais do mês atual"
- "Quais são os produtos mais vendidos?"
- "Mostrar estoque atual"
- "Registrar entrada de 10 unidades do produto 2"
- "Adicionar saída de 5 itens do produto 3"

### How it Works
The AI interface uses a hybrid approach combining:

1. **Hugging Face LLM Classification**:
   - Utilizes a lightweight text generation model to classify user intent
   - Processes natural language in Portuguese to determine what the user wants
   - Fast and efficient operation with minimal latency

2. **Rule-Based Parameter Extraction**:
   - Extracts specific details like dates, product IDs, and quantities using pattern matching
   - Reliable detection of important parameters regardless of sentence structure
   - Handles time periods like "este mês", "semana atual", etc.

3. **Fallback Mechanism**:
   - Seamlessly falls back to rule-based processing if the LLM service is unavailable
   - Ensures consistent functionality under all conditions

The interface provides rich visualizations of data, including tables and charts, displaying information about sales, inventory, and popular products.

## Features
- Intuitive stock management dashboard
- Real-time inventory tracking
- Sales data visualization
- Product management
- Natural language interface

## Setup & Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production version
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally

## Technologies

- React
- TypeScript
- Material UI
- Vite
- Chart.js
- Axios

## Features

- **Products Management**: Add, edit, and remove products with detailed information
- **Stock Movement Tracking**: Register and track all stock movements (in/out)
- **Dashboard & Analytics**: Visualize your stock data with charts and metrics
- **AI Assistant**: Interact with an AI agent through natural language commands in Portuguese
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI](https://mui.com/)
- [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://github.com/reactchartjs/react-chartjs-2)
- [Axios](https://axios-http.com/) for API requests

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm start
```

The frontend application will be available at http://localhost:3000. It will automatically proxy API requests to the backend server running on port 3000.

### Building for Production

```bash
npm run build
```

This command builds the app for production to the `build` folder.

## Application Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Main application pages
- `src/services/` - API service functions
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/hooks/` - Custom React hooks
- `src/context/` - React context providers

## Main Pages

### Products

Displays a table of all products with filtering, pagination, and CRUD operations.

### Stock Movements

Shows all stock movements with the ability to add new movements and filter existing ones.

### Dashboard

Visual representation of stock data including:
- Current stock value
- Stock movement statistics
- Popular products
- Stock quantity charts

## AI Assistant

The application includes an AI Assistant that can process natural language commands in Brazilian Portuguese. The assistant is available throughout the application as a chat interface.

### Features

- Minimizable chat interface located at the bottom-right corner
- Process natural language commands in Portuguese
- View examples of supported commands
- Query stock data and metrics
- Register stock movements using natural language

### Configuration

The AI Assistant connects to the Agent API, which can be configured in the `.env` file:

```