import {getCurrentZoomValue} from "../uiElements/zoom.js";
import {isMobile} from "../uiElements/screensizeLayout.js";
import {numArrangedImages} from "./imageGridHelper.js";

let scaleFactor = 0.05; // lower the val, lower the %

export function createImageItemContainer(image, index, imageData, opacity, isTop) {
    const imageItemContainer = document.createElement('div');
    imageItemContainer.className = 'image-item-container';

    const currentImage = createImageElement(image, 'current-image', opacity, isTop);
    const nextImage = createImageElement(image, 'next-image', '0', isTop);

    const bottomTextOverlay = createBottomTextOverlay(index, imageData);

    const progressBarBg = document.createElement('div');
    progressBarBg.className = 'progress-bar-background';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const topTextOverlay = createTopTextOverlay(index, imageData, progressBar);

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    imageItemContainer.append(nextImage, bottomTextOverlay, topTextOverlay, currentImage, overlay, progressBarBg, progressBar);
    return imageItemContainer;
}

function createImageElement(image, className, opacity, isTop) {
    const imageElement = document.createElement('img');
    imageElement.className = className;
    imageElement.src = image.src;
    imageElement.style.opacity = opacity || '0';
    imageElement.onload = () => applyTransforms(imageElement, isTop);
    return imageElement;
}

function applyTransforms(image , isTop) {
    const xOffsetPercent = parseFloat(document.getElementById('xoffset-slider').value);
    const yOffsetPercent = parseFloat(document.getElementById('yoffset-slider').value);
    const [top,bottom] = getCurrentZoomValue();
    const zoomValue = isTop ? top :bottom;

    const xOffset = (xOffsetPercent / 100) * image.width;
    const yOffset = (yOffsetPercent / 100) * image.width;
    image.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${zoomValue / 100})`;
    image.style.transformOrigin = "50% 50%";
}

export function createBottomTextOverlay(i, imagesArray) {
    const textOverlay = document.createElement('div');
    textOverlay.className = 'bottom-text-overlay';
    updateBottomTextOverlay(textOverlay, i, imagesArray);
    return textOverlay;
}

export function createTopTextOverlay(i, imagesArray, progressBar) {
    const textOverlay = document.createElement('div');
    textOverlay.className = 'top-text-overlay';
    updateTopTextOverlay(textOverlay, i, imagesArray, progressBar);
    return textOverlay;
}

export function updateTopTextOverlay(textOverlay, i, imagesArray, progressBar) {
    if (!imagesArray || imagesArray.length === 0) {
        console.error('imagesArray is empty or not defined');
        return;
    }

    const image = imagesArray[i % imagesArray.length];
    let dynamicScaleFactor = scaleFactor * (1 - (i / (numArrangedImages * 2)));
    const scaledSimilarity = (image.distance * dynamicScaleFactor).toFixed(2);

    const similarityDisplay = document.getElementById('similarity').checked ? 'block' : 'none';
    const scaledSimilarityDisplay = document.getElementById('scaledSimilarity').checked ? 'block' : 'none';

    const isFirstImage = imagesArray.length <= (isMobile ? 2 : 3) && i === 0;

    let content = `<div class="similarity" style="display: ${similarityDisplay};">Similarity: ${image.distance.toFixed(2)}%</div>`;
    if (isFirstImage) {
        content += `<div class="scaled-similarity" style="display: ${scaledSimilarityDisplay};">Level of Confidence: ${scaledSimilarity}%</div>`;
    } else {
        content += `<div class="scaled-similarity" style="display: ${scaledSimilarityDisplay};">${scaledSimilarity}%</div>`;
    }
    textOverlay.innerHTML = content;
    setTimeout(() => {
        progressBar.style.height = `${parseFloat(scaledSimilarity) * 10}%`;

    }, 1000);
}

export function updateBottomTextOverlay(textOverlay, i, imagesArray) {
    if (!imagesArray || imagesArray.length === 0) {
        console.error('imagesArray is empty or not defined');
        return;
    }

    const image = imagesArray[i % imagesArray.length];
    let content = '';

    const isFirstImage = imagesArray.length <= (isMobile ? 2 : 3) && i === 0;

    if (isFirstImage) {
        content += `<div class="name"> ${image.name}</div>`;
        content += '[No. Records: 1]'
    } else {
        content += `<div class="name"> ${image.name} [1]</div>`;
    }
    textOverlay.innerHTML = content;
}