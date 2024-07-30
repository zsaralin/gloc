const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const inputFolder = path.resolve(__dirname, '../../../face_backet/arg');
const MAX_WIDTH = 8000; // Set a maximum width for resizing
const MAX_HEIGHT = 8000; // Set a maximum height for resizing

// Function to check if a color is a bright red
function isBrightRed(r, g, b, a) {
    return r > 200 && g < 50 && b < 50 && a === 255;
}

// Function to process a single image
async function processImage(imagePath) {
    try {
        // Load the image
        let image = await Jimp.read(imagePath);
        const { width, height } = image.bitmap;

        // Resize the image if it exceeds the max resolution
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            image = image.resize(MAX_WIDTH, Jimp.AUTO);
        }

        const startRow = Math.max(0, height - 10); // Start from the 10th row from the bottom or the top if the image is smaller

        for (let y = height - 1; y >= startRow; y--) {
            let isAllBrightRed = true;
            for (let x = 0; x < width/5; x++) {
                const color = image.getPixelColor(x, y);
                const { r, g, b, a } = Jimp.intToRGBA(color);
                if (!isBrightRed(r, g, b, a)) {
                    isAllBrightRed = false;
                    break;
                }
            }
            if (isAllBrightRed) {
                return true; // Found a bright red line
            }
        }

        return false; // No bright red line found in the bottom 10 rows
    } catch (error) {
        console.error('Error processing the image:', error);
        return false;
    }
}

// Function to process all folders in the arg directory
async function processAllFolders() {
    let count = 0;
    let foldersWithRedLine = [];

    try {
        const subfolders = fs.readdirSync(inputFolder);

        for (const subfolder of subfolders) {
            console.log(subfolder)
            const imagesFolder = path.join(inputFolder, subfolder, 'images');
            const imagePath = path.join(imagesFolder, '0.jpg');

            // Check if the images folder and image exist
            if (fs.existsSync(imagesFolder) && fs.existsSync(imagePath)) {
                const hasRedLine = await processImage(imagePath);
                if (hasRedLine) {
                    count++;
                    foldersWithRedLine.push(subfolder);
                }
            }
        }

        console.log(`Total images with a bright red line: ${count}`);
        if (foldersWithRedLine.length > 0) {
            console.log('Subfolders with bright red line:');
            foldersWithRedLine.forEach(folder => console.log(folder));
        }
    } catch (error) {
        console.error('Error processing folders:', error);
    }
}

// Start processing
processAllFolders();
