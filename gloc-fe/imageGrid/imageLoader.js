import {getNumPhotos} from "./imageGridHelper.js";
import {SERVER_URL} from "../index.js";

export async function loadImages(imageDataArray) {
    const batchSize = 10; // Adjust the batch size as needed
    const loadedImages = [];
    const numPhotos = getNumPhotos() ;
    for (let i = 0; i < numPhotos; i += batchSize) {
        const batchImages = imageDataArray.slice(i, i + batchSize);

        const batchPromises = batchImages.map(async (imageData) => {
            const imageElement = document.createElement('img');
            imageElement.src = 'data:image/png;base64,' + imageData.image;
            imageElement.srcOrig = 'data:image/png;base64,' + imageData.imageCmp;
            imageElement.label = imageData.label
            imageElement.distance = imageData.distance
            imageElement.name = imageData.name
            await new Promise((resolve) => {
                imageElement.onload = resolve;
            });
            return imageElement;
        });

        const batchResults = await Promise.all(batchPromises);
        loadedImages.push(...batchResults);
    }
    return loadedImages.slice(0, 17); // Ensure no more than 17 images are returned
    return loadedImages;
}

export async function getBoundingBoxes(imagesArray){
    const labelsArray = imagesArray.map((imageData) => imageData.label);
    const labelsQueryParam = labelsArray.join(',');

    const response = await fetch(`${SERVER_URL}/get-descriptor?label=${labelsQueryParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        return await response.json()
    }
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
