const fs = require('fs').promises;
const path = require('path');
const Jimp = require("jimp");

async function saveCmpImages(imagePaths) {
    try {
        for (const imagePath of imagePaths) {
            const origImagePath = imagePath.originalImagePath

            if (origImagePath.endsWith('_crop.png')) {
                continue;
            }
            const originalFileName = path.basename(origImagePath);
            let compressedFileName;

            // Check if the file already ends with '_cmp.png' to avoid '_cmp_cmp.png'
            if (originalFileName.endsWith('_cmp.png')) {
                compressedFileName = originalFileName; // Use the original name as it's already marked as compressed
            } else {
                compressedFileName = originalFileName.replace('.png', '_cmp.png');
            }
            const originalDir = path.dirname(origImagePath);
            const compressedImagePath = path.join(originalDir, compressedFileName);

            // Read the original image using Jimp
            const image = await Jimp.read(origImagePath);

            // Reduce the image size by 50%
            const newWidth = Math.floor(image.bitmap.width / 2);
            const newHeight = Math.floor(image.bitmap.height / 2);
            await image.resize(newWidth, newHeight);

            // Save the compressed image
            await image.writeAsync(compressedImagePath);

            console.log(`Compressed image saved: ${compressedImagePath}`);
        }
    } catch (error) {
        console.error('Error compressing images:', error);
    }
}

module.exports = { saveCmpImages };

