import {getNumPhotos, numArrangedImages} from "./imageGridHelper.js";
import {isMobile} from "../uiElements/screensizeLayout.js";

const SERVER_URL = 'https://be.levelofconfidence.net'
// export async function loadImages(imageDataArray) {
//     if (!Array.isArray(imageDataArray)) {
//         console.error('imageDataArray is not an array or is undefined:', imageDataArray);
//         return;
//     }
//
//     try {
//         const batchSize = 10; // Adjust the batch size as needed
//         const loadedImages = [];
//         const numPhotos = numArrangedImages ? numArrangedImages + (isMobile ? 2 : 3) : getNumPhotos();
//
//         for (let i = 0; i < numPhotos; i += batchSize) {
//             const batchImages = imageDataArray.slice(i, i + batchSize);
//
//             const batchPromises = batchImages.map(async (imageData) => {
//                 if (typeof imageData !== 'object') {
//                     console.error('Invalid imageData structure:', imageData);
//                     return null;
//                 }
//
//                 const imageElement = document.createElement('img');
//                 imageElement.src = 'data:image/png;base64,' + imageData.image;
//                 imageElement.srcOrig = 'data:image/png;base64,' + imageData.imageCmp;
//                 imageElement.label = imageData.label;
//                 imageElement.distance = imageData.distance;
//                 imageElement.name = imageData.name;
//                 await new Promise((resolve) => {
//                     imageElement.onload = resolve;
//                 });
//                 return imageElement;
//             });
//
//             const batchResults = await Promise.all(batchPromises);
//             loadedImages.push(...batchResults.filter(img => img !== null));
//         }
//
//         return loadedImages.slice(0, numPhotos);
//     } catch (error) {
//         console.error('Error loading images:', error);
//     }
// }

export async function loadImages(imageDataArray) {
    if (!Array.isArray(imageDataArray)) {
        console.error('imageDataArray is not an array or is undefined:', imageDataArray);
        return;
    }

    try {
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

                const imageElement = document.createElement('img');
                imageElement.src = `${SERVER_URL}${imageData.imagePath}`;  // Use the full URL with the correct port
                console.log(`${SERVER_URL}${imageData.imagePath}`)
                imageElement.srcOrig = `${SERVER_URL}${imageData.imageCmpPath}`

                imageElement.label = imageData.label;
                imageElement.distance = imageData.distance;
                imageElement.name = imageData.name;
                await new Promise((resolve) => {
                    imageElement.onload = resolve;
                });
                return imageElement;
            });

            const batchResults = await Promise.all(batchPromises);
            loadedImages.push(...batchResults.filter(img => img !== null));
        }

        return loadedImages.slice(0, numPhotos);
    } catch (error) {
        console.error('Error loading images:', error);
    }
}