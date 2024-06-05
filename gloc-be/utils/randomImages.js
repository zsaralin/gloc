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
        const entries = await fs.readdir(imagesFolder, { withFileTypes: true });
        const subfolders = entries.filter(entry => entry.isDirectory());
        const shuffledSubfolders = shuffleArray(subfolders).slice(0, limit);  // Shuffle and limit early

        const imagePromises = shuffledSubfolders.map(async folder => {
            const folderName = folder.name;
            const cropImagePath = path.join(imagesFolder, folderName, `${folderName}_cmp.png`);
            try {
                const imageBuffer = await fs.readFile(cropImagePath);
                const jsonFilePath = path.join(imagesFolder, folderName, `${folderName}.json`);
                const name = await getNameFromJsonFile(jsonFilePath) || folderName;

                return {
                    name: name,
                    distance: Math.floor(Math.random()),
                    image: imageBuffer.toString('base64')
                };
            } catch (error) {
                console.log(`Failed to process ${folderName}: ${error}`);
            }
        });

        const results = await Promise.all(imagePromises);
        imageBuffers.push(...results.filter(result => result));
    } catch (error) {
        console.error(`Error reading images: ${error.message}`);
    }

    return imageBuffers;
}


module.exports = {
    readRandomImagesFromFolder
};

