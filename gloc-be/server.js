const express = require('express');
const fs = require('fs').promises
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const tmp = require('tmp');
const cors = require('cors')
require('@tensorflow/tfjs-node');
const {createSftpConnection, statPromise, readdirPromise, getImageBuffer, createSftp} = require('./utils/sftp');
const {findNearestDescriptors, loadDataIntoMemory} = require('./utils/topDescriptors');
const numMatchesHandler = require('./numMatchesHandler');
require('dotenv').config();
const config = require('./config.js'); // Import your config file after loading env variables
const faceapi = require('face-api.js');
// const resultsFilePath = process.env.RESULTS_PATH || path.join(__dirname, 'results.json');
const util = require('util')
const {processFaces} = require("./utils/faceProcessing.js");
const streamToPromise = require('stream-to-promise');

app.use(cors())
app.use(express.json());

const {Storage} = require('@google-cloud/storage');
const {grabRandomImages} = require("./utils/randomImages.js");
const {readImagesFromFolder} = require("./utils/randomImages");
const {createFolders} = require("./utils/folderStructure.js");
const {cropFaces} = require("./utils/cropFaces");
const {renameFolder} = require("./zz/organizeImages"); // Adjust the path based on your project structure

const {keyFilename, bucketName} = config.googleCloudStorage;
const storage = new Storage({keyFilename});
const { getDbName } = require('./db.js');
const {setDbName} = require("./db.js");
const {getDescriptor} = require("./utils/getDescriptor");
let dbName = getDbName();

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
})

// returns an array of top n matches, for each match - label, distance, image [compressed, first image]
app.post('/match', async (req, res) => {
    try {
        const {photo, numPhotos} = req.body;
        if(!photo) {
            res.json(null);
            return
        }
        const descriptor = await getDescriptor(photo)
        if(!descriptor) {
            res.json(null);
            return
        }
        const nearestDescriptors = await findNearestDescriptors(descriptor, numPhotos);
        const imageBufferPromises = nearestDescriptors.map(async nearestDescriptor => {
            const {label, normalizedDistance} = nearestDescriptor;
            const remoteDirectoryPathWithCrop = `${dbName}/${label}/${label}_crop.png`;
            const remoteDirectoryPathWithoutCrop = `${dbName}/${label}/${label}.png`;

            const bucket = storage.bucket(bucketName);
            const file = bucket.file(remoteDirectoryPathWithCrop);
            const cropExists = await file.exists();
            const remoteDirectoryPath = cropExists ? remoteDirectoryPathWithCrop : remoteDirectoryPathWithoutCrop;

            if (remoteDirectoryPath[0]) {
                const readStream = file.createReadStream();

                // Use streamToPromise to convert the stream to a buffer
                const imageBuffer = await streamToPromise(readStream);

                return {label, distance: normalizedDistance * 100, image: imageBuffer.toString('base64')};
            } else {
                console.log(`File ${remoteDirectoryPath} does not exist in the bucket.`);
                res.json(null);
            }
        });

        const responseArray = (await Promise.all(imageBufferPromises)).filter(Boolean);
        res.json(responseArray);
    } catch (error) {
        console.error('Error processing detection:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.post('/random', async (req, res) => {
    try {
        const randomImages = await readImagesFromFolder();
        res.json(randomImages);
    } catch (error) {
        console.error('Error processing detection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Endpoint to set the database name
app.post('/set-db-name', async (req, res) => {
    const {newName} = req.body;
    if (newName) {
        setDbName(newName)
        dbName = getDbName();
        await loadDataIntoMemory()
        res.json({message: 'Database name updated successfully.', dbName});
    } else {
        res.status(400).json({message: 'New name is required.'});
    }
});

app.get('/get-db-name', async (req, res) => {
    const currentName = getDbName(); // Assuming getDbName simply returns the current DB name
    res.json({ dbName: currentName });
});

// grabRandomImages()
// cropFaces()
// processFaces()
// createFolders()
// processFacesMP()
