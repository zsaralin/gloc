// import {onPlay} from "./playButton.js";
import {createImageGrid} from "../imageGrid/createImageGrid.js";
import {updateImageGrid} from "../imageGrid/updateImageGrid.js";
import {getNumPhotos} from "../imageGrid/imageGridHelper.js";
import {updateFirst} from "../imageGrid/updateShuffle.js";
import {stopShuffle} from "../imageGrid/startShuffle.js";
import {currFace} from "../faceDetection/newFaces.js";
import {SERVER_URL} from "../index.js";
import {continuousFaceRecognition, currFaceDescriptor} from "./faceRecognitionFetcher.js";

let isProcessing = false; // allow only one fetch request at a time
let isFirstUpdate = true;

let newGridArrangement = false;
let timeSlider;
let refreshTime;

let intervalId;
let recognitionIntervals = []; // Use an array to store interval IDs
let faceRecogCallsStarted = false;

export function resetGrid() {
    clearRecognitionIntervals()
    document.getElementById('top-image-container').innerHTML = document.getElementById('bottom-image-container').innerHTML = '';
    newGridArrangement = true;
}

function initTimeSlider() {
    timeSlider = document.getElementById("time-slider");
}

export function handleRefreshTime() {
    if (!timeSlider) initTimeSlider()
    refreshTime = timeSlider.value; // Convert to integer and update updateCount
    clearRecognitionIntervals()
    // startFaceRecognition(); // Restart face recognition with the new refresh time
}



export function restartFaceRecogCalls() {
    faceRecogCallsStarted = true;
    isProcessing = false;
}

export function restartFaceRecogCalls2() {
    faceRecogCallsStarted = false
}

export async function startFaceRecognition() {
    if (!refreshTime) handleRefreshTime()

    clearInterval(intervalId);

    while (!currFace) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100 milliseconds
    }
    if (!faceRecogCallsStarted) {
        faceRecogCallsStarted = true;
        await continuousFaceRecognition();
    }

    while (!currFaceDescriptor || currFaceDescriptor.length === 0 ) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 100 milliseconds
    }

    // Now start the regular face recognition
    await faceRecognition();
    clearInterval(intervalId);

    intervalId = setInterval(async () => {
        if (recognitionIntervals.length === 0) {
            recognitionIntervals.push(intervalId);
            await faceRecognition();
            recognitionIntervals.pop();
        }
    }, refreshTime * 1000);
}

export function clearRecognitionIntervals() {
    clearInterval(intervalId);
    intervalId = null;
    recognitionIntervals = [];
}

export function getRecognitionInterval() {
    return recognitionIntervals;
}

export let abortController = new AbortController();

export function resetAbortController() {
    abortController = new AbortController();
}

export function killController() {
    abortController.abort()
}

export function setIsFirstUpdate(i) {
    isFirstUpdate = i
}

async function faceRecognition() {
    try {
        if (isProcessing || abortController.signal.aborted) {
            clearRecognitionIntervals()
            return
        }
        // if (!currFaceDescriptor || currFaceDescriptor.length === 0) return
        isProcessing = true;
        if (isFirstUpdate) {
            isFirstUpdate = false;
            await updateFirst(currFaceDescriptor, abortController)
        } else if (newGridArrangement) {
            newGridArrangement = false;
            await createImageGrid(currFaceDescriptor, abortController)
        } else {
            // stopShuffle()
            await updateImageGrid(currFaceDescriptor, abortController)
        }
        isProcessing = false;
    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

