import {
    clearRecognitionIntervals,
    killController,
    resetAbortController,
    resetGrid
} from "../faceRecognition.js";

let numPhotos = 15;
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

        const height = parseFloat(window.getComputedStyle(container).height);
        const width = parseFloat(window.getComputedStyle(container).width);
        const aspectRatio = width / height

        numCols = Math.ceil(Math.sqrt(numPhotos * aspectRatio));
        numRows = Math.ceil(numPhotos / numCols);

        // Adjust numCols to ensure each row has the same number of images
        while (numPhotos % numRows !== 0) {
            numCols++;
            numRows = Math.ceil(numPhotos / numCols);
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
            numRows = Math.ceil(numPhotos / numCols);
            imageWidth = width / numCols;
            imageHeight = height / numRows;
            imgAspectRatio = imageWidth / imageHeight;
        }
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

