import pkg from 'knex'
const { Knex, knex } = pkg;


export async function seed(knex: typeofKnex): Promise<void> {
  // Deletes ALL existing entries
  await knex("stock_movements").del();
  await knex("stock").del();

  // Get product IDs
  const products = await knex("products").select("id");
  
  const movements = [];
  const now = new Date();
  
  // Create movements for each product
  for (const product of products) {
    // Initial stock (in)
    const initialStock = Math.floor(Math.random() * 50) + 10; // Random between 10-60
    movements.push({
      product_id: product.id,
      quantity: initialStock,
      movement_type: 'in',
      movement_date: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)), // 30 days ago
      notes: 'Initial inventory'
    });
    
    // Additional restocks (in)
    const restock1 = Math.floor(Math.random() * 30) + 5; // Random between 5-35
    movements.push({
      product_id: product.id,
      quantity: restock1,
      movement_type: 'in',
      movement_date: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)), // 15 days ago
      notes: 'Restock'
    });
    
    // Sales (out)
    const sales1 = Math.floor(Math.random() * 20) + 1; // Random between 1-20
    movements.push({
      product_id: product.id,
      quantity: sales1,
      movement_type: 'out',
      movement_date: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)), // 10 days ago
      notes: 'Sales'
    });
    
    // More sales (out)
    const sales2 = Math.floor(Math.random() * 15) + 1; // Random between 1-15
    movements.push({
      product_id: product.id,
      quantity: sales2,
      movement_type: 'out',
      movement_date: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)), // 5 days ago
      notes: 'Sales'
    });
    
    // Recent restock (in)
    const restock2 = Math.floor(Math.random() * 20) + 10; // Random between 10-30
    movements.push({
      product_id: product.id,
      quantity: restock2,
      movement_type: 'in',
      movement_date: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)), // 2 days ago
      notes: 'Recent restock'
    });
  }
  
  // Insert all movements - they will automatically update the stock table via triggers
  await knex("stock_movements").insert(movements);
} 