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

// Function to check image height and print names of images with height < 10 pixels
async function checkImageHeights(dir) {
    const imagesDir = path.join(dir, 'images');
    if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
        const files = fs.readdirSync(imagesDir);

        let found = false;

        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (['.png', '.jpeg', '.jpg', '.bmp', '.tiff'].includes(ext)) {
                const imagePath = path.join(imagesDir, file);
                try {
                    const metadata = await sharp(imagePath).metadata();
                    if (metadata.height < 10) {
                        if (!found) {
                            console.log(`Subdirectory: ${dir}`);
                            found = true;
                        }
                    }
                } catch (error) {
                    console.error(`Error checking height of ${imagePath}:`, error);
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
        await checkImageHeights(subdirectory);
    }
})();
