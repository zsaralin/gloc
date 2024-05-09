import {
    clearRecognitionIntervals,
    killController,
    resetAbortController,
    resetGrid
} from "../faceRecognition/faceRecognition.js";

let numPhotos = 17;
let prevNumPhotos = numPhotos;
let firstRun = true;
export let numArrangedImages;
let numRows;
let numCols;

export function setFirstRun(){
    firstRun = true;
}
export function getNumPhotos(){
    return numPhotos;
}
export function setNumPhotos(i){
    numPhotos = i;
}

export function arrangeBottomGrid(container) {
    if (firstRun || prevNumPhotos !== numPhotos) {
        firstRun = false;
        let numPhotos0 = numPhotos-2
        const height = parseFloat(window.getComputedStyle(container).height);
        const width = parseFloat(window.getComputedStyle(container).width);
        console.log(height, width)
        const aspectRatio = width / height
        numCols = Math.floor(Math.sqrt(numPhotos0 * aspectRatio));
        numRows = Math.ceil(numPhotos0 / numCols);

        // Adjust numCols to ensure each row has the same number of images
        while (numPhotos0 % numRows !== 0) {
            numCols++;
            numRows = Math.ceil(numPhotos0 / numCols);
        }
        let imageWidth = width / numCols;
        let imageHeight = height / numRows;
        let imgAspectRatio = imageWidth / imageHeight;
        while (imgAspectRatio < 0.7 || imgAspectRatio > 1.3) {
            if (imgAspectRatio < 0.7) {
                numCols--;
            } else {
                numCols++;
            }
            numRows = Math.ceil(numPhotos0 / numCols);
            imageWidth = width / numCols;
            imageHeight = height / numRows;
            imgAspectRatio = imageWidth / imageHeight;
        }
        console.log('NUNM  ' + numCols + ' amd ' + numRows )

        console.log(imgAspectRatio)
    }

    numArrangedImages = numRows * numCols;
    return {numArrangedImages, numRows, numCols};
}

export function initNumPhotoSlider() {
    const photoSlider = document.getElementById("photo-slider");
    const sliderValue = document.getElementById("photo-slider-value");

    // Update the slider value display initially
    sliderValue.textContent = photoSlider.value;

    // Add an event listener to update the display and updateCount when the slider value changes
    photoSlider.addEventListener("input", function () {
        sliderValue.textContent = photoSlider.value;
        prevNumPhotos = numPhotos;

        numPhotos = parseInt(photoSlider.value); // Convert to integer and update updateCount
        resetGrid()

        killController();
        resetAbortController();
        clearRecognitionIntervals()

    });
}
