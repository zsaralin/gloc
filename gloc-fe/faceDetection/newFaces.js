import {
    abortController,
    clearRecognitionIntervals,
    killController,
    resetAbortController, restartFaceRecogCalls, restartFaceRecogCalls2,
    startFaceRecognition
} from "../faceRecognition/faceRecognition.js";
import {clearCurrFaceDescriptor} from "../faceRecognition/faceRecognitionFetcher.js";
import {createNewScoresDB, deletePrevScoresDB, generateUUID} from "../uuid.js";
import {shuffleActive} from "../imageGrid/startShuffle.js";

export let newFace = false;
export let currFace = null;


export function setCurrFace(mediapipeResult, imageDataUrl){
    if (!currFace && mediapipeResult && mediapipeResult.faceLandmarks.length > 0 && imageDataUrl) {
        currFace = imageDataUrl
        newFace = true;
        console.log('new face detected')
        generateUUID()
        // createNewScoresDB()
        resetAbortController()
        startFaceRecognition()
    } else if(mediapipeResult && mediapipeResult.faceLandmarks.length > 0){
        currFace = imageDataUrl
    } else if (!shuffleActive){
        currFace = null
        clearCurrFaceDescriptor()
        clearRecognitionIntervals()
        restartFaceRecogCalls2()
        abortController.abort();
        deletePrevScoresDB()

    }
}

export function setNewFace(i){
    newFace =  i
}

export function resetCurrFace() {
    currFace = null;
}