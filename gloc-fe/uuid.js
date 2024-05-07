// Generate a UUID in JavaScript
import {SERVER_URL} from "./index";
import {currFace} from "./faceDetection/newFaces";
import {getNumPhotos} from "./imageGrid/imageGridHelper";

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Send this userID along with requests to the server
async function createScores() {
    let userID = generateUUID();

    const response = await fetch(`${SERVER_URL}/create-scores`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userID /* your score data here */})
    });
}