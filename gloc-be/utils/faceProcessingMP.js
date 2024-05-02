
const { Storage } = require('@google-cloud/storage');
const fs = require('fs').promises;
const canvas = require('canvas');
const path = require('path');
const tmp = require('tmp');
const MODEL_URI = './models';

const { Canvas, Image, ImageData } = canvas;
const { getDbName } = require('../db.js');
const dbName = getDbName();
const tf = require('@tensorflow/tfjs-node');
const faceDetection = require('@tensorflow-models/face-detection');
// Assuming you have set GOOGLE_APPLICATION_CREDENTIALS environment variable

const util = require("util"); // Import your config file after loading env variables
const config = require('../config.js');
const {FaceDetector, FilesetResolver, FaceLandmarker} = require("@mediapipe/tasks-vision");

const {keyFilename, bucketName} = config.googleCloudStorage;
const storage = new Storage({keyFilename});
const bucket = storage.bucket(bucketName);

const targetDB = 'small'
const resultsFilePath = process.env.RESULTS_PATH || path.join(__dirname, `../results/results_${targetDB}_mp.json`);
const mtcnnParams = {
    // These are example parameters, adjust them according to your needs
    minFaceSize: 20,
    scaleFactor: 0.5,
    maxNumScales: 10,
    scoreThresholds:  [0.3, 0.4, 0.5],
    maxNumBoxes: 10,
};

let faceDetector;
async function processFacesMP() {
    try {

        // Load face detection models
        const model = await faceDetection.createDetector(faceDetection.SupportedModels.MediaPipeFaceDetector, {
            runtime: 'tfjs',
            // solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
        });

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
                await file.download({destination: tmpobj.name});

                // Read the image file into a buffer
                const fileBuffer = await fs.readFile(tmpobj.name);
                tf.setBackend('tensorflow'); // < required for decodeImage
                const imageData = await (fs.readFile)(tmpobj.name);
                const image = await tf.node.decodeImage(imageData, 3);
                tf.setBackend('cpu');
                const model = faceDetection.SupportedModels.MediaPipeFaceDetector
                // // const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
                const detector = await faceDetection.createDetector(model, {runtime: 'tfjs', maxFaces: 1});
                const predictions = await detector.estimateFaces(image);
                console.log(predictions[0].keypoints)
                // if (allDetections.length > 0) {
                //     const detections = allDetections[0];
                //     const descriptor = new Float32Array(detections.descriptor);
                //     const { x, y, width, height } = detections.detection.box;
                //     const boundingBox = { x, y, width, height };
                //
                //     const label = path.basename(filePath, path.extname(filePath));
                //     results[label] = { label, descriptors: [Array.from(descriptor)], boundingBoxes: [boundingBox] };
                // } else {
                //     console.log(`No face detected in ${filePath}`);
                // }

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
    processFacesMP,
};
