const fs = require('fs').promises;
const path = require('path');
const Jimp = require("jimp");

async function getOriginalImages(directory) {
    const files = await fs.readdir(directory, { withFileTypes: true });
    const imageFiles = [];

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (file.isDirectory()) {
            const subDirectoryImageFiles = await getOriginalImages(filePath);
            imageFiles.push(...subDirectoryImageFiles);
        } else if (file.isFile() && file.name.endsWith('.png')) {
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

// async function saveCroppedImages(croppedImages) {
//     try {
//         for (const croppedImage of croppedImages) {
//             const { originalImagePath, boundingBoxes } = croppedImage;
//             const originalFileName = path.basename(originalImagePath);
//             const originalDir = path.dirname(originalImagePath);
//
//             // Skip processing if the filename ends with '_cmp'
//             if (originalFileName.endsWith('_cmp.png') || originalFileName.endsWith('_crop.png')) {
//                 continue;
//             }
//             let croppedFileName;
//
//             // Check if the file already ends with '_cmp.png' to avoid '_cmp_cmp.png'
//             if (originalFileName.endsWith('crop.png')) {
//                 croppedFileName = originalFileName; // Use the original name as it's already marked as compressed
//             } else {
//                 croppedFileName = originalFileName.replace('.png', '_crop.png');
//             }
//             for (let i = 0; i < boundingBoxes.length; i++) {
//                 const boundingBox = boundingBoxes[i];
//
//                 const croppedImagePath = path.join(originalDir, croppedFileName);
//
//                 // Crop the image based on the bounding box and overwrite if exists
//                 await cropImage(originalImagePath, croppedImagePath, boundingBox);
//                 console.log(`Cropped image saved: ${croppedImagePath}`);
//             }
//         }
//     } catch (error) {
//         console.error('Error saving cropped images:', error);
//     }
// }

async function saveCroppedImages(croppedImages) {
    try {
        for (const croppedImage of croppedImages) {
            const { originalImagePath, boundingBoxes } = croppedImage;
            const originalFileName = path.basename(originalImagePath);
            const originalDir = path.dirname(originalImagePath);

            // Skip processing if the filename ends with '_cmp'
            if (originalFileName.endsWith('_cmp.png') || originalFileName.endsWith('_crop.png') || originalFileName.endsWith('crop_padded.png')) {
                continue;
            }
            let croppedFileName;

            croppedFileName = originalFileName.replace('.png', '_crop_padded.png');
            for (let i = 0; i < boundingBoxes.length; i++) {
                const boundingBox = boundingBoxes[i];

                const croppedImagePath = path.join(originalDir, croppedFileName);

                // Crop the image based on the bounding box and overwrite if exists
                await cropImage(originalImagePath, croppedImagePath, boundingBox);
                console.log(`Cropped image saved: ${croppedImagePath}`);
            }
        }
    } catch (error) {
        console.error('Error saving cropped images:', error);
    }
}

// async function cropImage(originalImagePath, croppedImagePath, boundingBox, padding = 150) {
//     try {
//         // Read the original image using Jimp
//         const jimpImage = await Jimp.read(originalImagePath);
//
//         // Calculate padded bounding box
//         let x = boundingBox.originX - padding;
//         let y = boundingBox.originY - padding;
//         let width = boundingBox.width + 2 * padding;
//         let height = boundingBox.height + 2 * padding;
//
//         // Clamp the coordinates and dimensions to ensure they stay within the image boundaries
//         x = Math.max(0, x);
//         y = Math.max(0, y);
//         width = Math.min(width, jimpImage.bitmap.width - x);
//         height = Math.min(height, jimpImage.bitmap.height - y);
//
//         // Center the crop around the bounding box by adjusting the start point (x, y)
//         if (width !== height) {
//             if (width > height) {
//                 let excess = width - height;
//                 x += Math.floor(excess / 2);
//                 width = height; // Make the dimensions equal to form a square
//             } else {
//                 let excess = height - width;
//                 y += Math.floor(excess / 2);
//                 height = width; // Make the dimensions equal to form a square
//             }
//         }
//
//         // Crop the image
//         jimpImage.crop(x, y, width, height);
//
//         // Optionally resize the image to half of its cropped size
//         const newWidth = Math.floor(width / 2);
//         const newHeight = Math.floor(height / 2);
//         await jimpImage.resize(newWidth, newHeight);
//
//         // Save the cropped image
//         await jimpImage.writeAsync(croppedImagePath);
//
//         console.log(`Image cropped and saved to: ${croppedImagePath}`);
//     } catch (error) {
//         console.error('Error cropping image:', error);
//     }
// }
async function cropImage(originalImagePath, croppedImagePath, boundingBox, padding = 400) {
    try {
        const jimpImage = await Jimp.read(originalImagePath);

        // Desired dimensions of the output image
        const outputWidth = boundingBox.width + 2 * padding;
        const outputHeight = boundingBox.height + 2 * padding;

        // Create an output image filled with black
        const outputImage = new Jimp(outputWidth, outputHeight, 0x000000FF);

        // Calculate source coordinates to center the bounding box
        const srcX = Math.max(0, boundingBox.originX - padding);
        const srcY = Math.max(0, boundingBox.originY - padding);
        let srcWidth = boundingBox.width + 2 * padding;
        let srcHeight = boundingBox.height + 2 * padding;

        // Ensure the cropping area does not exceed original image boundaries
        srcWidth = srcX + srcWidth > jimpImage.bitmap.width ? jimpImage.bitmap.width - srcX : srcWidth;
        srcHeight = srcY + srcHeight > jimpImage.bitmap.height ? jimpImage.bitmap.height - srcY : srcHeight;

        // Crop the original image as needed
        const croppedOriginal = await jimpImage.clone().crop(srcX, srcY, srcWidth, srcHeight);

        // Calculate the destination coordinates to ensure the cropped area is centered
        const destX = (outputWidth - srcWidth) / 2;
        const destY = (outputHeight - srcHeight) / 2;

        // Composite the cropped image onto the output image
        outputImage.composite(croppedOriginal, destX, destY);
// Optionally resize the image to reduce size and save space
        const resizedWidth = Math.floor(outputWidth / 2);
        const resizedHeight = Math.floor(outputHeight / 2);
        await outputImage.resize(resizedWidth, resizedHeight);
        // Save the modified image
        await outputImage.writeAsync(croppedImagePath);

        console.log(`Image cropped and saved to: ${croppedImagePath}`);
    } catch (error) {
        console.error('Error cropping image:', error);
    }
}
module.exports = { getOriginalImages, saveCroppedImages };
