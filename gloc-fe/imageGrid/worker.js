// import * as faceapi from './dist/face-api.esm.js';
//
// self.onmessage = async (event) => {
//     // Import face-api.js scripts
//     // Note: Adjust the path to where you host these scripts
//
//     // Initialize face-api models as done in your main script
//     // This might require adjusting paths or methods based on how you serve these assets
//     await faceapi.nets.tinyFaceDetector.loadFromUri('../model');
//     await faceapi.nets.faceLandmark68Net.loadFromUri('../model');
//     await faceapi.nets.faceRecognitionNet.loadFromUri('../model');
//
//     const { imageData, optionsTinyFaceDetector, useTinyModel } = event.data;
//
//     try {
//         // Perform face detection
//         // Note: faceapi.detectAllFaces() might not directly accept ImageData
//         // You may need to create an offscreen canvas, put the ImageData on it, and then use that canvas here
//         const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//         const ctx = canvas.getContext('2d');
//         ctx.putImageData(imageData, 0, 0);
//
//         const result = await faceapi
//             .detectAllFaces(canvas, optionsTinyFaceDetector)
//             .withFaceLandmarks(useTinyModel)
//             .withFaceDescriptors();
//
//         // Post the results back to the main thread
//         self.postMessage({ result });
//     } catch (error) {
//         // Error handling
//         self.postMessage({ error: error.message });
//     }
// };