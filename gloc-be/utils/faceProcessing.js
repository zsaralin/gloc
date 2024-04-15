const { Storage } = require('@google-cloud/storage');
const fs = require('fs').promises;
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const tmp = require('tmp');
const MODEL_URI = './models';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const { getDbName } = require('../db.js');
const dbName = getDbName();

// Assuming you have set GOOGLE_APPLICATION_CREDENTIALS environment variable

const util = require("util"); // Import your config file after loading env variables
const config = require('../config.js');

const {keyFilename, bucketName} = config.googleCloudStorage;
const storage = new Storage({keyFilename});
const bucket = storage.bucket(bucketName);

const targetDB = '42'
const resultsFilePath = process.env.RESULTS_PATH || path.join(__dirname, `../results/results_${targetDB}.json`);
const mtcnnParams = {
    // These are example parameters, adjust them according to your needs
    minFaceSize: 20,
    scaleFactor: 0.5,
    maxNumScales: 10,
    scoreThresholds:  [0.3, 0.4, 0.5],
    maxNumBoxes: 10,
};
async function processFaces() {
    try {
        // Load face detection models
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URI);
        await faceapi.nets.mtcnn.loadFromDisk(MODEL_URI);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URI);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URI);

        const [files] = await bucket.getFiles({ prefix: targetDB });
        console.log(files.length)
        const results = {};

        for (const file of files) {
            const filePath = file.name;
            // Skip processing for files ending with "_crop" or "_compressed"
            if (filePath.endsWith('_crop.png') || filePath.endsWith('_compressed.png') || !filePath.endsWith('.png')) {
                continue; // Skip to the next file
            }
            console.log(`Processing ${filePath}`)
            try {
                const tmpobj = tmp.fileSync();
                await file.download({ destination: tmpobj.name });

                const img = await canvas.loadImage(tmpobj.name);

                // First attempt to detect faces using SSD MobileNet V1
                let allDetections = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence:.5 }))
                    .withFaceLandmarks()
                    .withFaceDescriptors();

                // If no faces detected with SSD MobileNet V1, fall back to MTCNN
                if (allDetections.length === 0) {
                    allDetections = await faceapi.detectAllFaces(img, new faceapi.MtcnnOptions(mtcnnParams))
                        .withFaceLandmarks()
                        .withFaceDescriptors();
                }

                if (allDetections.length > 0) {
                    const detections = allDetections[0];
                    const descriptor = new Float32Array(detections.descriptor);
                    const { x, y, width, height } = detections.detection.box;
                    const boundingBox = { x, y, width, height };

                    const label = path.basename(filePath, path.extname(filePath));
                    results[label] = { label, descriptors: [Array.from(descriptor)], boundingBoxes: [boundingBox] };
                } else {
                    console.log(`No face detected in ${filePath}`);
                }

                await fs.unlink(tmpobj.name);
            } catch (err) {
                console.error(`Error processing file ${filePath}:`, err);
            }
        }

        await fs.writeFile(resultsFilePath, JSON.stringify(results, null, 2));
        console.log(`Results saved to: ${resultsFilePath}`);

        return results;
    } catch (error) {
        console.error('Error processing face descriptors:', error);
        return null;
    }
}
module.exports = {
    processFaces,
};
