import {getNumPhotos, numArrangedImages} from "./imageGridHelper.js";
import {isMobile} from "../uiElements/screensizeLayout.js";

export async function loadImages(imageDataArray) {
    if (!imageDataArray) {
        console.error('imageDataArray is null or undefined');
        return;
    }

    try {
        const batchSize = 10; // Adjust the batch size as needed
        const loadedImages = [];
        const numPhotos = numArrangedImages ? numArrangedImages + (isMobile ? 2 : 3) : getNumPhotos();

        for (let i = 0; i < numPhotos; i += batchSize) {
            const batchImages = imageDataArray.slice(i, i + batchSize);

            const batchPromises = batchImages.map(async (imageData) => {
                const imageElement = document.createElement('img');
                imageElement.src = 'data:image/png;base64,' + imageData.image;
                imageElement.srcOrig = 'data:image/png;base64,' + imageData.imageCmp;
                imageElement.label = imageData.label;
                imageElement.distance = imageData.distance;
                imageElement.name = imageData.name;
                await new Promise((resolve) => {
                    imageElement.onload = resolve;
                });
                return imageElement;
            });

            const batchResults = await Promise.all(batchPromises);
            loadedImages.push(...batchResults);
        }

        return loadedImages.slice(0, numPhotos);
    } catch (error) {
        console.error('Error loading images:', error);
    }
}