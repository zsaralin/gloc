const fs = require('fs').promises;
const path = require('path');
const {read} = require("jimp");

async function getOriginalImages(directory) {
    const files = await fs.readdir(directory, { withFileTypes: true });
    const imageFiles = [];

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (file.isDirectory()) {
            const subDirectoryImageFiles = await getOriginalImages(filePath);
            imageFiles.push(...subDirectoryImageFiles);
        } else if (file.isFile() && file.name.endsWith('.png') && !file.name.endsWith('crop.png') && !file.name.endsWith('compressed.png')) {
            console.log(filePath);
            const buffer = await fs.readFile(filePath);
            imageFiles.push({ name: file.name, buffer: buffer.toString('base64'), path: filePath });
        }
    }
    return imageFiles;
}

// async function getOriginalImages(directory) {
//     const files = await fs.readdir(directory, { withFileTypes: true });
//     const imageFiles = [];
//
//     for (const file of files) {
//         const filePath = path.join(directory, file.name);
//
//         if (file.isDirectory()) {
//             const subDirectoryImageFiles = await getOriginalImages(filePath);
//             imageFiles.push(...subDirectoryImageFiles);
//         } else if (file.isFile() && file.name.endsWith('.png') && !file.name.endsWith('crop.png') && !file.name.endsWith('compressed.png')) {
//             console.log(filePath)
//             const buffer = await fs.readFile(filePath);
//             imageFiles.push({ name: file.name, buffer: buffer.toString('base64'), path: filePath });
//         }
//     }
//
//     return imageFiles;
// }

async function saveCroppedImages(croppedImages) {
    try {
        for (const croppedImage of croppedImages) {
            const { originalImagePath, boundingBoxes } = croppedImage;
            const originalFileName = path.basename(originalImagePath);
            const originalDir = path.dirname(originalImagePath);

            for (let i = 0; i < boundingBoxes.length; i++) {
                const boundingBox = boundingBoxes[i];
                const croppedFileName = originalFileName.replace('.png', `_crop.png`);
                const croppedImagePath = path.join(originalDir, croppedFileName);

                // Crop the image based on the bounding box
                await cropImage(originalImagePath, croppedImagePath, boundingBox);

                console.log(`Cropped image saved: ${croppedImagePath}`);
            }
        }
    } catch (error) {
        console.error('Error saving cropped images:', error);
        // Handle error
    }
}

async function cropImage(originalImagePath, croppedImagePath, boundingBox, padding = 150) {
    try {
        // Read the original image using Jimp
        const jimpImage = await read(originalImagePath);

        // Calculate the coordinates for cropping
        const x = Math.max(0, boundingBox.originX - padding);
        const y = Math.max(0, boundingBox.originY - padding);
        const maxWidth = Math.min(jimpImage.bitmap.width - x, boundingBox.width + 2 * padding);
        const maxHeight = Math.min(jimpImage.bitmap.height - y, boundingBox.height + 2 * padding);
        const size = Math.min(maxWidth, maxHeight);

        // Ensure square cropping dimensions
        const cropWidth = size;
        const cropHeight = size;

        // Crop the image
        jimpImage.crop(x, y, cropWidth, cropHeight);

        // Resize the image to half of its size
        const newWidth = Math.floor(cropWidth / 4);
        const newHeight = Math.floor(cropHeight / 4);
        await jimpImage.resize(newWidth, newHeight);

        // Save the cropped image
        await jimpImage.writeAsync(croppedImagePath);

        console.log(`Image cropped and saved to: ${croppedImagePath}`);
    } catch (error) {
        console.error('Error cropping image:', error);
        // Handle error
    }
}


module.exports = { getOriginalImages, saveCroppedImages };
