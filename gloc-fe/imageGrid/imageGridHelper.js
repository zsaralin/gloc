import {
    clearRecognitionIntervals,
    killController,
    resetAbortController,
    resetGrid
} from "../faceRecognition/faceRecognition.js";
import {isMobile} from "../uiElements/displaySize.js";

let numPhotos = 35;
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
    // if (firstRun || prevNumPhotos !== numPhotos) {
    //     firstRun = false;
    //     let numPhotos0 = numPhotos-2

    //     const aspectRatio = width / height
    //     numCols = Math.floor(Math.sqrt(numPhotos0 * aspectRatio));
    //     numRows = Math.ceil(numPhotos0 / numCols);
    //
    //     // Adjust numCols to ensure each row has the same number of images
    //     // while (numPhotos0 % numRows !== 0) {
    //     //     numCols++;
    //     //     numRows = Math.ceil(numPhotos0 / numCols);
    //     // }
    //     let imageWidth = width / numCols;
    //     let imageHeight = height / numRows;
    //     let imgAspectRatio = imageWidth / imageHeight;
    //     // while (imgAspectRatio < 0.7 || imgAspectRatio > 1.3) {
    //     //     if (imgAspectRatio < 0.7) {
    //     //         numCols--;
    //     //     } else {
    //     //         numCols++;
    //     //     }
    //     //     numRows = Math.ceil(numPhotos0 / numCols);
    //     //     imageWidth = width / numCols;
    //     //     imageHeight = height / numRows;
    //     //     imgAspectRatio = imageWidth / imageHeight;
    //     // }
    // }
    if(!isMobile){
        numRows = 2;
        numCols = 6;
        numArrangedImages = numRows * numCols;
        return {numArrangedImages, numRows, numCols};
    } else {
        // Get the dimensions of the container
        const height = parseFloat(window.getComputedStyle(container).height);
        const width = parseFloat(window.getComputedStyle(container).width);
        // Desired aspect ratio
        const targetRatio = 12 / 16;

        // Set initial limits for rows and columns
        const minRows = 3, maxRows = 4;
        const minCols = 4, maxCols = 5;

        let bestFit = { numRows: minRows, numCols: minCols, diff: Infinity };

        // Explore all combinations within the given constraints
        for (let numRows = minRows; numRows <= maxRows; numRows++) {
            for (let numCols = minCols; numCols <= maxCols; numCols++) {
                // Calculate the dimensions of each grid item
                let itemWidth = width / numCols;
                let itemHeight = height / numRows;
                let currentRatio = itemWidth / itemHeight;

                // Measure how close the current ratio is to the target ratio
                let ratioDiff = Math.abs(currentRatio - targetRatio);

                // Update best fit if this configuration is closer to the target ratio
                if (ratioDiff < bestFit.diff) {
                    bestFit = { numRows, numCols, diff: ratioDiff };
                }
            }
        }

        // Log the adjusted values
        console.log(`Adjusted Grid: numRows = ${bestFit.numRows}, numCols = ${bestFit.numCols}`);
        numArrangedImages = bestFit.numRows * bestFit.numCols;

        return { numArrangedImages, numRows: bestFit.numRows, numCols: bestFit.numCols };
    }
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
