import { arrangeBottomGrid, numArrangedImages } from "./imageGridHelper.js";
import { animationType, updateOnlyDifferentImg } from "../uiElements/sidePanel.js";
import { clearRecognitionIntervals } from '../faceRecognition.js';
import { getCurrentZoomValue } from "../uiElements/zoom.js";
import { loadImages } from "./imageLoader.js";
import { addImageClickListener } from "../collage/collage.js";
import { stopShuffle } from "./startShuffle.js";
import { createBottomTextOverlay, createTopTextOverlay } from "./createImageContainer.js";
import { db } from "../uiElements/dbModal.js";
import { addImageClickListener42 } from "../collage/collage_42.js";

let fadeTime;

export async function updateImageGrid(imagesDataArray, abortController) {
    try {
        let loadedImages = await loadImages(imagesDataArray);
        const [topImages, bottomImages] = [loadedImages.slice(0, 2), loadedImages.slice(2)];
        const [topImageData, bottomImageData] = [imagesDataArray.slice(0, 2), imagesDataArray.slice(2)];
        await Promise.all([
            updateImages(topImages, topImageData, abortController),
            updateImages(bottomImages, bottomImageData, abortController)
        ]);
    } catch (error) {
        throw error;
    }
}

async function updateImages(images, imageData, abortController) {
    const container = images.length <= 2 ? document.getElementById('top-image-container') : document.getElementById('bottom-image-container');
    const imageContainers = container.querySelectorAll('.image-item-container');
    const animationPromises = [];
    const numImages = images.length <= 2 ? images.length : numArrangedImages;
    for (let i = 0; i < numImages; i++) {
        if (abortController.signal.aborted) {
            clearRecognitionIntervals();
            return;
        }
        const imageContainer = imageContainers[i];
        if (!imageContainer) return;
        const currentImage = imageContainer.querySelector('.current-image');
        const nextImage = imageContainer.querySelector('.next-image');
        const bottomTextOverlay = imageContainer.querySelector('.bottom-text-overlay');
        const topTextOverlay = imageContainer.querySelector('.top-text-overlay');

        const newBottomTextOverlay = createBottomTextOverlay(i, imageData);
        const newTopTextOverlay = createTopTextOverlay(i, imageData);

        const fadeOverlay = imageContainer.querySelector('.overlay');

        if (shouldUpdateImage(images[i], currentImage)) {
            if (animationType === "none") {
                currentImage.src = images[i].src;
                topTextOverlay.innerHTML = newTopTextOverlay.innerHTML;
                bottomTextOverlay.innerHTML = newBottomTextOverlay.innerHTML;
            } else {
                if (animationType === "crossfade") {
                    const crossfadePromise = updateCrossfade(currentImage, nextImage, topTextOverlay, bottomTextOverlay, newTopTextOverlay, newBottomTextOverlay, fadeOverlay, images[i].src);
                    animationPromises.push(crossfadePromise);
                } else if (animationType === "fullFade") {
                    const fadePromise = updateFullFade(currentImage, nextImage, topTextOverlay, bottomTextOverlay, newTopTextOverlay, newBottomTextOverlay, fadeOverlay, images[i].src);
                    animationPromises.push(fadePromise);
                }
            }
        }
        if (db === '42') {
            await addImageClickListener42(imageContainer, images[i].label);
        } else {
            await addImageClickListener(imageContainer);
        }
    }
    await Promise.all(animationPromises);
}

async function updateCrossfade(currentImage, nextImage, topTextOverlay, bottomTextOverlay, newTopTextOverlay, newBottomTextOverlay, fadeOverlay, imageSrc) {
    return new Promise((resolve) => {
        currentImage.style.transition = `opacity ${fadeTime/2}s linear`;
        nextImage.style.transition = `opacity ${fadeTime/2}s linear`;
        topTextOverlay.style.transition = `opacity ${fadeTime/2 / 2}s linear`;
        bottomTextOverlay.style.transition = `opacity ${fadeTime/2 / 2}s linear`;
        fadeOverlay.style.transition = `opacity ${fadeTime/2}s linear`;

        topTextOverlay.style.opacity = 0;
        bottomTextOverlay.style.opacity = 0;
        fadeOverlay.style.opacity = 0;

        nextImage.src = imageSrc;

        let zoomValue = getCurrentZoomValue();
        currentImage.style.transformOrigin = `50% 50%`;
        currentImage.style.transform = `scale(${zoomValue / 100})`;
        nextImage.style.transformOrigin = `50% 50%`;
        nextImage.style.transform = `scale(${zoomValue / 100})`;

        currentImage.style.opacity = 0;
        nextImage.style.opacity = 1;

        setTimeout(() => {
            topTextOverlay.innerHTML = newTopTextOverlay.innerHTML;
            bottomTextOverlay.innerHTML = newBottomTextOverlay.innerHTML;
            topTextOverlay.style.opacity = 1;
            bottomTextOverlay.style.opacity = 1;
            resolve();
        }, fadeTime / 2 * 1000);

        return new Promise((resolve) => {
            setTimeout(() => {
                currentImage.src = nextImage.src;
                currentImage.style.transition = 'opacity 0s';
                nextImage.style.transition = 'opacity 0s';

                currentImage.style.opacity = 1;
                nextImage.style.opacity = 0;

                resolve();
            }, fadeTime/2 * 1000);
        });
    });
}

async function updateFullFade(currentImage, nextImage, topTextOverlay, bottomTextOverlay, newTopTextOverlay, newBottomTextOverlay, fadeOverlay, imageSrc) {
    return new Promise((resolve) => {
        currentImage.style.transition = `opacity ${fadeTime/2}s linear`;
        topTextOverlay.style.transition = `opacity ${fadeTime/2 / 2}s linear`;
        bottomTextOverlay.style.transition = `opacity ${fadeTime/2 / 2}s linear`;
        fadeOverlay.style.transition = `opacity ${fadeTime/2}s linear`;

        topTextOverlay.style.opacity = 0;
        bottomTextOverlay.style.opacity = 0;
        fadeOverlay.style.opacity = 0;

        currentImage.style.opacity = 0;
        setTimeout(() => {
            currentImage.src = imageSrc;
            topTextOverlay.innerHTML = newTopTextOverlay.innerHTML;
            bottomTextOverlay.innerHTML = newBottomTextOverlay.innerHTML;
            currentImage.style.opacity = 1;
            topTextOverlay.style.opacity = 1;
            bottomTextOverlay.style.opacity = 1;
            resolve();
        }, fadeTime/2 * 1000);
    });
}

function shouldUpdateImage(newImage, currentImage) {
    return !updateOnlyDifferentImg || (updateOnlyDifferentImg && currentImage.src !== newImage.src);
}

export function initFadeSlider() {
    const timeSlider = document.getElementById("fade-slider");
    const sliderValue = document.getElementById("fade-slider-value");
    sliderValue.textContent = timeSlider.value + 's';
    fadeTime = parseInt(timeSlider.value);
    timeSlider.addEventListener("input", function () {
        sliderValue.textContent = timeSlider.value + 's';
        fadeTime = parseInt(timeSlider.value);
        clearRecognitionIntervals();
    });
}
