const fs = require('fs')
const path = require('path');
const streamToPromise = require('stream-to-promise');

const {Storage} = require('@google-cloud/storage');
const util = require("util"); // Import your config file after loading env variables
const config = require('../config.js');
const { getDbName } = require('../db.js');

const {keyFilename, bucketName} = config.googleCloudStorage;
const storage = new Storage({keyFilename});
const bucket = storage.bucket(bucketName);
const n = 80;

async function grabRandomImages() {
    try {
        const dbName = getDbName();
        // Function to check if a file ends with '_compressed.png'
        const isCompressedImage = (filename) => filename.endsWith('_crop.png');

        // List all objects in the bucket
        const [files] = await bucket.getFiles({prefix: `${dbName}/`});

        // Count of compressed images found
        let compressedImageCount = 0;

        // Selected image names
        const selectedImageNames = new Set();

        // Randomly selected images
        const randomImages = [];

        // Iterate over the files and select random compressed images
        while (randomImages.length < n && compressedImageCount < files.length) {
            const randomIndex = Math.floor(Math.random() * files.length);
            const file = files[randomIndex];
            if (isCompressedImage(file.name) && !selectedImageNames.has(file.name)) {
                // Extract subfolder from the file path
                const subfolder = file.name.split('/').slice(0, -1).join('/');

                // Check if an image from the same subfolder has already been selected
                if (!selectedImageNames.has(subfolder)) {
                    // Randomly select the file if it hasn't been selected before
                    compressedImageCount++;
                    selectedImageNames.add(file.name);
                    selectedImageNames.add(subfolder);
                    const readStream = file.createReadStream();
                    const imageBuffer = await streamToPromise(readStream);

                    const actualFileName = path.basename(file.name);

                    // Save the image to a local file
                    const localFilePath = `introImages/${dbName}/${actualFileName}`;
                    await fs.promises.writeFile(localFilePath, imageBuffer);
                    const base64Image = imageBuffer.toString('base64');

                    randomImages.push({filename: file.name, base64Image});
                }
            }
        }

        // Check if there are enough unique images in the bucket
        if (randomImages.length < n) {
            throw new Error(`There are only ${compressedImageCount} unique images in the bucket, which is less than ${n}`);
        }

        return randomImages;

    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

async function readImagesFromFolder() {
    const dbName = getDbName();
    const imagesFolder = `introImages/${dbName}/`; // Adjust the folder path as needed
    const imageBuffers = [];

    try {
        // Read all files from the specified directory
        const files = await fs.promises.readdir(imagesFolder);

        // Iterate over the files and read each image into a buffer
        for (const fileName of files) {
            const filePath = path.join(imagesFolder, fileName);

            const readStream = fs.createReadStream(filePath);
            const imageBuffer = await streamToPromise(readStream);
            const base64Image = imageBuffer.toString('base64');
            imageBuffers.push({distance : Math.floor(Math.random() * 21), image: base64Image});
        }
    } catch (error) {
        console.error(`Error reading images: ${error.message}`);
    }
    return imageBuffers;
}

module.exports = {
    grabRandomImages,
    readImagesFromFolder
};
