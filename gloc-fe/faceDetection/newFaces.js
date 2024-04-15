import {
    abortController,
    clearRecognitionIntervals,
    killController,
    resetAbortController, restartFaceRecogCalls, restartFaceRecogCalls2,
    startFaceRecognition
} from "../faceRecognition.js";
import {clearCurrFaceDescriptor} from "../faceRecognitionFetcher.js";

export let newFace = false;
export let currFace = null;

export function setCurrFace(mediapipeResult, imageDataUrl){
    if (!currFace && mediapipeResult && mediapipeResult.faceLandmarks.length > 0 && imageDataUrl) {
        currFace = imageDataUrl
        newFace = true;
        console.log('new face detected')
        resetAbortController()
        startFaceRecognition()
    } else if(mediapipeResult && mediapipeResult.faceLandmarks.length > 0){
        currFace = imageDataUrl
    } else {
        console.log('CLEARING THE CURRFACE VAR')
        currFace = null
        clearCurrFaceDescriptor()
        clearRecognitionIntervals()
        restartFaceRecogCalls2()
        abortController.abort();
    }
}

export function setNewFace(i){
    newFace =  i
}

export function resetCurrFace() {
    currFace = null;
}