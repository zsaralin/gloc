/**
 * FaceAPI Demo for Browsers
 * Loaded via `webcam.html`
 */
import {drawFaces, setupCanvas} from './faceDetection/drawFaces.js'
import {activateEnterButton, setupLandingPage} from "./uiElements/overlay.js";
import {setupPlayPause} from './uiElements/playPause.js';
import {
    abortController,
    resetAbortController,
    restartFaceRecogCalls,
    setIsFirstUpdate,
    startFaceRecognition
} from './faceRecognition/faceRecognition.js';
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
import {cropFacesFE, cropImagesParent} from "./imageProcessing/cropFacesFE.js";
import {checkDisplaySize} from "./uiElements/displaySize.js";
// configuration options
let stream = null;
export const SERVER_URL =  "http://localhost:4000";//"https://face-recognition-be.onrender.com"; //

let video; let canvas;

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
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    const playPauseButton = document.getElementById('playPauseButton');
    if (!video || !canvas || !playPauseButton) {
        return null;
    }
    // window.stream = stream;
    video.srcObject = stream

    return new Promise((resolve, reject) => {
        // Check if metadata is already loaded
        if (video.readyState > 1) {
            try {
                const cropSize = Math.min(video.videoWidth, video.videoHeight);
                canvas.width = cropSize;
                canvas.height = cropSize;
                video.play().then(() => {
                    console.log(`Video captured. Resolution: ${video.videoWidth} x ${video.videoHeight}`);
                    setupPlayPause(video, canvas);
                    // startShuffle();
                    // document.getElementById('overlay').style.display = 'none';
                    // startFaceDetection(video, canvas); // Consider awaiting this if it's async and critical for resolution
                    resolve();
                }).catch(error => reject(error)); // Catch errors from video.play()
            } catch (error) {
                reject(error);
            }
        } else {
            video.onloadedmetadata = async () => {
                try {
                    const cropSize = Math.min(video.videoWidth, video.videoHeight);
                    canvas.width = cropSize;
                    canvas.height = cropSize;
                    console.log(canvas.width + ' and ' + canvas.height)
                    await video.play();
                    console.log(`Video captured. Resolution: ${video.videoWidth} x ${video.videoHeight}`);
                    setupPlayPause(video, canvas);
                    // startShuffle();
                    // document.getElementById('overlay').style.display = 'none';
                    // startFaceDetection(video, canvas); // Consider handling potential errors if it's async
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
        }
    });
}

async function main() {
    checkDisplaySize()
    setupLandingPage();
    await setupFaceAPI()
    // const randomImageArr = await getRandomImages()
    // await createImageGrid(randomImageArr, abortController)
    activateEnterButton()
}


export async function reset() {
    await setupCamera();
    setupCanvas(); // This is a synchronous operation
    const randomImageArr = await getRandomImages(); // Load images for shuffle before making button ready
    setIsFirstUpdate(true);
    restartFaceRecogCalls();
    await createImageGrid(randomImageArr, abortController);
    startShuffle();
    await restartSidePanel();
    startFaceRecognition();
}

export async function resetNewDB() {
    // resetAbortController()
    // stopShuffle()
    // clearRandomImages()
    // clearLoadedRandomImages()
    const randomImageArr = await getRandomImages()
    await createImageGrid(randomImageArr, abortController)
    // startShuffle()
    // startFaceDetection(video,canvas)
    // startFaceRecognition();
}

export function enterExperience(){
    startShuffle()
    startFaceDetection(video,canvas)
    startFaceRecognition();
    document.getElementById('overlay').style.opacity = '0';

}

window.onload = main()//cropImagesParent(200);

window.addEventListener('orientationchange', handleOrientationChange);