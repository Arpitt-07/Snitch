import ImageKit, { toFile } from '@imagekit/nodejs';
import { config } from '../config.js';

const imageKit = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY
});

export async function uploadImage(file) {
    const filename = file.originalname;
    
    // We must await toFile to convert the buffer properly
    const imageFile = await toFile(file.buffer, filename);

    const result = await imageKit.files.upload({
        file: imageFile, 
        fileName: filename,
        folder: "snitch"
    });
    
    return result;
}
