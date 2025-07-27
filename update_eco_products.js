const mongoose = require('mongoose');
const Product = require('./models/Product');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB using the same approach as the main app
mongoose.connect(process.env.DB_URL)
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find and update organic disposal plates to be eco-friendly
    const result = await Product.updateMany(
      { 
        name: { $regex: /organic.*disposal.*plates/i } 
      },
      { 
        $set: { isEcoFriendly: true } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} organic disposal plates products to be eco-friendly`);
    
    // Also update any disposal plates that might be eco-friendly
    const ecoResult = await Product.updateMany(
      { 
        name: { $regex: /disposal.*plates/i },
        category: { $regex: /eco/i }
      },
      { 
        $set: { isEcoFriendly: true } 
      }
    );
    
    console.log(`Updated ${ecoResult.modifiedCount} eco disposal plates products to be eco-friendly`);
    
    // Show all disposal plates products
    const disposalProducts = await Product.find({ name: { $regex: /disposal/i } });
    console.log('\nAll disposal plates products:');
    disposalProducts.forEach(product => {
      console.log(`- ${product.name} (Eco-friendly: ${product.isEcoFriendly})`);
    });
    
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error);
  console.log('Please check:');
  console.log('1. Is MongoDB running?');
  console.log('2. Is the DB_URL environment variable set correctly?');
  console.log('3. Are you in the correct directory?');
}); 