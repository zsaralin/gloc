import {arrangeBottomGrid} from "./imageGridHelper.js";
import {loadImages} from "./imageLoader.js";
import {createImageItemContainer} from "./createImageContainer.js";

let loadedImages;
export async function createImageGrid(imagesDataArray, abortController) {
    try {
        const loadedImages = await loadImages(imagesDataArray);
        const [topImages, bottomImages] = [loadedImages.slice(0, 3), loadedImages.slice(2)];
        const totalImages = loadedImages.length; // Total number of images
        await addTopImages(topImages, imagesDataArray.slice(0, 3), totalImages, abortController);
        await addBottomImages(bottomImages, imagesDataArray.slice(2), totalImages, topImages.length, abortController);
    } catch (error) {
        throw error;
    }
}

async function addTopImages(images, imageData, totalImages, abortController) {
    const container = document.getElementById('top-image-container');
    const videoContainer = document.getElementById('video-container');
    container.style.height = window.getComputedStyle(videoContainer).height;
    const opacityVal = document.getElementById('opacity-slider').value

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image) return;
        const opacity = 1 - ((1-opacityVal) / (totalImages - 1)); // Adjust for total images and index

        const imageElement = createImageItemContainer(image, i, imageData, opacity);
        container.appendChild(imageElement);
    }
}

async function addBottomImages(images, imageData, totalImages, startIndex, abortController) {
    const container = document.getElementById('bottom-image-container');
    container.style.height = `calc(100vh - ${document.getElementById('top').offsetHeight}px)`;
    console.log('Container height: ' + container.style.height);

    const containerHeight = parseFloat(window.getComputedStyle(container).height);
    const { numArrangedImages, numRows, numCols } = arrangeBottomGrid(container);
    const imagesToProcess = images.slice(0, numArrangedImages);

    const opacityVal = document.getElementById('opacity-slider').value
    let currRow;
    for (let i = 0; i < imagesToProcess.length; i++) {
        console.log('Adding bottom image');
        if (!currRow || i % numCols === 0) {
            currRow = createNewRow(container);
        }

        const image = imagesToProcess[i];
        if (!image) return;
        const overallIndex = startIndex + i; // Adjust index based on offset from top images

        // Calculate opacity: starts at 100% for the first image and linearly decreases to 50% for the last image
        const opacity = 1 - ((1-opacityVal) * overallIndex / (totalImages - 1)); // Adjust for total images and index

        const imageElement = createImageItemContainer(image, i, imageData, opacity);
        currRow.appendChild(imageElement);
    }
    adjustRowHeights(container);
}



// make sure bottom container does not exceed height of display
function adjustRowHeights(container) {
    const rows = container.querySelectorAll('.grid-row');
    let totalRowHeight = 0;

    rows.forEach(row => {
        totalRowHeight += row.offsetHeight;
    });

    if (totalRowHeight > container.clientHeight) {
        const heightDifference = totalRowHeight - container.clientHeight;
        const reductionPerRow = heightDifference / rows.length;

        rows.forEach(row => {
            const newHeight = row.offsetHeight - reductionPerRow;
            row.style.height = `${newHeight}px`;
        });
    }
}

function createNewRow(container){
    const newRow = document.createElement('div');
    newRow.className = 'grid-row';
    container.appendChild(newRow);
    return newRow
}