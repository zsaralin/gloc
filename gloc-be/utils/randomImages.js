const fs = require('fs').promises;
const path = require('path');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // ES6 array destructuring swap
    }
    return array;
}

async function getNameFromJsonFile(filePath) {
    try {
        const fileData = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(fileData);
        return jsonData.name;
    } catch (error) {
        return null; // If there's an error reading or parsing, return null
    }
}

async function readRandomImagesFromFolder(imagesFolder, limit = 100) {
    const imageBuffers = [];

    try {
        // Read all files and subdirectories from the specified directory
        const entries = await fs.readdir(imagesFolder, { withFileTypes: true });

        // Filter and shuffle only directories
        const subfolders = entries.filter(entry => entry.isDirectory());
        const shuffledSubfolders = shuffleArray(subfolders);

        let imageCount = 0; // Counter for the number of images read
        const effectiveLimit = Math.min(shuffledSubfolders.length, limit);

        // Iterate over the shuffled subfolder entries
        for (const folder of shuffledSubfolders) {
            if (imageCount >= effectiveLimit) break;

            const folderName = folder.name;
            const cropImagePath = path.join(imagesFolder, folderName, `${folderName}_crop.png`);
            const jsonFilePath = path.join(imagesFolder, folderName, `${folderName}.json`);

            const name = await getNameFromJsonFile(jsonFilePath) || folderName; // Use JSON name or folder name as fallback

            try {
                // Check if the crop image exists
                await fs.access(cropImagePath);

                const imageBuffer = await fs.readFile(cropImagePath);
                const base64Image = imageBuffer.toString('base64');
                imageBuffers.push({
                    name: name,
                    distance: Math.floor(Math.random() * 21),
                    image: base64Image
                });
                imageCount++;

            } catch (error) {
                console.log(`Crop image not found for ${folderName}: ${error}`);
            }
        }
    } catch (error) {
        console.error(`Error reading images: ${error.message}`);
    }

    return imageBuffers;
}


module.exports = {
    readRandomImagesFromFolder
};

