import { getNumPhotos, numArrangedImages } from "./imageGridHelper.js";
import { isMobile } from "../uiElements/screensizeLayout.js";
import { SERVER_URL } from "../index.js";

async function urlExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error(`Error checking URL ${url}:`, error);
        return false;
    }
}

function encodePath(path) {
    return path.split('/').map(decodeURIComponent).map(encodeURIComponent).join('/');
}

export async function loadImages(imageDataArray, numArrangedImages, isMobile) {
    try {
        console.log('starting load');
        const batchSize = 10; // Adjust the batch size as needed
        const loadedImages = [];
        const numPhotos = numArrangedImages ? numArrangedImages + (isMobile ? 2 : 3) : getNumPhotos();

        for (let i = 0; i < numPhotos; i += batchSize) {
            const batchImages = imageDataArray.slice(i, i + batchSize);

            const batchPromises = batchImages.map(async (imageData) => {
                if (typeof imageData !== 'object') {
                    console.error('Invalid imageData structure:', imageData);
                    return null;
                }

                // Encode each part of the path correctly
                const encodedImagePath = encodePath(imageData.imagePath[0]);

                const srcUrl = `${SERVER_URL}${encodedImagePath}`;
                const srcOrigUrl = `${SERVER_URL}${encodedImagePath}`;

                const srcExists = await urlExists(srcUrl);
                const srcOrigExists = await urlExists(srcOrigUrl);

                if (srcExists && srcOrigExists) {
                    const imageElement = document.createElement('img');
                    imageElement.src = srcUrl;
                    imageElement.srcOrig = srcOrigUrl;
                    imageElement.imagePath = imageData.imagePath;
                    imageElement.label = imageData.label;
                    imageElement.distance = imageData.distance;
                    imageElement.jsonData = imageData.jsonData;

                    await new Promise((resolve) => {
                        imageElement.onload = resolve;
                    });

                    return imageElement;
                } else {
                    console.warn(`Image not found: ${srcUrl} or ${srcOrigUrl}`);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            loadedImages.push(...batchResults.filter(img => img !== null));
        }
        console.log('done load');

        return loadedImages.slice(0, numPhotos);
    } catch (error) {
        console.error('Error loading images:', error);
    }
}
