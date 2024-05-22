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

const localFolderPath  = '..\\..\\face_backet'

app.use(cors())
app.use(express.json());

const {Storage} = require('@google-cloud/storage');
const {grabRandomImages} = require("./utils/randomImages.js");
const {readImagesFromFolder} = require("./utils/randomImages");
const {createFolders} = require("./zz/folderStructure.js");
const {cropFaces} = require("./utils/cropFaces");
const {renameFolder} = require("./zz/organizeImages"); // Adjust the path based on your project structure

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
            const localFilePathWithCrop = `${localFolderPath}/${dbName}/${label}/${label}_crop.png`;
            const localFilePathWithoutCrop = `${localFolderPath}/${dbName}/${label}/${label}.png`;
            async function fileExists(filePath) {
                try {
                    await fs.access(filePath);
                    return true;
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        return false;
                    }
                    throw error;
                }
            }

            const localFilePath = await fileExists(localFilePathWithCrop) ? localFilePathWithCrop : localFilePathWithoutCrop;

            if (localFilePath) {
                try {
                    const imageBuffer = await fs.readFile(localFilePath);
                    return { label, distance: normalizedDistance * 100, image: imageBuffer.toString('base64') };
                } catch (error) {
                    console.error('Error reading file:', error);
                }
            } else {
                console.log(`File ${localFilePath} does not exist.`);
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