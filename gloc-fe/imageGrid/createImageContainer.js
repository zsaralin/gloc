
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

    const bottomTextOverlay = createBottomTextOverlay(index, imageData);
    const topTextOverlay = createTopTextOverlay(index, imageData);

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    imageItemContainer.appendChild(nextImage);
    imageItemContainer.appendChild(bottomTextOverlay);
    imageItemContainer.appendChild(topTextOverlay);
    imageItemContainer.appendChild(currentImage);


    imageItemContainer.appendChild(overlay);

    return imageItemContainer;
}
// Helper function to create a text overlay based on the index
export function createBottomTextOverlay(i, imagesArray) {
    const textOverlay = document.createElement('div');
    textOverlay.className = 'bottom-text-overlay';
    updateBottomTextOverlay(textOverlay, i ,imagesArray)
    return textOverlay;
}

export function createTopTextOverlay(i, imagesArray) {
    const textOverlay = document.createElement('div');
    textOverlay.className = 'top-text-overlay';
    updateTopTextOverlay(textOverlay, i ,imagesArray)
    return textOverlay;
}

export function updateTopTextOverlay(textOverlay, i, imagesArray) {
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
        const scaledSimilarity = (image.distance * scaleFactor).toFixed(2);
        function updateDisplay() {
            // Always create divs for both similarity and scaled similarity.
            let content = '';
            let similarityDisplay = similarityCheckbox.checked ? 'block' : 'none';
            let scaledSimilarityDisplay = scaledSimilarityCheckbox.checked ? 'block' : 'none';
            // Adjust the content for the first image if conditions are met
            if (imagesArray.length <= 2 && i === 0) {
                textOverlay.style.right = 'auto';
                textOverlay.style.left = '4px '
                content += `<div class="similarity" style="display: ${similarityDisplay};">Similarity: ${similarity}%</div>`;
                content += `<div class="scaled-similarity" style="display: ${scaledSimilarityDisplay};">Level of Confidence: ${scaledSimilarity}%</div>`;

            } else {
                // Adjust the content for other images
                content += `<div class="similarity" style="display: ${similarityDisplay};">${similarity}%</div>`;
                content += `<div class="scaled-similarity" style="display: ${scaledSimilarityDisplay};">${scaledSimilarity}%</div>`;
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

                content += `<div class="name"> ${image.name}</div>`;
                if (imagesArray.length <= 2 && i === 0) {

                    content += `<div class="scaled-similarity" style = "padding-top: 2px"> (Closest Match) </div>`;
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
