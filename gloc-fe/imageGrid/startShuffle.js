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
export async function startShuffle() {
    const shuffleSpeed = document.getElementById('shuffle-slider').value
    const loadedImages = await loadImages(randomImageArr);
    if (!shuffleIntervalId) {
        shuffleActive = true;
        shuffleStartTime = Date.now();
        shuffleIntervalId = setInterval(() => updateShuffleLoop(loadedImages), shuffleSpeed); // Pass the loaded images to the loop
    }
    let shuffleDur = document.getElementById('shuffle-dur-slider').value * 1000

    animateProgressBar(shuffleDur)
}
export function updateShuffleLoop(loadedImages) {
    if (shuffleActive && loadedImages) {
        setTimeout(() => {
            updateShuffle(loadedImages, randomImageArr);
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
    const initialProgress = 20;  // Initial progress percentage to animate to
    const prompts = [
        "Extracting facial landmarks...",
        "Sending numerical description...",
        "Comparing biometric data...",
        "Searching through database for similarities...",
        "Retrieving top matches"
    ];
    const initialDuration = duration * 0.5; // Allocate 10% of the total duration for initial animation

    function animateInitialProgress() {
        const startInitialTime = performance.now();

        function updateInitialProgress(timestamp) {
            const elapsedTime = timestamp - startInitialTime;
            const normalizedTime = elapsedTime / initialDuration; // Normalize time to range 0-1
            const easedProgress = easeInOutCubic(normalizedTime); // Apply easing function
            progressBar.value = Math.min(initialProgress, easedProgress * initialProgress); // Ensure the value doesn't exceed initialProgress%

            if (normalizedTime < 1) {
                requestAnimationFrame(updateInitialProgress);
            } else {
                statusMessage.innerText = prompts[1];
                checkForFaceDescriptor(performance.now()); // Begin checking for the face descriptor after initial animation
            }
        }

        requestAnimationFrame(updateInitialProgress);
    }

    function checkForFaceDescriptor(startTime) {
        function check() {
            if (currFaceDescriptor && currFaceDescriptor.length > 0) {
                const faceDetectedTime = performance.now(); // Capture the time when the face is detected
                startProgressAnimation(faceDetectedTime, Math.max(1000,duration - (faceDetectedTime - startTime)));
            } else {
                setTimeout(check, 100); // Check every 100 milliseconds
            }
        }
        check();
    }

    function startProgressAnimation(startAnimationTime, remainingDuration) {
        let lastPromptIndex = 1;

        function updateProgress(timestamp) {
            const elapsedTime = timestamp - startAnimationTime;
            const normalizedTime = elapsedTime / remainingDuration; // Normalize time to range 0-1
            const easedProgress = easeInOutCubic(normalizedTime); // Apply easing function
            progressBar.value = Math.min(100, initialProgress + easedProgress * (100 - initialProgress)); // Calculate the rest of the progress

            const currentPromptIndex = Math.floor((initialProgress / 100 + easedProgress * (1 - initialProgress / 100)) * prompts.length);
            if (currentPromptIndex !== lastPromptIndex && currentPromptIndex < prompts.length) {
                statusMessage.innerText = prompts[currentPromptIndex];
                lastPromptIndex = currentPromptIndex;
            }

            if (normalizedTime < 1) {
                requestAnimationFrame(updateProgress);
            } else {
                progressBar.value = 100; // Ensure the bar reaches 100%
                progressBarComplete = true; // Set the progress completion flag

            }
        }

        requestAnimationFrame(updateProgress);
    }

    animateInitialProgress();
}