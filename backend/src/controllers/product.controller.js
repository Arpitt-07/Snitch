import { Product } from "../models/product.model.js";
import { uploadImage } from "../utils/uploadImage.js";


export const createProduct = async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const images = req.files;

        const uploadedImages = await Promise.all(images.map(image => uploadImage(image)));
        const imageUrls = uploadedImages.map(result => result.url);

        const product = await Product.create({
            title,
            description,
            price,
            images: imageUrls,
            owner: req.user._id
        });
        return res.status(201).json({ success: true, product });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}

export const getProducts = async (req, res) => {
    try {
        const admin = req.user._id
        if (!admin) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const products = await Product.find({ owner: admin });
        return res.status(200).json({ success: true, products });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}