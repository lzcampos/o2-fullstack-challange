#!/usr/bin/env node

const http = require('http');

// Sample queries to test
const queries = [
  //'Mostrar vendas totais do mês de maio de 2025'
  'Registrar entrada de 10 unidades do produto 19'
];

// Select a query (default to first one)
const queryIndex = process.argv[2] ? parseInt(process.argv[2], 10) : 0;
const query = queries[queryIndex] || queries[0];

console.log(`Testing agent with query: "${query}"`);

// Request options
const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/api/query',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Request body
const data = JSON.stringify({
  query: query
});

// Make the request
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(responseData);
      console.log('\n===== Response =====');
      console.log(`Action: ${parsedData.action || 'N/A'}`);
      console.log('\n--- Response Text ---');
      console.log(parsedData.response);
      
      if (parsedData.data) {
        console.log('\n--- Data ---');
        console.log(JSON.stringify(parsedData.data, null, 2));
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error.message);
});

// Write request body
req.write(data);
req.end();

console.log('Request sent, waiting for response...'); 