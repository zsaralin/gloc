import {arrangeBottomGrid, numArrangedImages} from "./imageGridHelper.js";
import {updateOnlyDifferentImg} from "../uiElements/sidePanel.js"; // Replace with the actual path to your constant
import {loadImages} from "./imageLoader.js";
import {sporadicUpdate, stopShuffle} from "./startShuffle.js";
import {addImageClickListener} from "../collage/collage.js";
import {db} from "../uiElements/dbModal.js";
import {addImageClickListener42} from "../collage/collage_42.js";
import {
    createBottomTextOverlay
    , createTopTextOverlay,
    updateBottomTextOverlay
    , updateTopTextOverlay
} from "./createImageContainer.js"; // Import the getCurrentZoomValue function

let loadedImages;

export function clearLoadedRandomImages(){
    loadedImages = null;
}
export async function updateShuffle(imagesDataArray, abortController) {
    if(!loadedImages) {
        loadedImages= await loadImages(imagesDataArray);
    }
    updateImagesInShuffle(loadedImages, imagesDataArray)
}

async function updateImagesInShuffle(images, imagesDataArray, isTop) {
    const allImageContainers = [
        ...document.getElementById('top-image-container').querySelectorAll('.image-item-container'),
        ...document.getElementById('bottom-image-container').querySelectorAll('.image-item-container')
    ];

    const randomIndices = Array.from({ length: numArrangedImages + 2 }, (_, i) => i)
        .sort(() => 0.5 - Math.random());

    allImageContainers.forEach((imageContainer, index) => {
        const randomIndex = randomIndices[index];

        if (randomIndex !== undefined && images[randomIndex]) {
            const image = images[randomIndex];
            const currentImage = imageContainer.querySelector('.current-image');
            const bottomTextOverlay = imageContainer.querySelector('.bottom-text-overlay');
            const topTextOverlay = imageContainer.querySelector('.top-text-overlay');

            if ((sporadicUpdate && Math.random() < 0.7) || !sporadicUpdate) {
                currentImage.src = image.src;
                bottomTextOverlay.innerHTML = createBottomTextOverlay(randomIndex, imagesDataArray).innerHTML;
                topTextOverlay.innerHTML = createTopTextOverlay(randomIndex, imagesDataArray).innerHTML;

            }
        }
    });
}

export async function updateFirst(imagesDataArray, abortController) {
    await stopShuffle()

    const loadedImages = await loadImages(imagesDataArray);
    // const [topImages, bottomImages] = [loadedImages.slice(0, 2), loadedImages.slice(2)];
    // const [topImageData, bottomImageData] = [imagesDataArray.slice(0, 2), imagesDataArray.slice(2)];

    await Promise.all([
        updateImagesFirst(loadedImages, imagesDataArray, abortController),
    ]);
}
async function updateImagesFirst(images, newImagesArray, abortController) {
    const allImageContainers = [
        ...document.getElementById('top-image-container').querySelectorAll('.image-item-container'),
        ...document.getElementById('bottom-image-container').querySelectorAll('.image-item-container')
    ];
    const numberOfImages = allImageContainers.length;
    const updateBatchSize = 5; // Number of images to update in each batch
    let indices = Array.from({length: numberOfImages}, (_, i) => i);
    indices = shuffleArray(indices);
    let updatedCount = 0; // Initialize the counter

    for (let batchIndex = 0; batchIndex < numberOfImages; batchIndex += updateBatchSize) {
        if (abortController.signal.aborted) {
            return;
        }
        const batchIndices = indices.slice(batchIndex, batchIndex + updateBatchSize);
        const batchPromises = batchIndices.map(i => {
            return updateImageContainer(allImageContainers[i], i, newImagesArray, images)
                .then(() => {
                    updatedCount++; // Increment the counter for each successful update
                });
        });

        await new Promise(resolve => setTimeout(resolve, 50)); // Stagger when each photo is set
        await Promise.all(batchPromises).then(() => {
        });
    }
}
async function updateImageContainer(imageContainer, index, newImagesArray, images) {
    try {
        const overlay = imageContainer.querySelector('.overlay');
        overlay.style.transition = 'opacity 0.5s linear';
        overlay.style.opacity = 0;
        const currentImage = imageContainer.querySelector('.current-image');
        const bottomTextOverlay = imageContainer.querySelector('.bottom-text-overlay');
        const topTextOverlay = imageContainer.querySelector('.top-text-overlay');
        updateBottomTextOverlay(bottomTextOverlay, index, index < 2 ? images.slice(0,2) : images)
        updateTopTextOverlay(topTextOverlay, index, index < 2 ? images.slice(0,2) : images)

        currentImage.src = images[index].src; // Set src after defining onload/onerror to ensure the load event isn't missed
        if (db === '42') {
            await addImageClickListener42(imageContainer, images[index].label);
        } else {
            await addImageClickListener(imageContainer);
        }

        // currentImage.src = images[index].src; // Set src after defining onload/onerror to ensure the load event isn't missed

    } catch (error) {
        console.error('Error updating image container:', error);
        return Promise.reject(error); // Explicitly reject the promise on error

    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}