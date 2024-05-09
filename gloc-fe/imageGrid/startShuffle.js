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
                    resolve();
                }, shuffleDur - elapsedTime);
            } else {
                clearInterval(shuffleIntervalId);
                shuffleIntervalId = null;
                shuffleActive = false;
                resolve();
            }
        } else {
            resolve();
        }
    });
}

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

// export function initializeShuffleUIElements() {
//     const slider = document.getElementById("shuffle-slider");
//     shuffleSpeed = parseInt(slider.value);
//     slider.addEventListener("input", function () {
//         shuffleSpeed = parseInt(slider.value); // Convert to integer and update updateCount
//         clearRecognitionIntervals()
//     });
//     document.getElementById('sporadicShuffle').addEventListener('change', setSporadicUpdate);
//     setSporadicUpdate();
// }
//
// function setSporadicUpdate() {
//     const checkbox = document.getElementById('sporadicShuffle');
//     sporadicUpdate = checkbox.checked;
// }