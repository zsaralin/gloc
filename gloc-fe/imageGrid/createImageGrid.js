import {arrangeBottomGrid} from "./imageGridHelper.js";
import {loadImages} from "./imageLoader.js";
import {createImageItemContainer} from "./createImageContainer.js";

let loadedImages;
export async function createImageGrid(imagesDataArray, abortController) {
    try {

        // if(!loadedImages) {
            loadedImages= await loadImages(imagesDataArray);
        // }
        const [topImages, bottomImages] = [loadedImages.slice(0, 2), loadedImages.slice(2)];
        const [topImageData, bottomImageData] = [imagesDataArray.slice(0, 2), imagesDataArray.slice(2)];

        // await Promise.all([
            await addTopImages(topImages, topImageData, abortController),
            await addBottomImages(bottomImages, bottomImageData, abortController)
        // ]);
    } catch (error) {
        throw error;
    }
}

async function addTopImages(images, imageData) {
    const container = document.getElementById('top-image-container');
    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image) return;
        container.appendChild(createImageItemContainer(image, i, imageData));
    }
}
async function addBottomImages(images, imageData, abortController) {
    const container = document.getElementById('bottom-image-container');
    container.style.height = `calc(100svh - ${document.getElementById('top').offsetHeight}px)`;
    const containerHeight = parseFloat(window.getComputedStyle(container).height);

    // Get the computed style after setting the height
    const { numArrangedImages, numRows, numCols } = arrangeBottomGrid(container);
    const imagesToProcess = images.slice(0, numArrangedImages);
    let currRow;
    for (let i = 0; i < imagesToProcess.length; i++) {
        if (!currRow || i % numCols === 0) {
            currRow = createNewRow(container);
        }

        const image = imagesToProcess[i];
        if (!image) return;
        currRow.appendChild(createImageItemContainer(image, i, imageData));
    }
    adjustRowHeights(container)
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
