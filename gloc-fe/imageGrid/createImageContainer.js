import {getCurrentZoomValue} from "../uiElements/zoom.js";
import {isMobile} from "../uiElements/screensizeLayout.js";
import {numArrangedImages} from "./imageGridHelper.js";

let scaleFactor = 0.05; // lower the val, lower the %

export function createImageItemContainer(image, index, imageData, opacity) {
    const imageItemContainer = document.createElement('div');
    imageItemContainer.className = 'image-item-container';


    const currentImage = document.createElement('img');
    currentImage.className = 'current-image';
    currentImage.src = image.src;
    if (opacity) { // Only set width if it's defined
        currentImage.style.opacity = opacity;
    }
    currentImage.onload = () => {
        applyTransforms(currentImage);
    };

    const nextImage = document.createElement('img');
    nextImage.className = 'next-image';
    nextImage.src = image.src;
    nextImage.onload = () => {
        applyTransforms(nextImage);
    };
    const progressBarBg = document.createElement('div');
    progressBarBg.className = 'progress-bar-background';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const bottomTextOverlay = createBottomTextOverlay(index, imageData);
    const topTextOverlay = createTopTextOverlay(index, imageData, progressBar);

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    // Append children to the container
    imageItemContainer.appendChild(nextImage);
    imageItemContainer.appendChild(bottomTextOverlay);
    imageItemContainer.appendChild(topTextOverlay);
    imageItemContainer.appendChild(currentImage);
    imageItemContainer.appendChild(overlay);
    imageItemContainer.appendChild(progressBarBg); // Add the progress bar to the container
    imageItemContainer.appendChild(progressBar); // Add the progress bar to the container


    return imageItemContainer;
}

function applyTransforms(image) {
    const xOffsetPercent = parseFloat(document.getElementById('xoffset-slider').value); // Assuming input IDs
    const yOffsetPercent = parseFloat(document.getElementById('yoffset-slider').value);
    const zoomValue = getCurrentZoomValue(); // Retrieve zoom value

    // Convert percentages to pixels based on image width
    const xOffset = (xOffsetPercent / 100) * image.width;
    const yOffset = (yOffsetPercent / 100) * image.width;

    // Construct the transformation string
    const transformSettings = `translate(${xOffset}px, ${yOffset}px) scale(${zoomValue / 100})`;

    // Apply transformations
    image.style.transformOrigin = "50% 50%";
    image.style.transform = transformSettings;
}

// Helper function to create a text overlay based on the index
export function createBottomTextOverlay(i, imagesArray) {
    const textOverlay = document.createElement('div');
    textOverlay.className = 'bottom-text-overlay';
    updateBottomTextOverlay(textOverlay, i ,imagesArray)
    return textOverlay;
}

export function createTopTextOverlay(i, imagesArray, progressBar) {
    const textOverlay = document.createElement('div');
    textOverlay.className = 'top-text-overlay';
    updateTopTextOverlay(textOverlay, i ,imagesArray, progressBar)
    return textOverlay;
}

export function updateTopTextOverlay(textOverlay, i, imagesArray, progressBar) {
    const similarityCheckbox = document.getElementById('similarity');
    const scaledSimilarityCheckbox = document.getElementById('scaledSimilarity');
    try {
        if (!imagesArray || imagesArray.length === 0) {
            throw new Error('imagesArray is empty or not defined');
        }
        if (!textOverlay) {
            throw new Error('textOverlay is not defined');
        }

        const image = imagesArray[i % imagesArray.length];
        const similarity = image.distance.toFixed(2);
        const adjustedI = imagesArray.length <= (isMobile ? 2 : 3 ) ? i : i + (isMobile ? 2 : 3 )
        let dynamicScaleFactor = scaleFactor * (1 - (adjustedI / (numArrangedImages *2))); // Linear decrease
        const scaledSimilarity = (image.distance * dynamicScaleFactor).toFixed(2);
        function updateDisplay() {
            // Always create divs for both similarity and scaled similarity.
            let content = '';
            let similarityDisplay = similarityCheckbox.checked ? 'block' : 'none';
            let scaledSimilarityDisplay = scaledSimilarityCheckbox.checked ? 'block' : 'none';
            // Adjust the content for the first image if conditions are met
            if (imagesArray.length <= (isMobile ? 2 : 3 ) && i === 0) {
                textOverlay.style.right = 'auto';
                textOverlay.style.left = '4px '
                content += `<div class="similarity" style="display: ${similarityDisplay};">Similarity: ${similarity}%</div>`;
                content += `<div class="scaled-similarity" style="display: ${scaledSimilarityDisplay};">Level of Confidence: ${scaledSimilarity}%</div>`;
                content += `<div class="scaled-similarity" style = "padding-top: 2px"> (Closest Match) </div>`;


            } else {
                // Adjust the content for other images
                content += `<div class="similarity" style="display: ${similarityDisplay};">${similarity}%</div>`;
                content += `<div class="scaled-similarity" style="display: ${scaledSimilarityDisplay};">${scaledSimilarity}%</div>`;
            }

            // Update the innerHTML of the textOverlay
            textOverlay.innerHTML = content;
            // Now update the progress bar based on scaledSimilarity
            let progressHeight = parseFloat(scaledSimilarity) * 10;
            progressBar.style.height = `${progressHeight}%`;
        }

        // Call updateDisplay to ensure it uses the latest checkbox states
        updateDisplay();

    } catch (error) {
        console.error(error);
        // Optionally, update the textOverlay with a default or error message
        textOverlay.innerHTML = `<div class="error">Error updating overlay. Please try again.</div>`;
    }
}

export function updateBottomTextOverlay(textOverlay, i, imagesArray){
    try {
        if (!imagesArray || imagesArray.length === 0) {
            throw new Error('imagesArray is empty or not defined');
        }
        if (!textOverlay) {
            throw new Error('textOverlay is not defined');
        }

        const image = imagesArray[i % imagesArray.length];
        function updateDisplay() {
            // Always create divs for both similarity and scaled similarity.
            let content = '';

            if (imagesArray.length <= (isMobile ? 2 : 3 ) && i === 0) {
                content += `<div class="name"> ${image.name}</div>`;
                content += '[No. Records: 1]'
            } else {
                content += `<div class="name"> ${image.name} [1]</div>`;
            }
            // Update the innerHTML of the textOverlay
            textOverlay.innerHTML = content;

        }

        // Call updateDisplay to ensure it uses the latest checkbox states
        updateDisplay();

    } catch (error) {
        console.error(error);
        // Optionally, update the textOverlay with a default or error message
        textOverlay.innerHTML = `<div class="error">Error updating overlay. Please try again.</div>`;
    }
}