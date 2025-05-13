import pkg from 'knex';
const {knex, Knex} = pkg;

export async function up(knex: Knex): Promise<void> {
  // Create products table
  await knex.schema.createTable("products", (table: any) => {
    table.increments("id").primary();
    table.string("name", 255).notNullable();
    table.text("description").nullable();
    table.integer("price").notNullable(); // Price in cents (e.g., 1999 = $19.99)
    table.string("category", 100).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Create stock table
  await knex.schema.createTable("stock", (table: any) => {
    table.increments("id").primary();
    table.integer("product_id").unsigned().notNullable();
    table.integer("quantity").defaultTo(0).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    table.foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
    
    table.unique(["product_id"]);
  });

  // Create stock_movements table
  await knex.schema.createTable("stock_movements", (table: any) => {
    table.increments("id").primary();
    table.integer("product_id").unsigned().notNullable();
    table.integer("quantity").notNullable();
    table.enum("movement_type", ["in", "out"]).notNullable();
    table.timestamp("movement_date").defaultTo(knex.fn.now());
    table.text("notes").nullable();
    
    table.foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
  });

  // Create function and trigger to update stock on movement
  await knex.raw(`
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
        VALUES (NEW.product_id, 0, CURRENT_TIMESTAMP)
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

    CREATE TRIGGER stock_movement_trigger
    AFTER INSERT ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_quantity();

    CREATE OR REPLACE FUNCTION update_products_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_products_timestamp_trigger
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_timestamp();
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop triggers first
  await knex.raw(`
    DROP TRIGGER IF EXISTS stock_movement_trigger ON stock_movements;
    DROP FUNCTION IF EXISTS update_stock_quantity();
    DROP TRIGGER IF EXISTS update_products_timestamp_trigger ON products;
    DROP FUNCTION IF EXISTS update_products_timestamp();
  `);
  
  // Drop tables
  await knex.schema.dropTableIfExists("stock_movements");
  await knex.schema.dropTableIfExists("stock");
  await knex.schema.dropTableIfExists("products");
} 