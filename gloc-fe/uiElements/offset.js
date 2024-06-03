import { getCurrentZoomValue } from "./zoom.js";

let xOffsetSlider, yOffsetSlider;
// let xOffsetPercent = 0; // Initial x offset percentage
// let yOffsetPercent = 0; // Initial y offset percentage

function initOffsets() {
    xOffsetSlider = document.getElementById('xoffset-slider');
    yOffsetSlider = document.getElementById('yoffset-slider');

}

export function handleZoomAndOffset() {
    if(!yOffsetSlider || !xOffsetSlider){
        initOffsets()
    }
    const imageContainer = document.getElementById('top-image-container');

    if (imageContainer) {
        const imageItemContainers = imageContainer.querySelectorAll('.image-item-container');
        imageItemContainers.forEach(container => {
            const image = container.querySelector('.current-image');
            if (image) {
                applyTransform(image, true);
            }
        });
    }

    const numRows = document.querySelectorAll('.grid-row').length;
    const numCols = document.querySelectorAll('.grid-row:nth-child(1) .image-item-container').length;

    // Loop through each image container and update the image source
    for (let rowIndex = 1; rowIndex <= numRows; rowIndex++) {
        for (let colIndex = 1; colIndex <= numCols; colIndex++) {
            // Get the image container at the specified row and column
            const imageContainer = document.querySelector(`.grid-row:nth-child(${rowIndex}) .image-item-container:nth-child(${colIndex})`);

            if (imageContainer) {
                const image = imageContainer.querySelector('.current-image');
                applyTransform(image, false)
            }}
    }
}

function applyTransform(image, isTop) {
    let xOffsetPercent = parseFloat(xOffsetSlider.value);
    let yOffsetPercent = parseFloat(yOffsetSlider.value);

    const zoomValue = isTop ? document.getElementById('zoom-slider-top').value : document.getElementById('zoom-slider-bottom').value; // Assuming zoom value is needed for scaling
    const xOffset = (xOffsetPercent / 100) * image.clientWidth; // Convert percent to pixels based on image width
    const yOffset = (yOffsetPercent / 100) * image.clientHeight; // Convert percent to pixels based on image height
    const transformSettings = `translate(${xOffset}px, ${yOffset}px) scale(${zoomValue / 100})`;

    image.style.transformOrigin = "50% 50%";
    image.style.transform = transformSettings;
}

export function getCurrentOffsetValues() {
    if(!yOffsetSlider || !xOffsetSlider){
        initOffsets()
    }
    return { xOffset:  parseFloat(xOffsetSlider.value), yOffset: parseFloat(yOffsetSlider.value) };
}
