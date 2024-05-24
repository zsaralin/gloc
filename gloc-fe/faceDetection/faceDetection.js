import {drawFaces} from "./drawFaces.js";
import {faceLandmarker, optionsTinyFaceDetector} from "./faceDetectionSetup.js";
import {currFace, setCurrFace} from "./newFaces.js";

let mediapipeResult;

export async function startFaceDetection(video) {
    if (!video || video.paused) return false;
    const canvas = document.getElementById('video-canvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match potentially visible dimensions of the video
    const cropSize = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = cropSize;
    canvas.height = cropSize;
    const sx = (video.videoWidth - cropSize) / 2;
    const sy = (video.videoHeight - cropSize) / 2;
    const sWidth = cropSize;
    const sHeight = cropSize;
    async function detectAndDraw() {
        if (video && !video.paused) {
            // Draw only the central portion of the video onto the entire canvas
            context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            const imageDataURL = canvas.toDataURL('image/jpeg'); // Adjust quality
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

    detectAndDraw();
}
