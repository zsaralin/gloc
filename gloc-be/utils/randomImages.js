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
const n = 30;

async function grabRandomImages() {
    const subfolders = await getSubfolders();

    let randomImages = [];
    const limit = n; // Define the limit for number of images

    const results = await Promise.allSettled(subfolders.map(async (folderPath) => {
        if (randomImages.length >= limit) return null;  // Check moved here might not be effective due to async nature
        const [files] = await bucket.getFiles({ prefix: folderPath });
        const cropImageFile = files.find(file => file.name.endsWith('_crop.png'));
        const jsonFile = files.find(file => file.name.endsWith('.json'));

        if (!cropImageFile) return null;

        const readStream = cropImageFile.createReadStream();
        const imageBuffer = await streamToPromise(readStream);
        const base64Image = imageBuffer.toString('base64');

        let name = folderPath.split('/').pop(); // Default to folder name if JSON is not available

        if (jsonFile) {
            const jsonStream = jsonFile.createReadStream();
            const jsonData = await streamToPromise(jsonStream);
            const json = JSON.parse(jsonData.toString('utf8'));
            name = json.name || name;
        }

        return {
            distance: Math.floor(Math.random() * 21),
            name: name,
            image: base64Image
        };
    }));

    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
            randomImages.push(result.value);
        }
    });

    return randomImages;
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

async function getSubfolders() {
    const dbName = getDbName(); // Example, replace with actual database name or dynamic variable
    const prefix = `${dbName}/`;

    try {
        // Get files under the prefix
        const [files] = await bucket.getFiles({ prefix: prefix });
        const shuffledFiles = files.sort(() => 0.5 - Math.random());

        // Get the first 'n' elements after shuffling
        const randomFiles = shuffledFiles.slice(0, n);
        // Extract unique directory prefixes from file names
        const directorySet = new Set();
        randomFiles.forEach(file => {
            const fileName = file.name;
            const parts = fileName.split('/');
            if (parts.length > 1) {
                directorySet.add(parts.slice(0, -1).join('/')); // Exclude the file name itself
            }
        });

        // Shuffle the directory prefixes
        return Array.from(directorySet)

    } catch (error) {
        console.error(`Error listing and shuffling directories: ${error.message}`);
        return [];
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring to swap elements
    }
    return array;
}

module.exports = {
    grabRandomImages,
    readImagesFromFolder
};
