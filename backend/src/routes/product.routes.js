import { Router } from "express";
import multer from 'multer';
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import { createProduct, getProducts } from "../controllers/product.controller.js";
import { productSchema } from "../utils/validator.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const productRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(), limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"), false);
        }
    }
});


productRouter.post("/create-product", verifyAdmin, upload.array("images", 5), validateRequest(productSchema), createProduct);
productRouter.get("/get-products", verifyAdmin, getProducts)



export default productRouter;