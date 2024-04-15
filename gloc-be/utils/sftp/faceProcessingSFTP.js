const faceapi = require('face-api.js');
const canvas = require('canvas');
const {promises: fs} = require("fs");
const {statPromise, readdirPromise} = require("../sftp");
const path = require("path");
const tmp = require("tmp");
const MODEL_URI = "./models";
const sftpConnection = require('../sftp.js');

const {Canvas, Image, ImageData} = canvas;
faceapi.env.monkeyPatch({Canvas, Image, ImageData});
const resultsFilePath = process.env.RESULTS_PATH || path.join(__dirname, 'results.json');

async function processFaces() {
    try {
        // Load face detection models
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URI);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URI);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URI);

        const remotePath = './dataset_images/faces_dataset_small_folder';
        const conn = sftpConnection.createSftpConnection()
        // Retrieve file list from the remote directory
        const filesResult = await new Promise((resolve, reject) => {
            conn.sftp((err, sftp) => {
                if (err) {
                    console.error('Error establishing SFTP connection:', err);
                    return reject(err);
                }

                sftp.readdir(remotePath, (err, files) => {
                    if (err) return reject(err);
                    resolve({ sftp, files: files.map(file => file.filename) });
                });
            });
        });

        const { sftp, files } = filesResult;

        const results = {};

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            const imagePath = `${remotePath}/${file}`;

            try {
                const stats = await statPromise(sftp, imagePath);
                let descriptors = [];
                let boundingBoxes = [];

                // Check if stats is defined and is a directory
                if (stats && stats.isDirectory()) {
                    // Process all files in the subfolder
                    const subfolderFiles = await readdirPromise(sftp, imagePath);
                    for (const subfolderFile of subfolderFiles) {
                        const subfolderFilePath = `${imagePath}/${subfolderFile.filename}`;
                        const { descriptor, boundingBox } = await processImage(sftp, subfolderFilePath);
                        if (descriptor && boundingBox) {
                            descriptors.push(descriptor);
                            boundingBoxes.push(boundingBox);
                        }
                    }
                } else {
                    // Process individual file
                    const { descriptor, boundingBox } = await processImage(sftp, imagePath);
                    if (descriptor && boundingBox) {
                        descriptors.push(descriptor);
                        boundingBoxes.push(boundingBox);
                    }
                }

                // Create a LabeledFaceDescriptors instance
                const label = path.basename(file, path.extname(file));
                results[label] = { label, descriptors, boundingBoxes };
            } catch (err) {
                console.error(`Error getting file stats for ${imagePath}:`, err);
                // Handle the error as needed
            }
        }

        // Convert results to the desired format
        const processedResults = {};

        for (const label in results) {
            const { label: lbl, descriptors, boundingBoxes } = results[label];
            processedResults[lbl] = {
                label: lbl,
                descriptors: descriptors.map(descriptor => Array.from(descriptor)),
                boundingBoxes,
            };
        }

        // Save processed results to a file
        await fs.writeFile(resultsFilePath, JSON.stringify(processedResults, null, 2));
        console.log(`Results saved to: ${resultsFilePath}`);

        return processedResults;
    } catch (error) {
        console.error('Error processing face descriptors:', error);
        return null;
    }
}

// helper fn to process each image
async function processImage(sftp, imagePath) {
    console.log(`Processing image: ${imagePath}`);

    const tmpobj = tmp.fileSync();

    await new Promise((resolve, reject) => {
        const readStream = sftp.createReadStream(imagePath);

        readStream.on('end', resolve);
        readStream.on('error', (readError) => {
            console.error('Error reading stream:', readError);
            reject(readError);
        });

        fs.writeFile(tmpobj.name, readStream)
            .then(resolve)
            .catch((writeError) => {
                console.error('Error writing to file:', writeError);
                reject(writeError);
            });
    });

    const img = await canvas.loadImage(tmpobj.name);

    const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (detections) {
        const descriptor = new Float32Array(detections.descriptor);

        // Get bounding box coordinates
        const { x, y, width, height } = detections.detection.box;
        const boundingBox = { x, y, width, height };

        await fs.unlink(tmpobj.name);

        return { descriptor, boundingBox };
    } else {
        console.log(`No face detected in ${imagePath}`);
        return null;
    }
}

module.exports = {
    processFaces,
};


