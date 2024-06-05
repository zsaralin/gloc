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

async function readRandomImagesFromFolder(imagesFolder, limit = 42) {
    const imageBuffers = [];
    const startTime = performance.now();  // Start timing for the whole function

    try {
        const dirStartTime = performance.now();
        const dir = await fs.opendir(imagesFolder);
        let selectedFolders = [];
        let totalCount = 0;

        for await (const entry of dir) {
            if (entry.isDirectory()) {
                totalCount++;
                // Apply reservoir sampling logic
                if (selectedFolders.length < limit) {
                    selectedFolders.push(entry);
                } else {
                    const j = Math.floor(Math.random() * totalCount);
                    if (j < limit) {
                        selectedFolders[j] = entry;
                    }
                }
            }
        }
        const dirEndTime = performance.now();
        console.log(`Directory reading and sampling time: ${dirEndTime - dirStartTime}ms`);

        const processingStartTime = performance.now();
        // Process each selected folder
        for (const folder of selectedFolders) {
            const folderName = folder.name;
            const cropImagePath = path.join(imagesFolder, folderName, `${folderName}_cmp.png`);
            const jsonFilePath = path.join(imagesFolder, folderName, `${folderName}.json`);

            try {
                const fileOperationStartTime = performance.now();

                // Check if the crop image exists
                await fs.access(cropImagePath);

                // Read image file
                const imageBuffer = await fs.readFile(cropImagePath);

                // Read JSON data
                const name = await getNameFromJsonFile(jsonFilePath) || folderName;

                // Push to imageBuffers with random distance
                imageBuffers.push({
                    name: name,
                    distance: Math.floor(Math.random() * 21),
                    image: imageBuffer.toString('base64')
                });
            } catch (error) {
                console.log(`Failed to process ${folderName}: ${error}`);
            }
        }
        const processingEndTime = performance.now();
        console.log(`Processing all selected folders time: ${processingEndTime - processingStartTime}ms`);
    } catch (error) {
        console.error(`Error reading directory: ${error.message}`);
    }

    const endTime = performance.now();  // End timing for the whole function
    console.log(`Total function execution time: ${endTime - startTime}ms`);
    return imageBuffers;
}
module.exports = {
    readRandomImagesFromFolder
};

