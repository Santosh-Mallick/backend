const express = require('express');
const router = express.Router();
const { addProductWithImage, addProduct, deleteProduct, editProduct, getSellerProducts } = require('../controllers/sellerController');
const upload = require('../middleware/upload');

// Route to add a product with image upload
router.post('/add-product', upload.single('image'), addProductWithImage);

// Route to add a product without image (legacy)
router.post('/add-product-no-image', addProduct);

// Route to delete a product
router.delete('/delete-product/:productId', deleteProduct);

// Route to edit a product
router.put('/edit-product/:productId', editProduct);

// Route to get all products of a seller
router.get('/seller-products/:sellerId', getSellerProducts);

module.exports = router; 