import {drawFaces} from "./drawFaces.js";
import {faceLandmarker, optionsTinyFaceDetector} from "./faceDetectionSetup.js";
import {currFace, setCurrFace} from "./newFaces.js";

let mediapipeResult;

export async function startFaceDetection(video) {
    if (!video || video.paused) return false;
    const canvas = document.getElementById('video-canvas');
    const context = canvas.getContext('2d');
    const videoContainer = document.getElementById('video-container'); // Assuming the container's ID

    const rect = videoContainer.getBoundingClientRect(); // Get container dimensions

    // Set canvas dimensions to match potentially visible dimensions of the video
    const cropSize = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = cropSize;
    canvas.height = cropSize;
    console.log(rect.width + ' and +' + rect.height);

    async function detectAndDraw() {
        if (video && !video.paused) {

            // Calculate the crop area from the center of the video
            const cropSize = Math.min(video.videoWidth, video.videoHeight);
            const sx = (video.videoWidth - cropSize) / 2;
            const sy = (video.videoHeight - cropSize) / 2;
            const sWidth = cropSize;
            const sHeight = cropSize;

            // Draw only the central portion of the video onto the entire canvas
            context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            const imageDataURL = canvas.toDataURL('image/jpeg', 0.5); // Adjust quality
            setCurrFace(mediapipeResult, imageDataURL); // Update face processing with detected results

            const startTimeMs = performance.now();
            // Assuming mediapipeResult and faceLandmarker are defined correctly elsewhere
            mediapipeResult = faceLandmarker.detectForVideo(canvas, startTimeMs);

            if (mediapipeResult) {
                drawFaces(mediapipeResult); // Optional: Draw detected faces on the canvas
            }
            requestAnimationFrame(detectAndDraw);
        }
    }

    // Start the detection loop
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
