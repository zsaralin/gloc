import {abortController, clearRecognitionIntervals} from "../faceRecognition/faceRecognition.js";
import {updateShuffle} from "./updateShuffle.js";
import {loadImages} from "./imageLoader.js";
import {SERVER_URL} from "../index.js";
import {currFaceDescriptor} from "../faceRecognition/faceRecognitionFetcher.js";

let randomImageArr;
let shuffleIntervalId;
let shuffleSpeed; // Default speed in milliseconds
export let shuffleActive = true;

let shuffleStartTime;
let progressBarComplete = false;

export async function stopShuffle() {
    if(!shuffleActive) return
    return new Promise((resolve) => {
        let isResolved = false; // Flag to control the recursion after resolution

        function checkProgressAndStop() {
            if (!isResolved) {
                if (progressBarComplete && shuffleIntervalId) {
                    clearInterval(shuffleIntervalId);
                    shuffleIntervalId = null;
                    document.getElementById('progress-overlay').style.opacity = '0';

                    setTimeout(() => {
                        document.getElementById('progress-overlay').style.display = 'none';
                        shuffleActive = false;
                    }, 1000);

                    resolve(); // Resolve the promise
                    isResolved = true; // Set the flag as resolved to prevent further checks
                } else {
                    setTimeout(checkProgressAndStop, 20); // Check every 100 milliseconds
                }
            }
        }
        checkProgressAndStop();
    });
}
let shuffleEndTime;
export function startShuffle() {
    const shuffleSpeed = document.getElementById('shuffle-slider').value
    if (!shuffleIntervalId) {
        shuffleActive = true;
        shuffleStartTime = Date.now();
        shuffleIntervalId = setInterval(updateShuffleLoop, shuffleSpeed);
    }
}
export function updateShuffleLoop() {
    if (shuffleActive && randomImageArr) {
        setTimeout(() => {
            updateShuffle(randomImageArr);
        }, 0); // Zero milliseconds means it will be executed in the next event loop iteration    }
    }
}

export function clearRandomImages(){
    randomImageArr = null;
}

export async function  getRandomImages() {
    if(!randomImageArr) {
        const response = await fetch(`${SERVER_URL}/random`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
        });
        randomImageArr = await response.json()
        shuffleArray(randomImageArr);

    }
    return randomImageArr;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let timeToDetectFirstFace; // Declare a global variable to store the time to detect the first face

export function animateProgressBar(duration) {
    const progressBar = document.getElementById('progress-bar');
    const statusMessage = document.getElementById('status-message');
    const startTime = performance.now();  // Start time for the whole process
    const prompts = [
        "Extracting facial landmarks...",
        "Sending numerical description...",
        "Comparing biometric data...",
        "Searching through database for similarities...",
        "Retrieving top matches"
    ];

    function checkForFaceDescriptor() {
        if (currFaceDescriptor && currFaceDescriptor.length > 0) {
            const faceDetectedTime = performance.now(); // Capture the time when the face is detected
            timeToDetectFirstFace = faceDetectedTime - startTime; // Calculate the time taken to detect the first face
            startProgressAnimation();
        } else {
            // Check again after a delay
            setTimeout(checkForFaceDescriptor, 100); // Check every 100 milliseconds
        }
    }

    function startProgressAnimation() {
        const startTime = performance.now();
        let lastPromptIndex = -1;

        function updateProgress(timestamp) {
            const elapsedTime = timestamp - startTime;
            const normalizedTime = elapsedTime / duration; // Normalize time to range 0-1
            const easedProgress = easeInOutCubic(normalizedTime); // Apply easing function
            progressBar.value = Math.min(100, easedProgress * 100); // Ensure the value doesn't exceed 100%

            // Determine the current prompt index based on eased progress
            const currentPromptIndex = Math.floor(easedProgress * prompts.length);

            // Update the status message if we've moved to the next prompt
            if (currentPromptIndex !== lastPromptIndex && currentPromptIndex < prompts.length) {
                statusMessage.innerText = prompts[currentPromptIndex];
                lastPromptIndex = currentPromptIndex;
            }

            // Continue the animation until the progress completes
            if (normalizedTime < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                progressBarComplete = true; // Set the progress completion flag
            }
        }

        requestAnimationFrame(updateProgress);
    }

    checkForFaceDescriptor();
}