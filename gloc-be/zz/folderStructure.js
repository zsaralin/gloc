const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directory to start searching from
const baseDir = path.join(__dirname, '../../../face_backet', 'arg');

// Function to get all subdirectories in one traversal
function getSubdirectories(dir) {
    const subdirectories = [];
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            subdirectories.push(fullPath);
        }
    });

    return subdirectories;
}

// Function to convert images to JPG
async function convertImagesToJpg(dir) {
    const imagesDir = path.join(dir, 'images');
    if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
        const files = fs.readdirSync(imagesDir);

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (ext !== '.jpg' && (ext === '.png' || ext === '.jpeg' || ext === '.bmp' || ext === '.tiff')) {
                const imagePath = path.join(imagesDir, file);
                const jpgPath = path.join(imagesDir, path.basename(file, ext) + '.jpg');
                try {
                    await sharp(imagePath).toFormat('jpg').toFile(jpgPath);
                    console.log(`Converted ${imagePath} to ${jpgPath}`);
                } catch (error) {
                    console.error(`Error converting ${imagePath}:`, error);
                }
            }
        }
    }
}

// Get all subdirectories in the base directory
const subdirectories = getSubdirectories(baseDir);

// Process each subdirectory
(async function() {
    for (const subdirectory of subdirectories) {
        await convertImagesToJpg(subdirectory);
    }
})();
