import {SERVER_URL} from "../index.js";
import {getNumPhotos} from "../imageGrid/imageGridHelper.js";
import {currFace} from "../faceDetection/newFaces.js";
import {userID} from "../uuid.js";

export let currFaceDescriptor;
const RETRY_LIMIT = 5;  // Max retries before giving up
const RETRY_INTERVAL = 2000; // Retry every 2 seconds if data is null

async function fetchFaceRecognitionData() {
    let attempts = 0;
    while (attempts < RETRY_LIMIT) {
        try {
            const response = await fetch(`${SERVER_URL}/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photo: currFace, numPhotos: getNumPhotos(), uuid: userID }),
            });
            const data = await response.json();
            if (data !== null) {
                currFaceDescriptor = data;
                return;
            }
        } catch (error) {
            console.error('Error during face recognition fetch:', error);
            throw error;
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
    console.error('Failed to fetch valid face recognition data after retries.');
}

let recognitionInterval;
const FACE_RECOG_INTERVAL = 3000; // Run face recognition every 3 seconds

export async function continuousFaceRecognition() {
    await fetchFaceRecognitionData();
    recognitionInterval = setTimeout(continuousFaceRecognition, FACE_RECOG_INTERVAL);
}

export function clearCurrFaceDescriptor() {
    currFaceDescriptor = null;
}