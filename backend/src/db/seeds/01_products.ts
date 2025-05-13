import pkg from 'knex'
const { Knex, knex } = pkg;


export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("products").del();

  // Insert seed entries
  await knex("products").insert([
    {
      name: "Smartphone X",
      description: "Latest model with advanced features",
      price: 79999, // $799.99
      category: "Electronics"
    },
    {
      name: "Laptop Pro",
      description: "High-performance laptop for professionals",
      price: 129999, // $1299.99
      category: "Electronics"
    },
    {
      name: "Wireless Headphones",
      description: "Noise-cancelling wireless headphones",
      price: 14999, // $149.99
      category: "Audio"
    },
    {
      name: "Office Chair",
      description: "Ergonomic office chair with lumbar support",
      price: 24999, // $249.99
      category: "Furniture"
    },
    {
      name: "Coffee Maker",
      description: "Programmable coffee maker with timer",
      price: 8999, // $89.99
      category: "Appliances"
    },
    {
      name: "Desk Lamp",
      description: "LED desk lamp with adjustable brightness",
      price: 3999, // $39.99
      category: "Lighting"
    },
    {
      name: "External SSD",
      description: "1TB external solid state drive",
      price: 17999, // $179.99
      category: "Electronics"
    },
    {
      name: "Bluetooth Speaker",
      description: "Portable waterproof bluetooth speaker",
      price: 7999, // $79.99
      category: "Audio"
    },
    {
      name: "Gaming Mouse",
      description: "High-precision gaming mouse with programmable buttons",
      price: 5999, // $59.99
      category: "Gaming"
    },
    {
      name: "Mechanical Keyboard",
      description: "Tactile mechanical keyboard with RGB lighting",
      price: 12999, // $129.99
      category: "Computing"
    }
  ]);
} 