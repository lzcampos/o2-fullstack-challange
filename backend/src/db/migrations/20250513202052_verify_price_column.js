/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if the price column exists and get its data type
  const columnInfo = await knex.raw(`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  `);
  
  const priceColumnType = columnInfo.rows[0]?.data_type;
  console.log(`Current price column type: ${priceColumnType}`);
  
  // If the column is not an integer, convert it
  if (priceColumnType && priceColumnType !== 'integer') {
    console.log('Converting price column from decimal to integer...');
    
    // First, convert existing prices from dollars to cents
    await knex.raw(`
      UPDATE products 
      SET price = ROUND(price * 100)
    `);
    
    // Then alter the column type from decimal/numeric to integer
    await knex.schema.alterTable("products", (table) => {
      table.integer("price").notNullable().alter();
    });
    
    console.log('Price column converted to integer (cents) successfully');
  } else if (priceColumnType === 'integer') {
    console.log('Price column is already integer type, no conversion needed');
  } else {
    console.log('Products table or price column not found');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Check if the price column exists and get its data type
  const columnInfo = await knex.raw(`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  `);
  
  const priceColumnType = columnInfo.rows[0]?.data_type;
  
  // If the column is an integer, convert it back to decimal
  if (priceColumnType === 'integer') {
    // First alter the column type from integer to decimal
    await knex.schema.alterTable("products", (table) => {
      table.decimal("price", 10, 2).notNullable().alter();
    });
    
    // Then convert prices back from cents to dollars
    await knex.raw(`
      UPDATE products 
      SET price = price / 100.0
    `);
  }
};
