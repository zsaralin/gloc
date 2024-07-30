const fs = require('fs');
const path = require('path');

// Directory to start searching from
const baseDir = path.join(__dirname, '../../../face_backet', 'arg');

// Function to recursively get all subdirectories
function getSubdirectories(dir) {
    let subdirectories = [];
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            subdirectories.push(fullPath);
            subdirectories = subdirectories.concat(getSubdirectories(fullPath));
        }
    });

    return subdirectories;
}

// Get all subdirectories in the base directory
const subdirectories = getSubdirectories(baseDir);

// Function to manage images in the 'images' folder
function manageImages(dir) {
    const imagesDir = path.join(dir, 'images');
    if (fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()) {
        const processedImagePath = path.join(imagesDir, '0_processed.jpg');
        const originalImagePath = path.join(imagesDir, '0.jpg');
        const cropImagePath = path.join(imagesDir, '0_crop.jpg');

        // Delete 0_processed.jpg if it exists
        if (fs.existsSync(processedImagePath)) {
            fs.unlinkSync(processedImagePath);
            console.log(`Deleted ${processedImagePath}`);
        }

        // Delete 0.jpg if it exists
        if (fs.existsSync(originalImagePath)) {
            fs.unlinkSync(originalImagePath);
            console.log(`Deleted ${originalImagePath}`);
        }

        // Rename 0_crop.jpg to 0.jpg if 0_crop.jpg exists
        if (fs.existsSync(cropImagePath)) {
            fs.renameSync(cropImagePath, originalImagePath);
            console.log(`Renamed ${cropImagePath} to ${originalImagePath}`);
        }

        // Delete crop.jpg if it exists
        const cropJpgPath = path.join(imagesDir, 'crop.jpg');
        if (fs.existsSync(cropJpgPath)) {
            fs.unlinkSync(cropJpgPath);
            console.log(`Deleted ${cropJpgPath}`);
        }
    }
}

// Process each subdirectory
subdirectories.forEach(subdirectory => {
    manageImages(subdirectory);
});
