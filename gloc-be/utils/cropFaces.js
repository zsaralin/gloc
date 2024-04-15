const { Storage } = require('@google-cloud/storage');
const fs = require('fs').promises;
const faceapi = require('face-api.js');
const tmp = require("tmp");
const { createCanvas, loadImage } = require('canvas');
const path = require("path");
const { compressImageToBuffer } = require("./sftp/compressImages.js");
const MODEL_URI = "./models";
const { getDbName } = require('../db.js');
const dbName = getDbName();
const PADDING = 0; //40
const util = require("util"); // Import your config file after loading env variables
const config = require('../config.js');

const {keyFilename, bucketName} = config.googleCloudStorage;
const storage = new Storage({keyFilename});
const bucket = storage.bucket(bucketName);
const mtcnnParams = {
    // These are example parameters, adjust them according to your needs
    minFaceSize: 20,
    scaleFactor: 0.5,
    maxNumScales: 10,
    scoreThresholds:  [0.3, 0.4, 0.5],
    maxNumBoxes: 10,
};
// Function to crop faces
async function cropFaces() {
    try {
        // Load face detection models
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URI);
        await faceapi.nets.mtcnn.loadFromDisk(MODEL_URI);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URI);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URI);

        // Retrieve file list from the remote directory
        const files = await bucket.getFiles({ prefix: `${dbName}/` });

        for (const file of files[0]) {
            const imageName = path.basename(file.name, path.extname(file.name));

            if (imageName.endsWith("_crop")) {
                continue; // Move to the next iteration
            }

            const tmpobj = tmp.fileSync();

            await file.download({ destination: tmpobj.name });

            const img = await loadImage(tmpobj.name);

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
                // Take the first detection as the single face detection result
                const singleDetection = allDetections[0];
                const { x, y, width, height } = singleDetection.detection.box;
                const boundingBox = { x, y, width, height };

                const croppedImage = cropImage(img, boundingBox);

                const croppedImagePath = `portraits/${imageName}/${imageName}_crop.png`;

                await saveCroppedImage(bucket, croppedImage, croppedImagePath);

                await fs.unlink(tmpobj.name);

                // Optionally delete the original image
                // await file.delete();
            } else {
                console.log(`No face detected in ${file.name}`);
            }
        }
        console.log('Done Cropping!');
    } catch (error) {
        console.error('Error processing face descriptors:', error);
        return null;
    }
}

// Helper function to crop image
function cropImage(image, boundingBox) {
    const imgWidth = image.width;
    const imgHeight = image.height;

    // Determine the size of the square crop, prioritizing no padding to avoid exceeding image dimensions
    let cropSize = Math.min(Math.max(boundingBox.width, boundingBox.height), imgWidth, imgHeight);

    // Calculate the top-left corner of the square crop to ensure it is centered around the detected face
    let newX = boundingBox.x + boundingBox.width / 2 - cropSize / 2;
    let newY = boundingBox.y + boundingBox.height / 2 - cropSize / 2;

    // Adjust newX and newY to ensure the crop area does not exceed the image boundaries
    newX = Math.max(0, newX);
    newY = Math.max(0, newY);
    // Prevent the crop from extending beyond the right or bottom edge of the image
    newX = Math.min(newX, imgWidth - cropSize);
    newY = Math.min(newY, imgHeight - cropSize);

    // Create a new canvas for the cropped image
    const canvas = createCanvas(cropSize, cropSize);
    const context = canvas.getContext('2d');

    // Draw the cropped area onto the canvas
    context.drawImage(image, newX, newY, cropSize, cropSize, 0, 0, cropSize, cropSize);

    // Convert the canvas to a data URL or use another method to get the image data as needed
    return canvas.toDataURL('image/png');
}

// Helper function to save cropped image
async function saveCroppedImage(bucket, croppedImage, imagePath) {
    try {
        const base64Data = croppedImage.slice(croppedImage.indexOf(',') + 1);
        const imageData = Buffer.from(base64Data, 'base64');
        const resizedImage = await compressImageToBuffer(imageData);
        const file = bucket.file(imagePath);
        await file.save(resizedImage);
        console.log(`Cropped and compressed image saved as PNG to: ${imagePath}`);
    } catch (error) {
        console.error('Error saving cropped image:', error);
    }
}

module.exports = {
    cropFaces,
};
