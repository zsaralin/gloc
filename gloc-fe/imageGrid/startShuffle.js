import {abortController, clearRecognitionIntervals} from "../faceRecognition/faceRecognition.js";
import {updateShuffle} from "./updateShuffle.js";
import {loadImages} from "./imageLoader.js";
import {SERVER_URL} from "../index.js";

let randomImageArr;
let shuffleIntervalId;
let shuffleSpeed; // Default speed in milliseconds
export let shuffleActive = true;

let shuffleStartTime;

export async function stopShuffle() {
    let shuffleDur = document.getElementById('shuffle-dur-slider').value * 1000
    return new Promise((resolve) => {
        if (shuffleIntervalId) {
            const elapsedTime = Date.now() - shuffleStartTime;
            if (elapsedTime < shuffleDur) {
                setTimeout(() => {
                    clearInterval(shuffleIntervalId);
                    shuffleIntervalId = null;
                    shuffleActive = false;
                    const overlay = document.getElementById('progress-overlay')
                    overlay.style.opacity = '0'
                    setTimeout(() => {
                        overlay.style.display = 'none';
                    }, 1000);
                    resolve();
                }, shuffleDur - elapsedTime);
            } else {
                clearInterval(shuffleIntervalId);
                shuffleIntervalId = null;
                shuffleActive = false;
                document.getElementById('progress-overlay').style.opacity = '0'
                resolve();
            }
        } else {
            resolve();
        }
    });
}
let shuffleEndTime;
export function startShuffle() {
    let shuffleDur = document.getElementById('shuffle-dur-slider').value * 1000

    const shuffleSpeed = document.getElementById('shuffle-slider').value
    if (!shuffleIntervalId) {
        animateProgressBar(shuffleDur)
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

function animateProgressBar(duration) {
    const progressBar = document.getElementById('progress-bar');
    const statusMessage = document.getElementById('status-message');
    const startTime = performance.now();
    const prompts = [
        "Extracting facial landmarks...",
        "Comparing biometric data...",
        "Searching through database for similarities...",
        "Retrieving top matches"
    ];
    const segmentDuration = duration / prompts.length; // Duration for each prompt
    let lastPromptIndex = -1;

    function updateProgress(timestamp) {
        const elapsedTime = timestamp - startTime;
        const normalizedTime = elapsedTime / (duration ); // Normalize time to range 0-1
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
            console.log("Progress animation completed.");
        }
    }

    requestAnimationFrame(updateProgress);
}