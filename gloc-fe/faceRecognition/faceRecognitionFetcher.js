import {SERVER_URL} from "../index.js";
import {getNumPhotos} from "../imageGrid/imageGridHelper.js";
import {currFace, resetCurrFace} from "../faceDetection/newFaces.js";
import {userID} from "../uuid.js";
import {shuffleActive} from "../imageGrid/startShuffle.js";

export let currFaceDescriptor;
async function fetchFaceRecognitionData() {
    try {
        const response = await fetch(`${SERVER_URL}/match`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({photo: currFace, numPhotos: getNumPhotos(), uuid : userID}),
        });
        let data = await response.json();

        while(data === null){
            const response = await fetch(`${SERVER_URL}/match`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({photo: currFace, numPhotos: getNumPhotos()}),
            });
            data = await response.json();
        }
        currFaceDescriptor = data;
    } catch (error) {
        console.error('Error during fetch:', error);
        throw error;
    }
}

let recognitionInterval; // Variable to store the interval ID

export async function continuousFaceRecognition() {
    const FACE_RECOG_INTERVAL = document.getElementById('refresh-number').value; //grab face recognition every 2 seconds
    await fetchFaceRecognitionData();
    recognitionInterval = setTimeout(() => {
            continuousFaceRecognition(); // Call the function recursively
    }, FACE_RECOG_INTERVAL * 1000); // Convert seconds to milliseconds
}

export function clearCurrFaceDescriptor(){
    currFaceDescriptor = null
}