import {arrangeBottomGrid, numArrangedImages} from "./imageGridHelper.js";
import {animationType, updateOnlyDifferentImg} from "../uiElements/sidePanel.js";
import {clearRecognitionIntervals} from '../faceRecognition/faceRecognition.js';
import {getCurrentZoomValue} from "../uiElements/zoom.js";
import {loadImages} from "./imageLoader.js";
import {addImageClickListener} from "../collage/collage.js";
import {stopShuffle} from "./startShuffle.js";
import {createBottomTextOverlay, createTopTextOverlay} from "./createImageContainer.js";
import {db} from "../uiElements/dbModal.js";
import {addImageClickListener42} from "../collage/collage_42.js";
import {getCurrentOffsetValues} from "../uiElements/offset.js";

let fadeTime;
let fadeSlider;

function initFadeSlider(){
    fadeSlider = document.getElementById('fade-slider')
}

export function handleFadeTime(){
    if(!fadeSlider) initFadeSlider()
    fadeTime = fadeSlider.value;
}

export async function updateImageGrid(imagesDataArray, abortController) {
    try {
        let loadedImages = await loadImages(imagesDataArray);
        const [topImages, bottomImages] = [loadedImages.slice(0, 2), loadedImages.slice(2)];
        const totalImages = loadedImages.length; // Total number of images across both updates

        await Promise.all([
            updateImages(topImages, imagesDataArray.slice(0, 2), totalImages, 0, abortController), // Start index for top images is 0
            updateImages(bottomImages, imagesDataArray.slice(2), totalImages, topImages.length, abortController) // Start index for bottom images
        ]);
    } catch (error) {
        throw error;
    }
}

async function updateImages(images, imageData, totalImages, startIndex, abortController) {
    if(!fadeTime) handleFadeTime()
    const containerId = images.length <= 2 ? 'top-image-container' : 'bottom-image-container';
    const container = document.getElementById(containerId);
    const imageContainers = container.querySelectorAll('.image-item-container');
    const animationPromises = [];

    for (let i = 0; i < images.length; i++) {
        if (abortController.signal.aborted) {
            clearRecognitionIntervals();
            return;
        }
        const overallIndex = startIndex + i; // Calculate the overall index across both updates
        const opacityVal = document.getElementById('opacity-slider').value
        const opacity = 1 - ((1 - opacityVal) * overallIndex / (totalImages - 1)); // Adjust for total images and index

        const imageContainer = imageContainers[i];
        if (!imageContainer) continue;
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
                    const crossfadePromise = updateCrossfade(currentImage, nextImage, topTextOverlay, bottomTextOverlay, newTopTextOverlay, newBottomTextOverlay, fadeOverlay, images[i].src, opacity);
                    animationPromises.push(crossfadePromise);
                } else if (animationType === "fullFade") {
                    const fadePromise = updateFullFade(currentImage, nextImage, topTextOverlay, bottomTextOverlay, newTopTextOverlay, newBottomTextOverlay, fadeOverlay, images[i].src, opacity);
                    animationPromises.push(fadePromise);
                }
            }
        }
        if (db === '42') {
            await addImageClickListener42(imageContainer, images[i]);
        } else {
            await addImageClickListener42(imageContainer, images[i]);
        }
    }
    await Promise.all(animationPromises);
}

async function updateCrossfade(currentImage, nextImage, topTextOverlay, bottomTextOverlay, newTopTextOverlay, newBottomTextOverlay, fadeOverlay, imageSrc, opacity) {
    return new Promise((resolve) => {
        if (currentImage.src !== imageSrc) {
            const { xOffset, yOffset } = getCurrentOffsetValues(); // Retrieve current offsets
            let zoomValue = getCurrentZoomValue(); // Get current zoom level
            const transformSettings = `translate(${xOffset}px, ${yOffset}px) scale(${zoomValue / 100})`;

            currentImage.style.transition = `opacity ${fadeTime / 2}s linear`;
            nextImage.style.transition = `opacity ${fadeTime / 2}s linear`;
            bottomTextOverlay.style.transition = `opacity ${fadeTime / 2 / 2}s linear`;
            bottomTextOverlay.style.opacity = 0;
            nextImage.src = imageSrc;
            // currentImage.style.transform = transformSettings
            // nextImage.style.transformOrigin = `50% 50%`;
            // nextImage.style.transform = transformSettings

            currentImage.style.opacity = 0;
            nextImage.style.opacity = opacity;
        }
        topTextOverlay.style.transition = `opacity ${fadeTime / 2 / 2}s linear`;
        fadeOverlay.style.transition = `opacity ${fadeTime/2}s linear`;

        topTextOverlay.style.opacity = 0;
        fadeOverlay.style.opacity = 0;


        setTimeout(() => {
            topTextOverlay.innerHTML = newTopTextOverlay.innerHTML;
            topTextOverlay.style.opacity = 1;
            if (currentImage.src !== imageSrc) {
                bottomTextOverlay.innerHTML = newBottomTextOverlay.innerHTML;
                bottomTextOverlay.style.opacity = 1;
            }
            resolve();
        }, fadeTime / 2 * 1000);

            return new Promise((resolve) => {
                if (currentImage.src !== imageSrc) {

                    setTimeout(() => {
                        currentImage.src = nextImage.src;
                        currentImage.style.transition = 'opacity 0s';
                        nextImage.style.transition = 'opacity 0s';

                        currentImage.style.opacity = opacity;
                        nextImage.style.opacity = 0;

                        resolve();
                    }, fadeTime / 2 * 1000);
                }
            });

    });
}

async function updateFullFade(currentImage, nextImage, topTextOverlay, bottomTextOverlay, newTopTextOverlay, newBottomTextOverlay, fadeOverlay, imageSrc, opacity) {
    return new Promise((resolve) => {
        currentImage.style.transition = `opacity ${fadeTime / 2}s linear`;
        topTextOverlay.style.transition = `opacity ${fadeTime / 2 / 2}s linear`;
        bottomTextOverlay.style.transition = `opacity ${fadeTime / 2 / 2}s linear`;
        fadeOverlay.style.transition = `opacity ${fadeTime / 2}s linear`;

        topTextOverlay.style.opacity = 0;
        bottomTextOverlay.style.opacity = 0;
        fadeOverlay.style.opacity = 0;

        currentImage.style.opacity = 0;
        setTimeout(() => {
            currentImage.src = imageSrc;
            topTextOverlay.innerHTML = newTopTextOverlay.innerHTML;
            bottomTextOverlay.innerHTML = newBottomTextOverlay.innerHTML;
            currentImage.style.opacity = opacity;
            topTextOverlay.style.opacity = 1;
            bottomTextOverlay.style.opacity = 1;
            resolve();
        }, fadeTime / 2 * 1000);
    });
}

function shouldUpdateImage(newImage, currentImage) {
    return true;
    return !updateOnlyDifferentImg || (updateOnlyDifferentImg && currentImage.src !== newImage.src);
}

// export function initFadeSlider() {
//     const timeSlider = document.getElementById("fade-slider");
//     const sliderValue = document.getElementById("fade-slider-value");
//     fadeTime = parseInt(timeSlider.value);
//     timeSlider.addEventListener("input", function () {
//         fadeTime = parseInt(timeSlider.value);
//         clearRecognitionIntervals();
//     });
// }