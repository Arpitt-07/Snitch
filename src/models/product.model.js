import mongoose from "mongoose";
import slugify from "slugify";

const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    stock: {
        type: Number,
        required: true,
        min: [0, "Stock cannot be negative"],
        default: 0
    },
    priceOverride: {
        type: Number,
        min: [0, "Price cannot be negative"],
        default: null
    }
},
    { _id:false }
);

const variantSchema = new mongoose.Schema({
    color: {
        type: String,
        required: true,
        trim: true
    },
    colorCode: {
        type: String,
        match: [/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code"]
    },
    images: {
        type: [{
            url: { type: String, required: true },
            fileId: { type: String, required: true }
        }],
        required: true,
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0,
            message: "Each variant needs at least one image"
        }
    },
    sizes: {
        type: [sizeSchema],
        required: true,
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0,
            message: "At least one size is required per variant"
        }
    }
});

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"]
    },
    discountPrice: {
        type: Number,
        min: [0, "Discount price cannot be negative"],
        validate: {
            validator: function (val) {
                return val == null || val <= this.basePrice;
            },
            message: "Discount price must be less than or equal to base price"
        }
    },
    department: {
        type: String,
        enum: ['Menswear', 'Womenswear', 'Accessories'],
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    tags: {
        type: [String],
        default: []
    },
    variants: {
        type: [variantSchema],
        required: true,
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0,
            message: "Product must have at least one variant"
        }
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false,
        index: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, { timestamps: true });

productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ department: 1, category: 1 });

productSchema.pre("validate", function () {
    if (this.title && !this.slug) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);