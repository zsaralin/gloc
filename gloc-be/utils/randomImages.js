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
        // Read all directory entries
        const entries = await fs.readdir(imagesFolder, {withFileTypes: true});

        // Prepare to select subfolders randomly using reservoir sampling
        let selectedFolders = [];
        let i = 0; // Counter for total directories inspected

        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (i < limit) {
                    selectedFolders.push(entry);
                } else {
                    const j = Math.floor(Math.random() * (i + 1));
                    if (j < limit) {
                        selectedFolders[j] = entry;
                    }
                }
                i++;
            }
        }

        // Process each selected folder
        for (const folder of selectedFolders) {
            const folderName = folder.name;
            const cropImagePath = path.join(imagesFolder, folderName, `${folderName}_cmp.png`);
            const jsonFilePath = path.join(imagesFolder, folderName, `${folderName}.json`);

            try {
                // Check if the crop image exists
                await fs.access(cropImagePath);

                // Read image file
                const imageBuffer = await fs.readFile(cropImagePath);
                const base64Image = imageBuffer.toString('base64');

                // Read JSON data
                const name = await getNameFromJsonFile(jsonFilePath) || folderName;

                // Push to imageBuffers with random distance
                imageBuffers.push({
                    name: name,
                    distance: Math.floor(Math.random() * 21),
                    image: base64Image
                });
            } catch (error) {
                console.log(`Failed to process ${folderName}: ${error}`);
            }
        }
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
    }

    return imageBuffers;
}

module.exports = {
    readRandomImagesFromFolder
};

