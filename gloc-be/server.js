const express = require('express');
const fs = require('fs').promises
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors')
const {findNearestDescriptors, loadDataIntoMemory} = require('./utils/topDescriptors');
require('dotenv').config();
const localFolderPath  = '../../face_backet'

app.use(cors())
app.use(express.json());



const {readRandomImagesFromFolder} = require("./utils/randomImages");
const { saveCroppedImages, getOriginalImages} = require("./utils/cropFacesBE");

const { getDbName } = require('./db.js');
const {setDbName} = require("./db.js");
const {getDescriptor} = require("./utils/getDescriptor");
const {createNewScores, initializeSessionScores, testDB, createScoresTable, deleteUserEntry} = require("./scores");

let dbName = getDbName();

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
})
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

createScoresTable()

// returns an array of top n matches, for each match - label, distance, image [compressed, first image]
app.post('/match', async (req, res) => {
    try {
        res.json('hihihihihihihi')
        // const {photo, numPhotos, uuid} = req.body;
        // if(!photo) {
        //     res.json(null);
        //     return
        // }
        // const descriptor = await getDescriptor(photo)
        // if(!descriptor) {
        //     res.json(null);
        //     return
        // }
        //
        // const labels = [];
        //
        // const nearestDescriptors = await findNearestDescriptors(descriptor, numPhotos, uuid);
        // const imageBufferPromises = nearestDescriptors.map(async nearestDescriptor => {
        //     const {label, normalizedDistance} = nearestDescriptor;
        //     const photoCropPath = path.join(localFolderPath, dbName, label, `${label}_crop_padded.png`);
        //     const photoPath = path.join(localFolderPath, dbName, label, `${label}_cmp.png`);
        //     const txtFile = path.join(localFolderPath, dbName, label, `${label}.json`);
        //     const name = await getNameFromJsonFile(txtFile, label);
        //
        //     const doesPhotoCropExist = await fileExists(photoCropPath);
        //     const doesPhotoExist = await fileExists(photoPath);
        //
        //     if (doesPhotoCropExist && doesPhotoExist) {
        //         try {
        //             const imageCropBuffer = await encodeImageToBase64(photoCropPath);
        //             const imageBuffer = await encodeImageToBase64(photoPath);
        //             labels.push(name)
        //             return {
        //                 label,
        //                 name,
        //                 distance: normalizedDistance * 100,
        //                 image: imageCropBuffer,
        //                 imageCmp: imageBuffer
        //             };
        //         } catch (error) {
        //             console.error('Error processing images:', error);
        //         }
        //     } else {
        //         console.log(`One or both files do not exist: ${photoPath}, ${photoCropPath}`);
        //     }
        // });
        // const responseArray = (await Promise.all(imageBufferPromises)).filter(Boolean);
        //
        // res.json(responseArray);
    } catch (error) {
        console.error('Error processing detection:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

async function encodeImageToBase64(filePath) {
    try {
        const imageBuffer = await fs.readFile(filePath);
        return imageBuffer.toString('base64');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;  // Return null if there's an error reading the file
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
    // Check if the file exists
    const exists = await fileExists(filePath);
    if (exists) {
        try {
            // Read the JSON file
            const fileData = await fs.readFile(filePath, 'utf8');
            // Parse the JSON data
            const jsonData = JSON.parse(fileData);
            // Return the 'name' property or default label if not present
            return jsonData.name || defaultLabel;
        } catch (error) {
            console.error('Error reading or parsing JSON:', error);
            return defaultLabel; // Return default label in case of error
        }
    } else {
        return defaultLabel; // Return default label if file doesn't exist
    }
}

app.post('/random', async (req, res) => {
    try {
        const dbName = getDbName();
        const imagesFolder = `${localFolderPath}/${dbName}/`; // Adjust the folder path as needed

        const randomImages = await readRandomImagesFromFolder(imagesFolder);
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

let cachedImages = null;

app.get('/get-images', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const directory = localFolderPath;

        // Fetch images only if they haven't been cached yet
        if (!cachedImages) {
            cachedImages = await getOriginalImages(directory);
            console.log("Images loaded and cached.");
        }

        const paginatedImages = cachedImages.slice((page - 1) * limit, page * limit);

        res.json({
            page,
            limit,
            total: cachedImages.length,
            data: paginatedImages
        });
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
        res.status(204).send(); // No content to send back
    } catch (error) {
        res.status(500).send('Error deleting user entry'); // Server error response
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

// testDB()
// deleteCropCompressedFiles(localFolderPath)
// grabRandomImages()
// cropFaces()
// processFaces()
// createFolders()
// processFacesMP()
