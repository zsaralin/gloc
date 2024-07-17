const fs = require('fs').promises;
const path = require('path');

const baseDir = path.resolve(__dirname, '../../../face_backet/arg');

async function updateJsonWithNumRecords() {
    try {
        const subfolders = await fs.readdir(baseDir, { withFileTypes: true });

        for (const subfolder of subfolders) {
            if (subfolder.isDirectory()) {
                const subfolderPath = path.join(baseDir, subfolder.name);
                const imagesFolderPath = path.join(subfolderPath, 'images');
                const jsonFilePath = path.join(subfolderPath, `${subfolder.name}.json`);

                try {
                    const imageFiles = await fs.readdir(imagesFolderPath);
                    const numRecords = imageFiles.length;

                    const jsonData = await fs.readFile(jsonFilePath, 'utf8');
                    const jsonObj = JSON.parse(jsonData);

                    jsonObj.numRecords = numRecords;

                    await fs.writeFile(jsonFilePath, JSON.stringify(jsonObj, null, 2));
                    console.log(`Updated ${jsonFilePath} with numRecords: ${numRecords}`);
                } catch (error) {
                    console.error(`Error processing ${subfolder.name}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error reading base directory:', error);
    }
}

updateJsonWithNumRecords();