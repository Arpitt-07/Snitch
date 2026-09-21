import ImageKit, { toFile } from '@imagekit/nodejs';
import sharp from 'sharp';
import path from 'path';
import { ApiError } from '@/lib/ApiError.js';

const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadImage(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new ApiError(400, "Only JPEG, PNG, and WebP images are allowed");
    }
    if (file.size > MAX_SIZE) {
        throw new ApiError(400, "Image must be under 10MB");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const processedBuffer = await sharp(buffer)
        .webp({ quality: 88 })
        .toBuffer();

    const originalExt = path.extname(file.name);
    const filename = file.name.replace(originalExt, '.webp');

    const result = await imageKit.files.upload({
        file: await toFile(processedBuffer, filename),
        fileName: filename,
        folder: "snitch"
    });
    return { url: result.url, fileId: result.fileId };
}

export async function deleteImageFromImageKit(fileId) {
    try {
        await imageKit.files.delete(fileId);
    } catch (error) {
        console.error("Error deleting image from ImageKit:", error);
    }
}