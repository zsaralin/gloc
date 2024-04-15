import {drawFaces} from "./drawFaces.js";
import {faceLandmarker, optionsTinyFaceDetector} from "./faceDetectionSetup.js";
import {currFace, setCurrFace} from "./newFaces.js";

let mediapipeResult;

export async function startFaceDetection(video) {
    if (!video || video.paused) return false;
    let faceapiResult;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

// Set canvas dimensions to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    async function detectAndDraw() {
        if (video && !video.paused) {
            const startTimeMs = performance.now();
            mediapipeResult = faceLandmarker.detectForVideo(video, startTimeMs);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataURL = canvas.toDataURL('image/jpeg', 0.5); // Adjust quality (0.0 - 1.0)
            setCurrFace(mediapipeResult, imageDataURL); // Assuming processDetection returns processed result or face
            if(mediapipeResult) {
                drawFaces(mediapipeResult); // Ensure drawFaces is correctly implemented
            }
            requestAnimationFrame(detectAndDraw);
        }
    }


    // Start both detection loops
    detectAndDraw();
}

function computeFeatureVector(facialLandmarks) {
    // Example: Calculate the Euclidean distances between pairs of landmarks
    const featureVector = [];
    for (let i = 0; i < facialLandmarks.length - 1; i++) {
        for (let j = i + 1; j < facialLandmarks.length; j++) {
            const dx = facialLandmarks[i].x - facialLandmarks[j].x;
            const dy = facialLandmarks[i].y - facialLandmarks[j].y;
            const dz = facialLandmarks[i].z - facialLandmarks[j].z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            featureVector.push(distance);
        }

    }
    console.log(featureVector);
    return featureVector;
}

// Output the computed feature vectors
