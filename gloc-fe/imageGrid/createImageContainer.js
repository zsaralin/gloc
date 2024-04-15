
let scaleFactor = 0.4; // lower the val, lower the %

export function createImageItemContainer(image, index, imageData) {
    const imageItemContainer = document.createElement('div');
    imageItemContainer.className = 'image-item-container';
    const currentImage = document.createElement('img');
    currentImage.className = 'current-image';
    currentImage.src = image.src;
    const nextImage = document.createElement('img');
    nextImage.className = 'next-image';
    nextImage.src = image.src;

    const textOverlay = createTextOverlay(index, imageData);

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    imageItemContainer.appendChild(nextImage);
    imageItemContainer.appendChild(currentImage);
    imageItemContainer.appendChild(textOverlay);
    imageItemContainer.appendChild(overlay);

    return imageItemContainer;
}
// Helper function to create a text overlay based on the index
export function createTextOverlay(i, imagesArray) {
    const textOverlay = document.createElement('div');
    textOverlay.className = 'text-overlay';
    updateTextOverlay(textOverlay, i ,imagesArray)
    return textOverlay;
}

export function updateTextOverlay(textOverlay, i, imagesArray){
    try {
        if (!imagesArray || imagesArray.length === 0) {
            throw new Error('imagesArray is empty or not defined');
        }
        if (!textOverlay) {
            throw new Error('textOverlay is not defined');
        }

        const image = imagesArray[i % imagesArray.length];
        const similarity = image.distance.toFixed(2);
        const scaledSimilarity = (image.distance * scaleFactor).toFixed(2);

        if (imagesArray.length <= 2) {
            textOverlay.innerHTML = `
                <div class="similarity">Similarity: ${similarity}%</div>
                <div class="scaled-similarity">Scaled Similarity: ${scaledSimilarity}%</div>
            `;
        } else {
            textOverlay.innerHTML = `
                <div class="similarity">${similarity}%</div>
                <div class="scaled-similarity">${scaledSimilarity}%</div>
            `;
        }
    } catch (error) {
        console.error(error);
        // Optionally, update the textOverlay with a default or error message
        textOverlay.innerHTML = `<div class="error">Error updating overlay. Please try again.</div>`;
    }
}
