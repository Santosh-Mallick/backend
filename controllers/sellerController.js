const Seller = require('../models/Seller'); // Assuming you have a Seller model
const Product = require('../models/Product'); // Assuming you have a Product model
const cloudinary = require('../config/cloudinary');

// Controller to add a product with image upload to Cloudinary
const addProductWithImage = async (req, res) => {
    try {
        const { name, description, price, category, unit, quantity, pricePerUnitOption } = req.body;
        const sellerId = req.body.seller || '6885b8d5494eb7af762072ff'; // Default seller ID for now

        // Validate required fields
        if (!name || !price || !category || !unit || !quantity) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find the seller by ID
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        let imageUrl = null;

        // Upload image to Cloudinary if provided
        if (req.file) {
            try {
                // Convert buffer to base64
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;

                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'products',
                    resource_type: 'auto',
                    transformation: [
                        { width: 500, height: 500, crop: 'limit' },
                        { quality: 'auto' }
                    ]
                });

                imageUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: 'Failed to upload image' });
            }
        }

        // Create a new product
        const product = new Product({
            name,
            description,
            price: parseFloat(price),
            category,
            seller: sellerId,
            unit,
            quantity: parseInt(quantity, 10),
            image: imageUrl,
            pricePerUnitOption: pricePerUnitOption || unit
        });

        // Save the product to the database
        const savedProduct = await product.save();

        // Link the product to the seller
        seller.products.push(savedProduct._id);
        await seller.save();

        res.status(201).json({ 
            message: 'Product added successfully', 
            product: savedProduct 
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller to add a product and link it with the seller
const addProduct = async (req, res) => {
    try {
        const { sellerId, name, description, price, category, unit, quantity } = req.body;

        // Validate required fields
        if (!sellerId || !name || !price || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find the seller by ID
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Create a new product
        const product = new Product({
            name,
            description,
            price,
            category,
            seller: sellerId,
            unit,
            quantity
        });

        // Save the product to the database
        const savedProduct = await product.save();

        // Link the product to the seller
        seller.products.push(savedProduct._id);
        await seller.save();

        res.status(201).json({ message: 'Product added successfully', product: savedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete product controller
const deleteProduct = async (req, res) => {
    try{
        const { productId } = req.params;

        // Validate product ID
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Remove the product from the seller's products array
        const seller = await Seller.findById(product.seller);
        if (seller) {
            seller.products.pull(productId);
            await seller.save();
        }

        // Delete the product
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Edit product controller
const editProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, category } = req.body;

        // Validate product ID
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;

        // Save the updated product
        const updatedProduct = await product.save();

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all products of a particular seller
const getSellerProducts = async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Validate seller ID
        if (!sellerId) {
            return res.status(400).json({ message: 'Seller ID is required' });
        }

        // Find the seller by ID
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // Find all products for this seller
        const allProducts = await Product.find({ seller: sellerId });

        // Separate products with quantity 0
        const productsWithZeroQuantity = allProducts.filter(product => product.quantity === 0);
        const otherProducts = allProducts.filter(product => product.quantity > 0);

        res.status(200).json({
            message: 'Products retrieved successfully',
            products: {
                available: otherProducts,
                outOfStock: productsWithZeroQuantity
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { addProductWithImage, addProduct, deleteProduct, editProduct, getSellerProducts };