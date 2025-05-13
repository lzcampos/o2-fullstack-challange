-- Create tables

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents (e.g., 1999 = $19.99)
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock table to track current quantity
CREATE TABLE IF NOT EXISTS stock (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_product UNIQUE (product_id)
);

-- Stock movement table to track all inventory movements
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('in', 'out')),
  movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Create functions and triggers

-- Function to update stock quantity when movements occur
CREATE OR REPLACE FUNCTION update_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'in' THEN
    INSERT INTO stock (product_id, quantity, updated_at)
    VALUES (NEW.product_id, NEW.quantity, CURRENT_TIMESTAMP)
    ON CONFLICT (product_id) 
    DO UPDATE SET 
      quantity = stock.quantity + NEW.quantity,
      updated_at = CURRENT_TIMESTAMP;
  ELSIF NEW.movement_type = 'out' THEN
    INSERT INTO stock (product_id, quantity, updated_at)
    VALUES (NEW.product_id, -NEW.quantity, CURRENT_TIMESTAMP)
    ON CONFLICT (product_id) 
    DO UPDATE SET 
      quantity = stock.quantity - NEW.quantity,
      updated_at = CURRENT_TIMESTAMP;
      
    -- Check if we have enough stock
    IF (SELECT quantity FROM stock WHERE product_id = NEW.product_id) < 0 THEN
      RAISE EXCEPTION 'Not enough stock for product with ID %', NEW.product_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock table when movements are inserted
CREATE TRIGGER stock_movement_trigger
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_stock_quantity();

-- Function to update products timestamp
CREATE OR REPLACE FUNCTION update_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update products timestamp on update
CREATE TRIGGER update_products_timestamp_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_timestamp(); 