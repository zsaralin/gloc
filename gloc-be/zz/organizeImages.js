const fs = require('fs');
const path = require('path');
const config = require("../config");
const {Storage} = require("@google-cloud/storage");

const folderPath = './images';
const outputFolder = './organized_images';
const filesPerFolder = 10;

function createSubfolders() {
    // Create the output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    // Read the files in the input folder
    const files = fs.readdirSync(folderPath);

    // Sort files numerically based on the numeric part of the filename
    const sortedFiles = files.sort((a, b) => {
        const regex = /\d+/; // Match numeric part of the filename
        const aNumber = parseInt(a.match(regex)[0], 10);
        const bNumber = parseInt(b.match(regex)[0], 10);
        return aNumber - bNumber;
    });

    // Organize files into subfolders
    for (let i = 0; i < sortedFiles.length; i += filesPerFolder) {
        // Create a subfolder
        const subfolderNumber = Math.floor(i / filesPerFolder) + 1;
        const subfolderPath = path.join(outputFolder, `folder${subfolderNumber}`);

        if (!fs.existsSync(subfolderPath)) {
            fs.mkdirSync(subfolderPath);
        }

        // Move files to the subfolder
        for (let j = i; j < i + filesPerFolder && j < sortedFiles.length; j++) {
            const sourceFilePath = path.join(folderPath, sortedFiles[j]);
            const destinationFilePath = path.join(subfolderPath, sortedFiles[j]);

            fs.renameSync(sourceFilePath, destinationFilePath);
        }
    }

    console.log('Files organized successfully.');
}

const {keyFilename, bucketName} = config.googleCloudStorage;
const storage = new Storage({keyFilename});
const bucket = storage.bucket(bucketName);
async function renameFolder(oldFolderPath, newFolderPath) {

    if (!oldFolderPath.endsWith('/')) {
        oldFolderPath += '/';
    }

    if (!newFolderPath.endsWith('/')) {
        newFolderPath += '/';
    }

    // Lists all the files in the old folder
    const [files] = await bucket.getFiles({ prefix: oldFolderPath });

    for (const file of files) {
        const newFileName = file.name.replace(oldFolderPath, newFolderPath);

        // Copy file to the new location
        await bucket.file(file.name).copy(bucket.file(newFileName));

        // Optionally delete the original file
        await bucket.file(file.name).delete();
    }

    console.log(`Folder renamed from ${oldFolderPath} to ${newFolderPath}`);
}


module.exports = {
    renameFolder,
};
