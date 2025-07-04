import {sql} from '../config/db.js';

export const getProducts = async (req, res) => {
    try {
        const products = await sql`
            SELECT * FROM products 
            ORDER BY created_at DESC
        `;

        console.log("Products fetched successfully", products);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error fetching getProducts controller", error);
        res.status(500).json({ success: false, message: "Internal Server Errror" });
    }
};

export const createProduct = async (req, res) => {
    const { name, price, image } = req.body;

    if (!name || !price || !image) {
        return res.status(400).json({success: false, message: "Please provide all required fields"});
    }

    try {
        const newProduct = await sql`
            INSERT INTO products (name,price,image) 
            VALUES (${name}, ${price}, ${image})
            RETURNING *
        `;
        
        res.status(201).json({ success: true, data: newProduct[0] });
        
    } catch (error) {
        console.error("Error in createProduct controller", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getProduct = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    try {
        
        const product = await sql`
            SELECT * FROM products WHERE id = ${id}
        `;

        res.status(200).json({ success: true, data: product[0] });

    } catch (error) {
        console.error("Error in getProduct controller", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, image } = req.body;

    try {
        const updatedProduct = await sql`
            UPDATE products 
            SET name = ${name}, price = ${price}, image = ${image}
            WHERE id = ${id}
            RETURNING *
        `;

        if (updatedProduct.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(201).json({ success: true, data: updatedProduct[0] });

    } catch (error) {
        console.error("Error in updateProduct controller", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    try {
        const deletedProduct = await sql`
            DELETE FROM products WHERE id = ${id} 
            RETURNING *
        `;

        if (deletedProduct.length === 0) {
            return res.status(404).json({
                success: false,
                data: deletedProduct[0],
                message: "Product not found"
            });
        }
        
        res.status(200).json({ success: true, data: deletedProduct[0] });
    } catch (error) {
        console.error("Error in deleteProduct controller", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};