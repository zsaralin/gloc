import {
    abortController,
    clearRecognitionIntervals,
    resetAbortController,
    startFaceRecognition
} from "../faceRecognition/faceRecognition.js";
import {startFaceDetection} from "../faceDetection/faceDetection.js";
import {shuffleActive} from "../imageGrid/startShuffle.js";
import {startNewFaces} from "../faceDetection/drawFaces.js";
import {resetCurrFace} from "../faceDetection/newFaces.js";
import {clearCurrFaceDescriptor} from "../faceRecognition/faceRecognitionFetcher.js";

export function setupPlayPause(video) {
    const playPauseButton = document.getElementById('playPauseButton');
    playPauseButton.addEventListener('click', () => togglePlayPause(video));
}

function togglePlayPause(video) {
    if(shuffleActive){
        return;
    }
    if (video && video.readyState >= 2) {
        if (video.paused) {
            resetAbortController();
            startNewFaces()
            video.play();
            clearRecognitionIntervals();
            startFaceRecognition(); // Start recognition again
            startFaceDetection(video);

        } else {
            video.pause();
            clearRecognitionIntervals();
            abortController.abort();
            resetCurrFace()
            clearCurrFaceDescriptor()
        }
        updatePlayPauseButtonState(video);
    }
}

function updatePlayPauseButtonState(video) {
    console.log('vodeo state ' + video.paused)
    const pauseIcon = document.getElementById('play-icon');
    const playIcon = document.getElementById('pause-icon');
    if (video.paused) {
        playIcon.style.display = 'flex';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'flex';
    }
}