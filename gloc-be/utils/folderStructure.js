const fs = require('fs')
const path = require('path');

const {Storage} = require('@google-cloud/storage');
const util = require("util"); // Import your config file after loading env variables
const config = require('../config.js');

const {keyFilename, bucketName} = config.googleCloudStorage;
const storage = new Storage({keyFilename});
const bucket = storage.bucket(bucketName);

const targetFolder = 'portraits/'
async function createFolders() {
    // Prefix to list objects within the folder
    const prefix = targetFolder

    try {
        // Get list of files with the specified prefix
        const [files] = await bucket.getFiles({
            prefix: prefix,
        });

        // Iterate through each file in the folder
        for (const file of files) {
            // Extracting file name
            const fileName = path.basename(file.name);
            // Extracting file name without extension
            const imageName = fileName.split('.')[0];
            // Creating folder name
            const folderName = `${targetFolder}/${imageName}`;

            // Check if the folder exists, if not, create it
            const exists = await bucket.file(folderName).exists();
            const remnantFilePath = `${folderName}/${imageName}`; // Assuming remnants are without extension
            const remnantFile = bucket.file(remnantFilePath);
            if (exists[0]) {
                await remnantFile.delete();
                console.log(`Remnant file ${remnantFilePath} deleted.`);
            }

            // Move the file into the folder
            await file.move(`${folderName}/${fileName}`);

            console.log(`File ${fileName} moved to folder ${folderName}.`);
            // await file.delete();

        }
        console.log('Files moved to folders successfully.');
    } catch (err) {
        console.error('Error moving files to folders:', err);
    }
}


module.exports = {
    createFolders
};
