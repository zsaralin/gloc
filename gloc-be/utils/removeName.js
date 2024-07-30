const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputFolder = '../../../face_backet/arg';

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

function processImage(inputPath) {
    if (!fileExists(inputPath)) {
        console.error(`Error: File does not exist: ${inputPath}`);
        return Promise.resolve();
    }

    const outputFolder = path.dirname(inputPath);
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(outputFolder, `${fileName}_crop.jpg`);

    console.log(`Processing: ${inputPath}`);

    return sharp(inputPath)
        .metadata()
        .then(metadata => {
            return sharp(inputPath)
                .raw()
                .toBuffer({ resolveWithObject: true });
        })
        .then(({ data, info }) => {
            const { width, height, channels } = info;
            let cropHeight = height;

            // Function to check if a line is fully red
            const isRedLine = (y) => {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * channels;
                    const red = data[idx];
                    const green = data[idx + 1];
                    const blue = data[idx + 2];
                    if (!(red > 200 && green < 100 && blue < 100)) { // Threshold for red
                        return false;
                    }
                }
                return true;
            };

            // Check for a fully red 5-pixel thick line at the bottom
            let isRedBorder = true;
            for (let y = height - 5; y < height; y++) {
                if (!isRedLine(y)) {
                    isRedBorder = false;
                    break;
                }
            }

            if (isRedBorder) {
                // Move up from the rightmost and leftmost pixels until they are no longer red
                let rightmostY = height - 6;
                let leftmostY = height - 6;

                while (rightmostY >= 0) {
                    const rightmostIdx = (rightmostY * width + (width - 1)) * channels;
                    if (!(data[rightmostIdx] > 200 && data[rightmostIdx + 1] < 100 && data[rightmostIdx + 2] < 100)) { // Found the first non-red pixel
                        break;
                    }
                    rightmostY--;
                }

                while (leftmostY >= 0) {
                    const leftmostIdx = (leftmostY * width) * channels;
                    if (!(data[leftmostIdx] > 200 && data[leftmostIdx + 1] < 100 && data[leftmostIdx + 2] < 100)) { // Found the first non-red pixel
                        break;
                    }
                    leftmostY--;
                }

                // Choose the larger value (closest to the bottom)
                cropHeight = Math.max(rightmostY, leftmostY) + 1;

                // From this point, move inward along the x-axis and downward if necessary
                let finalY = cropHeight - 1;

                for (let x = 0; x < width; x++) {
                    for (let y = cropHeight - 1; y >= 0; y--) {
                        const idx = (y * width + x) * channels;
                        if (!(data[idx] > 200 && data[idx + 1] < 100 && data[idx + 2] < 100)) { // Encounter non-red pixel
                            // Move down until back to red pixels
                            for (let y2 = y; y2 < height; y2++) {
                                const idx2 = (y2 * width + x) * channels;
                                if (data[idx2] > 200 && data[idx2 + 1] < 100 && data[idx2 + 2] < 100) { // Found a red pixel
                                    finalY = Math.max(finalY, y2);
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }

                cropHeight = finalY;
            }

            // Ensure cropHeight is valid
            cropHeight = Math.max(1, Math.min(cropHeight, height));

            // Crop and save the image
            return sharp(inputPath)
                .extract({ left: 0, top: 0, width: width, height: cropHeight })
                .toFile(outputPath);
        })
        .then(() => {
            console.log(`Processed: ${path.basename(inputPath)}`);
            console.log(`Saved as: ${path.basename(outputPath)}`);
        })
        .catch(err => {
            console.error(`Error processing ${path.basename(inputPath)}:`, err);
            // Fallback: save the original image without cropping
            return sharp(inputPath)
                .toFile(outputPath)
                .then(() => {
                    console.log(`Fallback: Saved original image as ${path.basename(outputPath)}`);
                })
                .catch(fallbackErr => {
                    console.error(`Fallback error for ${path.basename(inputPath)}:`, fallbackErr);
                });
        });
}

function processFolder(folderPath) {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const imagePaths = [];

    entries.forEach(entry => {
        if (entry.isDirectory()) {
            const fullPath = path.join(folderPath, entry.name);
            const imagesFolder = path.join(fullPath, 'images');
            const zeroJpgPath = path.join(imagesFolder, '0.jpg');
            if (fileExists(zeroJpgPath)) {
                imagePaths.push(zeroJpgPath);
            }
        }
    });

    return imagePaths;
}

async function main() {
    const imagePaths = processFolder(inputFolder);
    console.log(`Found ${imagePaths.length} images to process.`);

    for (let i = 0; i < imagePaths.length; i++) {
        console.log(`Processing image ${i + 1} of ${imagePaths.length}`);
        await processImage(imagePaths[i]);
    }

    console.log('All images processed.');
}

main().catch(err => console.error('An error occurred:', err));
