
import {isMobile} from "../uiElements/screensizeLayout.js";

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
    if(!isMobile){
        numRows = 3;
        numCols = 8;
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

        numArrangedImages = bestFit.numRows * bestFit.numCols;

        return { numArrangedImages, numRows: bestFit.numRows, numCols: bestFit.numCols };
    }
}