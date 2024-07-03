const express = require('express');
const fs = require('fs').promises
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors')
const {findNearestDescriptors, loadDataIntoMemory} = require('./utils/topDescriptors');
require('dotenv').config();


app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
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

let localFolderPath;
createScoresTable()
try {
    // Resolve the path to the images folder
    localFolderPath  = '../../face_backet'
    console.log(`Resolved images folder path: ${localFolderPath}`);

    // Check if the directory exists
    fs.access(localFolderPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Directory not found: ${localFolderPath}`);
        } else {
            console.log(`Directory exists: ${localFolderPath}`);

            // Serve static files from the images folder
            app.use('/static/images', express.static(localFolderPath));
            console.log(`Static file serving set up for: ${localFolderPath}`);
        }
    });
} catch (error) {
    console.error('Error setting up static file serving:', error);
}
// Your other routes and middleware
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
            const photoCropPath = path.posix.join(localFolderPath, dbName, label, `${label}_cmp.png`);
            const photoPath = path.posix.join(localFolderPath, dbName, label, `${label}_cmp.png`);
            const txtFile = path.posix.join(localFolderPath, dbName, label, `${label}.json`);
            const name = await getNameFromJsonFile(txtFile, label);

            const doesPhotoCropExist = await fileExists(photoCropPath);
            const doesPhotoExist = await fileExists(photoPath);

            if (doesPhotoCropExist && doesPhotoExist) {
                labels.push(name);
                return {
                    label,
                    name,
                    distance: normalizedDistance * 100,
                    imagePath: `/static/images/${dbName}/${label}/${label}_cmp.png`,
                    imageCmpPath: `/static/images/${dbName}/${label}/${label}_cmp.png`
                };
            } else {
                console.log(`One or both files do not exist: ${photoPath}, ${photoCropPath}`);
            }
        });

        // Await all promises to resolve
        const responseArray = (await Promise.all(imagePathPromises)).filter(Boolean);

        // Print resolved array for debugging

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
    // try {
    //     console.log('POST /random route hit');
    //     let dbName;
    //     try {
    //         dbName = getDbName();
    //         console.log('Database Name:', dbName);
    //     } catch (err) {
    //         console.error('Error getting database name:', err);
    //         throw err;
    //     }
    //
    //     let imagesFolder;
    //     try {
    //         imagesFolder = path.join(localFolderPath, dbName);
    //         console.log('Images Folder Path:', imagesFolder);
    //     } catch (err) {
    //         console.error('Error resolving images folder path:', err);
    //         throw err;
    //     }
    //
    //     let randomImages;
    //     try {
    //         randomImages = await readRandomImagesFromFolder(imagesFolder, dbName);
    //         console.log('Random Images:', randomImages);
    //     } catch (err) {
    //         console.error('Error reading random images from folder:', err);
    //         throw err;
    //     }
    //
    //     res.json(randomImages);
    // } catch (error) {
    //     console.error('Error processing detection:', error);
    //     res.status(500).json({ error: 'Internal Server Error' });
    // }
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
        const directory = imagesFolderPath;

        // Ensure images are loaded and cached
        if (!cachedImages) {
            cachedImages = await getOriginalImages(directory);
            console.log("Images loaded and cached.");
        }

        // Check if cachedImages is not empty before slicing
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
