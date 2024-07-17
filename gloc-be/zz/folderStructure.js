const fs = require('fs').promises;
const path = require('path');

const sourceDir = path.join(__dirname, '../../../face_backet/arg');

async function renameFilesInDir(dirPath) {
    try {
        const subfolders = await fs.readdir(dirPath, { withFileTypes: true });

        for (const subfolder of subfolders) {
            if (subfolder.isDirectory()) {
                const subfolderPath = path.join(dirPath, subfolder.name, 'images');
                const files = await fs.readdir(subfolderPath);

                let index = 0;
                for (const file of files) {
                    const oldFilePath = path.join(subfolderPath, file);
                    const fileExtension = path.extname(file);
                    const newFilePath = path.join(subfolderPath, `${index}${fileExtension}`);

                    try {
                        await fs.rename(oldFilePath, newFilePath);
                        console.log(`Renamed ${oldFilePath} to ${newFilePath}`);
                        index++;
                    } catch (error) {
                        console.error(`Error renaming file ${oldFilePath}:`, error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error reading source directory:', error);
    }
}

// Run the function
renameFilesInDir(sourceDir);
