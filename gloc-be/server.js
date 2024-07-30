// v1.0.1

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const { findNearestDescriptors, loadDataIntoMemory } = require('./utils/topDescriptors');
require('dotenv').config();
const localFolderPath = path.resolve(__dirname, '../../face_backet');  // Adjust the folder path as needed

app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(express.json());

const { readRandomImagesFromFolder } = require("./utils/randomImages");
const { saveCroppedImages, getOriginalImages } = require("./utils/cropFacesBE");
const { getDbName, setDbName } = require('./db.js');
const { getDescriptor } = require("./utils/getDescriptor");
const { createNewScores, initializeSessionScores, testDB, createScoresTable, deleteUserEntry } = require("./scores");

let dbName = getDbName();

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
});

// Create Scores Table
createScoresTable();
// Serve static files for all images
app.use('/static/images', express.static(localFolderPath));

// Other routes and middleware

app.post('/match', async (req, res) => {
    try {
        const { photo, numPhotos, uuid } = req.body;
        if (!photo) {
            res.json(null);
            return;
        }
        const descriptor = await getDescriptor(photo);
        if (!descriptor) {
            res.json(null);
            return;
        }

        const labels = [];
        const nearestDescriptors = await findNearestDescriptors(descriptor, numPhotos, uuid);
        if (!nearestDescriptors) return;

        const imagePathPromises = nearestDescriptors.map(async nearestDescriptor => {
            const { label, normalizedDistance } = nearestDescriptor;
            const imagesFolderPath = path.join(localFolderPath, dbName, label, 'images');
            const jsonFilePath = path.join(localFolderPath, dbName, label, 'info.json');
            const name = await getNameFromJsonFile(jsonFilePath, label);

            // Read the JSON file to get the number of records
            let jsonData = null;
            try {
                const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
                jsonData = JSON.parse(jsonContent);
            } catch (error) {
                console.error(`Error reading JSON file: ${jsonFilePath}`, error);
                return null;
            }

            const numRecords = jsonData.numeroDeRegistros || 0;
            const imageFiles = [];
            for (let i = 0; i < numRecords; i++) {
                const imagePath = path.join(imagesFolderPath, `${i}.jpg`);
                try {
                    await fs.access(imagePath);
                    imageFiles.push(`/static/images/${dbName}/${label}/images/${encodeURIComponent(`${i}.jpg`)}`);
                } catch (error) {
                    console.log(`Image file ${imagePath} does not exist.`);
                }
            }

            if (imageFiles.length > 0) {
                labels.push(name);
                return {
                    label,
                    name,
                    distance: normalizedDistance * 100,
                    imagePath: imageFiles, // Array of image paths
                    jsonData // JSON file content
                };
            } else {
                console.log(`No image files found in folder: ${imagesFolderPath}`);
                return null;
            }
        });

        const responseArray = (await Promise.all(imagePathPromises)).filter(Boolean);
        res.json(responseArray);
    } catch (error) {
        console.error('Error processing detection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function encodeImageToBase64(filePath) {
    try {
        const imageBuffer = await fs.readFile(filePath);
        return imageBuffer.toString('base64');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

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

async function getNameFromJsonFile(filePath, defaultLabel) {
    const exists = await fileExists(filePath);
    if (exists) {
        try {
            const fileData = await fs.readFile(filePath, 'utf8');
            const jsonData = JSON.parse(fileData);
            return jsonData.name || defaultLabel;
        } catch (error) {
            console.error('Error reading or parsing JSON:', error);
            return defaultLabel;
        }
    } else {
        return defaultLabel;
    }
}

app.post('/random', async (req, res) => {
    try {
        const dbName = getDbName();
        const imagesFolder = path.join(localFolderPath, dbName);
        const randomImages = await readRandomImagesFromFolder(imagesFolder, dbName);
        res.json(randomImages);
    } catch (error) {
        console.error('Error processing detection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/set-db-name', async (req, res) => {
    const { newName } = req.body;
    if (newName) {
        setDbName(newName);
        dbName = getDbName();
        await loadDataIntoMemory();
        res.json({ message: 'Database name updated successfully.', dbName });
    } else {
        res.status(400).json({ message: 'New name is required.' });
    }
});

app.get('/get-db-name', async (req, res) => {
    const currentName = getDbName();
    res.json({ dbName: currentName });
});

let cachedImages = null;

app.get('/get-images', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const directory = localFolderPath;

        if (!cachedImages) {
            cachedImages = await getOriginalImages(directory);
            console.log("Images loaded and cached.");
        }

        if (cachedImages && cachedImages.length > 0) {
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedImages = cachedImages.slice(startIndex, endIndex);

            res.json({
                page,
                limit,
                total: cachedImages.length,
                data: paginatedImages
            });
        } else {
            res.status(404).send('No images found');
        }
    } catch (error) {
        console.error('Error reading images:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/save-cropped-images', async (req, res) => {
    try {
        const croppedImages = req.body;
        await saveCroppedImages(croppedImages);
        res.status(200).send('Cropped images saved successfully');
    } catch (error) {
        console.error('Error saving cropped images:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/create-scores', async (req, res) => {
    if (!req.body.userID) {
        return res.status(400).send('userID is required');
    }
    await createNewScores(req.body.userID);
    res.status(201).send(`Score created for userID: ${req.body.userID}`);
});

app.post('/delete-scores', async (req, res) => {
    if (!req.body.userID) {
        return res.status(400).send('userID is required');
    }
    try {
        res.status(204).send();
    } catch (error) {
        res.status(500).send('Error deleting user entry');
    }
});

app.post('/save-settings', (req, res) => {
    fs.writeFile('settings.json', JSON.stringify(req.body, null, 2), err => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to save settings');
        }
        res.send('Settings updated successfully');
    });
});

app.get('/get-settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'settings.json'));
});

