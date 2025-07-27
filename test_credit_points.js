// Test script to debug credit point calculation
const fetch = require('node-fetch');

async function testCreditPoints() {
  try {
    console.log('Testing credit point calculation...\n');
    
    // Test data - replace with actual product IDs from your database
    const testProducts = [
      {
        productId: "507f1f77bcf86cd799439007", // This should be an eco-friendly product ID
        quantity: 2,
        price: 20
      }
    ];
    
    console.log('Test products:', testProducts);
    
    const response = await fetch('http://localhost:5000/api/buyer/debug-credit-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products: testProducts })
    });
    
    const result = await response.json();
    console.log('\nResponse:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error testing credit points:', error);
  }
}

// Run the test
testCreditPoints(); 