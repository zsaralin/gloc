import {abortController, clearRecognitionIntervals} from "../faceRecognition.js";
import {updateShuffle} from "./updateShuffle.js";
import {loadImages} from "./imageLoader.js";
import {SERVER_URL} from "../index.js";

let randomImageArr;
let shuffleIntervalId;
let shuffleSpeed; // Default speed in milliseconds
export let sporadicUpdate;
export let shuffleActive = true;

const minShuffleTime = 2000; // Minimum shuffle time in milliseconds
let shuffleStartTime;

export async function stopShuffle() {
    return new Promise((resolve) => {
        if (shuffleIntervalId) {
            const elapsedTime = Date.now() - shuffleStartTime;
            if (elapsedTime < minShuffleTime) {
                setTimeout(() => {
                    clearInterval(shuffleIntervalId);
                    shuffleIntervalId = null;
                    shuffleActive = false;
                    resolve();
                }, minShuffleTime - elapsedTime);
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
        console.log('getting new random images')
        const response = await fetch(`${SERVER_URL}/random`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
        });
        randomImageArr = await response.json()
        // Shuffle the array
        shuffleArray(randomImageArr);

    }
    console.log('done getting random image');
    return randomImageArr;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function initializeShuffleUIElements() {
    const slider = document.getElementById("shuffle-slider");
    const sliderValue = document.getElementById("shuffle-slider-value");
    sliderValue.textContent = slider.value + 's';
    shuffleSpeed = parseInt(slider.value);
    slider.addEventListener("input", function () {
        sliderValue.textContent = slider.value + 's';
        shuffleSpeed = parseInt(slider.value); // Convert to integer and update updateCount
        clearRecognitionIntervals()
    });
    document.getElementById('sporadicShuffle').addEventListener('change', setSporadicUpdate);
    setSporadicUpdate();
}

function setSporadicUpdate() {
    const checkbox = document.getElementById('sporadicShuffle');
    sporadicUpdate = checkbox.checked;
}
