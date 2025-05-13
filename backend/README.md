# Stock Management System API

Backend API for managing product stock and inventory movements.

## Features

- Product management (CRUD operations)
- Stock movement tracking (entries and exits)
- Dashboard metrics and reports
- Database automation with migrations and seeds

## Tech Stack

- Node.js + Express.js
- TypeScript
- PostgreSQL database
- Knex.js for query building and migrations
- Docker for containerization

## Prerequisites

- Node.js (v14+)
- Docker and Docker Compose
- npm or yarn

## Getting Started

### Installation

1. Clone the repository
2. Navigate to the backend directory:
```bash
cd backend
```
3. Install dependencies:
```bash
npm install
```

### Running the Database

Start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

This will start a PostgreSQL instance and automatically run the initialization scripts.

### Environment Variables

Copy the `.env.example` file to create your own `.env` file:

```bash
cp .env.example .env
```

Modify the values in the `.env` file if needed.

### Running the Application

Development mode with hot reloading:

```bash
npm run dev
```

Or build and run in production mode:

```bash
npm run build
npm start
```

## API Endpoints

### Products

- `GET /api/products` - Get all products with pagination and filters
- `GET /api/products/:id` - Get a single product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product
- `GET /api/products/categories/all` - Get all product categories

### Stock Movements

- `GET /api/stock-movements` - Get all stock movements with pagination and filters
- `POST /api/stock-movements` - Create a new stock movement
- `GET /api/stock-movements/popular` - Get popular products based on movement data

### Metrics

- `GET /api/metrics/current-stock` - Get current stock values and totals
- `GET /api/metrics/stock-movements` - Get stock movement summary for a period
- `GET /api/metrics/summary` - Get overall stock summary metrics

## Database Schema

The application uses the following main tables:

- `products` - Stores product information
- `stock` - Tracks current quantity for each product
- `stock_movements` - Records all inventory movements (in/out)

## Price Handling

This system stores product prices as **integers in cents** rather than floating-point numbers:

- In the database, a price of `$19.99` is stored as the integer `1999`
- This prevents floating-point precision issues common when dealing with currency values
- The backend automatically converts input prices in dollars to cents for storage
- All calculations are performed using the integer values, ensuring numerical accuracy
- For more details on this approach, see the [PRICE_HANDLING.md](../PRICE_HANDLING.md) document
