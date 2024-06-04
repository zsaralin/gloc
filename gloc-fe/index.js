/**
 * FaceAPI Demo for Browsers
 * Loaded via `webcam.html`
 */
import {drawFaces, setupCanvas} from './faceDetection/drawFaces.js'
import {activateEnterButton, fadeoutOverlay, setupLandingPage} from "./uiElements/overlay.js";
import {setupPlayPause} from './uiElements/playPause.js';
import {
    abortController,
    startFaceRecognition
} from './faceRecognition/faceRecognition.js';
import {createImageGrid} from "./imageGrid/createImageGrid.js";
import {
    getRandomImages,
    startShuffle, stopShuffle,
} from "./imageGrid/startShuffle.js";
import {handleOrientationChange} from "./uiElements/detectOrientation.js";
import {setupFaceLandmarker} from "./faceDetection/faceDetectionSetup.js";
import {startFaceDetection} from "./faceDetection/faceDetection.js";
import {adjustLayoutForScreenSize} from "./uiElements/screensizeLayout.js";
let stream = null;
export const SERVER_URL =  "http://localhost:4000";//"https://face-recognition-be.onrender.com"; //

let video; let canvas; let overlayCanv; let overlayCtx;

// Send a message to start face recognition
export async function setupCamera() {
    if (!stream) {
        await navigator.mediaDevices.getUserMedia({audio: false, video: true});
        let allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = allDevices.filter(device => device.kind === "videoinput");
        const theDevice = videoInputDevices[0]
        if (theDevice) {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false // No audio capture
            });
        }
    }
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    overlayCanv = document.getElementById('overlay-canvas');

    const playPauseButton = document.getElementById('playPauseButton');
    if (!video || !canvas || !playPauseButton) {
        return null;
    }
    video.srcObject = stream

    return new Promise((resolve, reject) => {
        // Check if metadata is already loaded
        if (video.readyState > 1) {
            try {
                const cropSize = Math.min(video.videoWidth, video.videoHeight);
                canvas.width = cropSize;
                canvas.height = cropSize;
                overlayCanv.width = cropSize;
                overlayCanv.height = cropSize;
                overlayCtx = overlayCanv.getContext('2d');
                overlayCtx.fillStyle = 'rgba(0,0,0,.8)'
                overlayCtx.fillRect(0,0, overlayCanv.width, overlayCanv.height)
                video.play().then(() => {
                    console.log(`Video captured. Resolution: ${video.videoWidth} x ${video.videoHeight}`);
                    setupPlayPause(video, canvas);
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
                    overlayCanv.width = cropSize;
                    overlayCanv.height = cropSize;
                    overlayCtx = overlayCanv.getContext('2d');
                    overlayCtx.fillStyle = 'rgba(0,0,0,0)'
                    overlayCtx.fillRect(0,0, overlayCanv.width, overlayCanv.height)

                    await video.play();
                    console.log(`Video captured. Resolution: ${video.videoWidth} x ${video.videoHeight}`);
                    setupPlayPause(video, canvas);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
        }
    });
}

async function main() {
    adjustLayoutForScreenSize()
    setupLandingPage();
    await setupFaceLandmarker()
    activateEnterButton()
}

export async function resetNewDB() {
    const randomImageArr = await getRandomImages()
    await createImageGrid(randomImageArr, abortController)
}

export function enterMainPage(){
    startShuffle()
    startFaceDetection(video,canvas)
    // startFaceRecognition();
    fadeoutOverlay()

}

window.onload = main() //cropImagesParent(200);
window.addEventListener('orientationchange', handleOrientationChange);