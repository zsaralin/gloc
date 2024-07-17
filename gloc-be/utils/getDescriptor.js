const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before face-api
const faceapi = require('face-api.js');


let faceapiInitialized = false;

// Route to handle webcam capture requests
async function getDescriptor(imageDataURL) {
    // Load face-api.js models if not initialized
    if (!faceapiInitialized) {
        await initializeFaceAPI();
        faceapiInitialized = true;
    }

    // Process the image data and generate facial descriptors
    const tensor = await loadImageAsTensor(imageDataURL);
    const detections = await faceapi.detectAllFaces(tensor).withFaceLandmarks().withFaceDescriptors();
    // Return the facial descriptors
    if(detections && detections[0]) {
        return detections[0].descriptor;
    }
}


// Function to load image data URL as TensorFlow.js tensor
async function loadImageAsTensor(imageDataURL) {
    const buffer = Buffer.from(imageDataURL.split(',')[1], 'base64');
    const tensor = tf.node.decodeImage(buffer, 3);
    return tensor;
}
const minConfidence = 0.5;
const maxResults = 5;
let optionsSSDMobileNet;
// Function to initialize face-api.js
async function initializeFaceAPI() {
    console.log("Setting TensorFlow backend...");
    await faceapi.tf.setBackend('tensorflow');
    await faceapi.tf.ready();
    console.log("TensorFlow backend is ready.");

    const modelPath = './models';
    console.log("Loading models from disk...");
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
        // faceapi.nets.ageGenderNet.loadFromDisk(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
        // faceapi.nets.faceExpressionNet.loadFromDisk(modelPath),
    ]);
    console.log("Models loaded successfully.");

    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({ minConfidence, maxResults });
    // console.log("SSD MobileNet options set:", optionsSSDMobileNet);
}
module.exports = {
    getDescriptor
};
//
// const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before face-api
// const faceapi = require('face-api.js');
// const fs = require('fs');
//
// let faceapiInitialized = false;
//
// // Function to get descriptor
// async function getDescriptor(imagePath) {
//     // Load face-api.js models if not initialized
//     if (!faceapiInitialized) {
//         await initializeFaceAPI();
//         faceapiInitialized = true;
//     }
//
//     // Process the image data and generate facial descriptors
//     const tensor = await loadImageAsTensor(imagePath);
//     if (!tensor) {
//         console.error(`Failed to load image: ${imagePath}`);
//         return null;
//     }
//     const detections = await faceapi.detectAllFaces(tensor, optionsSSDMobileNet).withFaceLandmarks().withFaceDescriptors();
//     tensor.dispose(); // Dispose tensor after use
//
//     // Return the facial descriptors if face detected
//     if (detections.length > 0) {
//         return detections.map(d => Array.from(d.descriptor));
//     } else {
//         return null;
//     }
// }
//
// // Function to load image file as TensorFlow.js tensor
// async function loadImageAsTensor(imagePath) {
//     try {
//         const buffer = fs.readFileSync(imagePath);
//         const tensor = tf.node.decodeImage(buffer, 3);
//         return tensor;
//     } catch (error) {
//         console.error(`Error loading image as tensor: ${imagePath}`, error);
//         return null;
//     }
// }
//
// const minConfidence = 0.5;
// const maxResults = 5;
// let optionsSSDMobileNet;
//
// // Function to initialize face-api.js
// async function initializeFaceAPI() {
//     console.log("Setting TensorFlow backend...");
//     await faceapi.tf.setBackend('tensorflow');
//     await faceapi.tf.ready();
//     console.log("TensorFlow backend is ready.");
//
//     const modelPath = '../models';
//     console.log("Loading models from disk...");
//     await Promise.all([
//         faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
//         faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
//         faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
//     ]);
//     console.log("Models loaded successfully.");
//
//     optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({ minConfidence, maxResults });
// }
//
// module.exports = {
//     getDescriptor
// };
//
// if (require.main === module) {
//     (async () => {
//         const imagePath = process.argv[2];
//         const descriptors = await getDescriptor(imagePath);
//         if (descriptors) {
//             console.log(JSON.stringify(descriptors));
//         } else {
//             console.log(null);
//         }
//     })();
// }