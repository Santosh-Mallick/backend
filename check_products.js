const mongoose = require('mongoose');
const Product = require('./models/Product');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB using the same approach as the main app
mongoose.connect(process.env.DB_URL)
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Show all products
    const allProducts = await Product.find({});
    console.log(`\nTotal products in database: ${allProducts.length}`);
    
    if (allProducts.length > 0) {
      console.log('\nAll products:');
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - Category: ${product.category} - Eco-friendly: ${product.isEcoFriendly}`);
      });
    }
    
    // Check for disposal plates specifically
    const disposalProducts = await Product.find({ name: { $regex: /disposal/i } });
    console.log(`\nDisposal products found: ${disposalProducts.length}`);
    disposalProducts.forEach(product => {
      console.log(`- ${product.name} (Eco-friendly: ${product.isEcoFriendly})`);
    });
    
    // Check for eco category products
    const ecoProducts = await Product.find({ category: { $regex: /eco/i } });
    console.log(`\nEco category products found: ${ecoProducts.length}`);
    ecoProducts.forEach(product => {
      console.log(`- ${product.name} (Eco-friendly: ${product.isEcoFriendly})`);
    });
    
  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error);
  console.log('Please check:');
  console.log('1. Is MongoDB running?');
  console.log('2. Is the DB_URL environment variable set correctly?');
  console.log('3. Are you in the correct directory?');
}); 