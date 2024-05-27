import {updateImageGrid} from "../imageGrid/updateImageGrid.js";
import {updateFirst} from "../imageGrid/updateShuffle.js";
import {currFace} from "../faceDetection/newFaces.js";
import {continuousFaceRecognition, currFaceDescriptor} from "./faceRecognitionFetcher.js";

let isProcessing = false; // allow only one fetch request at a time
let isFirstUpdate = true;

let timeSlider;
let refreshTime;

// let intervalId;
// let recognitionIntervals = []; // Use an array to store interval IDs

export async function startFaceRecognition() {
    if (!refreshTime) {
        await continuousFaceRecognition();
        handleRefreshTime()
    }

    // clearInterval(intervalId);

    while (!currFace) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // if (recognitionIntervals.length === 0) {
    //     await continuousFaceRecognition();
    // }

    while (!currFaceDescriptor || currFaceDescriptor.length === 0 ) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));

    // await performRecognitionTask();
    setRecognitionInterval();
}

async function performRecognitionTask() {
    try {
        if (abortController.signal.aborted) {
            clearRecognitionIntervals();
            return;
        }

        if (!isProcessing) {
            isProcessing = true;
            if (isFirstUpdate) {
                isFirstUpdate = false;
                await updateFirst(currFaceDescriptor, abortController);
            } else {
                await updateImageGrid(currFaceDescriptor, abortController);
            }
            isProcessing = false;
        }
    } catch (error) {
        console.error('Error during recognition task:', error);
    }
}

async function setRecognitionInterval() {
    recognitionInterval.start(); // pass the refreshTime as seconds
}

const recognitionInterval = (function() {
    let timeoutId;

    async function runRecognition() {
        const startTime = performance.now();

        await performRecognitionTask();

        const endTime = performance.now();
        const taskDuration = endTime - startTime;
        const delay = Math.max(0, refreshTime * 1000 - taskDuration);

        timeoutId = setTimeout(() => runRecognition(refreshTime), delay);
    }

    return {
        start: function() {
            if (!timeoutId) {  // Prevent multiple instances running
                runRecognition();
            }
        },
        stop: function() {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        }
    };
})();

export function handleRefreshTime() {
    if (!timeSlider) timeSlider = document.getElementById("time-slider");
    refreshTime = timeSlider.value; // Convert to integer and update updateCount
    clearRecognitionIntervals()
}

export function clearRecognitionIntervals() {
    recognitionInterval.stop();

    // clearInterval(intervalId);
    // intervalId = null;
    // recognitionIntervals = [];
}

export let abortController = new AbortController();

export function resetAbortController() {
    abortController = new AbortController();
}

