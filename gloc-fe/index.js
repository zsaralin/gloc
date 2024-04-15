/**
 * FaceAPI Demo for Browsers
 * Loaded via `webcam.html`
 */
import * as faceapi from '/dist/face-api.esm.js'; // use when in dev mode
import {drawFaces, setupCanvas} from './faceDetection/drawFaces.js'
import {activateEnterButton, setupLandingPage} from "./uiElements/overlay.js";
import {setupPlayPause} from './uiElements/playPause.js';
import {
    abortController,
    resetAbortController,
    restartFaceRecogCalls,
    setIsFirstUpdate,
    startFaceRecognition
} from './faceRecognition.js';
import {createImageGrid} from "./imageGrid/createImageGrid.js";
import {restartSidePanel} from "./uiElements/sidePanel.js";
import {
    clearRandomImages,
    getRandomImages,
    shuffleActive,
    startShuffle, stopShuffle,
    updateShuffleLoop
} from "./imageGrid/startShuffle.js";
import {handleOrientationChange} from "./uiElements/detectOrientation.js";
import {faceLandmarker, setupFaceAPI} from "./faceDetection/faceDetectionSetup.js";
import {startFaceDetection} from "./faceDetection/faceDetection.js";
import {clearLoadedRandomImages} from "./imageGrid/updateShuffle.js";
// configuration options
let stream = null;
export const SERVER_URL = "http://localhost:4000"; //"https://face-recognition-be.onrender.com"; //


// Send a message to start face recognition
export async function setupCamera() {
    if (!stream) {
        await navigator.mediaDevices.getUserMedia({audio: false, video: true});
        let allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = allDevices.filter(device => device.kind === "videoinput");
        const theDevice = videoInputDevices[0]
        if (theDevice) {
            stream = await navigator.mediaDevices.getUserMedia({
                // video: {
                //     width: {ideal: 500}, // Ideal width of 500px, adjust as needed
                //     height: {ideal: 500}, // Ideal height of 500px, adjust as needed
                //     deviceId: {exact: theDevice.deviceId} // Use the specific device's ID
                // },
                video: true,
                audio: false // No audio capture
            });
        }
    }
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const playPauseButton = document.getElementById('playPauseButton');
    if (!video || !canvas || !playPauseButton) {
        return null;
    }
    // window.stream = stream;
    console.log('STREAM IS ' + stream)
    video.srcObject = stream

    return new Promise((resolve, reject) => {
        // Check if metadata is already loaded
        if (video.readyState > 1) {
            try {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.play().then(() => {
                    console.log(`Video captured. Resolution: ${video.videoWidth} x ${video.videoHeight}`);
                    setupPlayPause(video, canvas);
                    startShuffle();
                    document.getElementById('overlay').style.display = 'none';
                    startFaceDetection(video, canvas); // Consider awaiting this if it's async and critical for resolution
                    resolve();
                }).catch(error => reject(error)); // Catch errors from video.play()
            } catch (error) {
                reject(error);
            }
        } else {
            video.onloadedmetadata = async () => {
                try {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    await video.play();
                    console.log(`Video captured. Resolution: ${video.videoWidth} x ${video.videoHeight}`);
                    setupPlayPause(video, canvas);
                    startShuffle();
                    document.getElementById('overlay').style.display = 'none';
                    startFaceDetection(video, canvas); // Consider handling potential errors if it's async
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
        }
    });
}

async function main() {
    setupLandingPage();
    await setupFaceAPI()
    const randomImageArr = await getRandomImages()
    await createImageGrid(randomImageArr, abortController)
    activateEnterButton()
}

export async function reset() {
    console.log("Setting up the camera...");
    await setupCamera();
    console.log("Camera setup complete.");

    console.log("Setting up the canvas...");
    setupCanvas(); // This is a synchronous operation
    console.log("Canvas setup complete.");

    console.log("Loading random images for shuffle...");
    const randomImageArr = await getRandomImages(); // Load images for shuffle before making button ready
    console.log("Random images loaded.");

    console.log("Initializing first update flag...");
    setIsFirstUpdate(true);
    console.log("First update flag set.");

    console.log("Restarting face recognition calls...");
    restartFaceRecogCalls();
    console.log("Face recognition calls restarted.");

    console.log("Creating image grid...");
    await createImageGrid(randomImageArr, abortController);
    console.log("Image grid created.");

    console.log("Starting shuffle...");
    startShuffle();
    console.log("Shuffle started.");

    console.log("Restarting side panel...");
    await restartSidePanel();
    console.log("Side panel restarted.");

    console.log("Starting face recognition...");
    startFaceRecognition();
    console.log("Face recognition started.");
}

export async function resetNewDB() {
    resetAbortController()
    stopShuffle()
    clearRandomImages()
    clearLoadedRandomImages()
    await getRandomImages() // load images for shuffle before making button ready
    startShuffle()
    startFaceRecognition();
}

window.onload = main();
window.addEventListener('orientationchange', handleOrientationChange);
