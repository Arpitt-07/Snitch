// src/lib/cartPricing.js
import { Cart } from "@/models/cart.model.js";

export async function buildCartResponse(cart, owner) {
    if (!cart || cart.items.length === 0) {
        return { items: [], total: 0 };
    }

    const [cartDetails] = await Cart.aggregate([
        { $match: { _id: cart._id } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                matchedVariant: {
                    $first: {
                        $filter: {
                            input: { $ifNull: ["$product.variants", []] },
                            as: "variant",
                            cond: { $eq: ["$$variant._id", "$items.variantId"] }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                matchedSize: {
                    $first: {
                        $filter: {
                            input: { $ifNull: ["$matchedVariant.sizes", []] },
                            as: "sizeObj",
                            cond: { $eq: ["$$sizeObj.size", "$items.size"] }
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                enrichedData: {
                    $push: {
                        item: "$items",
                        product: "$product",
                        variant: "$matchedVariant",
                        sizeEntry: "$matchedSize"
                    }
                }
            }
        }
    ]);

    if (!cartDetails) return { items: [], total: 0 };

    const enriched = [];
    let total = 0;
    let itemsChanged = false;

    for (const data of cartDetails.enrichedData) {
        const { item, product, variant, sizeEntry } = data;

        if (!product || !product.isPublished) { itemsChanged = true; continue; }
        if (!variant) { itemsChanged = true; continue; }
        if (!sizeEntry) { itemsChanged = true; continue; }

        const availableQty = Math.min(item.quantity, sizeEntry.stock);
        if (availableQty <= 0) { itemsChanged = true; continue; }

        if (availableQty !== item.quantity) {
            const docItem = cart.items.id(item._id);
            if (docItem) docItem.quantity = availableQty;
            item.quantity = availableQty;
            itemsChanged = true;
        }

        const unitPrice = sizeEntry.priceOverride ?? product.basePrice;
        const lineTotal = unitPrice * item.quantity;
        total += lineTotal;

        enriched.push({
            _id: item._id,
            productId: product._id,
            variantId: item.variantId, // needed by Order creation — wasn't in the original, added here
            slug: product.slug,
            title: product.title,
            image: variant.images?.[0]?.url || null,
            color: variant.color,
            size: item.size,
            quantity: item.quantity,
            unitPrice,
            lineTotal,
        });
    }

    if (itemsChanged) {
        cart.items = cart.items.filter((item) =>
            enriched.some((e) => e._id.toString() === item._id.toString())
        );
        if (owner.type === "guest") {
            cart.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
        await cart.save();
    }

    return { items: enriched, total };
}