
let zoomSlider;
let currentZoomValue = 100; // Initial zoom value

export function initZoom(){
    zoomSlider = document.getElementById('zoom-slider');
    zoomSlider.addEventListener('input', handleZoom);
}


function handleZoom() {
    const zoomValue = zoomSlider.value;
    currentZoomValue = zoomValue; // Update the currentZoomValue
    const imageContainer = document.getElementById('top-image-container');

    // Check if the element exists
    if (imageContainer) {
        // Find all image item containers within the image container
        const imageItemContainers = imageContainer.querySelectorAll('.image-item-container');

        // Loop through each image item container
        imageItemContainers.forEach(imageItemContainer => {
            // Find the image and text overlay elements within the container
            const image = imageItemContainer.querySelector('.current-image');

            // Check if the image element exists
            if (image) {
                // Calculate the center point of the image
                const centerX = image.offsetWidth / 2;
                const centerY = image.offsetHeight / 2;

                // Adjust image size based on zoom value while keeping the center in the same position
                image.style.transformOrigin = `${centerX}px ${centerY}px`;
                image.style.transform = `scale(${zoomValue / 100})`;
                image.style.overflow = 'hidden';
            }
        });
    }
    const numRows = document.querySelectorAll('.grid-row').length;
    const numCols = document.querySelectorAll('.grid-row:nth-child(1) .image-item-container').length;

    // Loop through each image container and update the image source
    for (let rowIndex = 1; rowIndex <= numRows; rowIndex++) {
        for (let colIndex = 1; colIndex <= numCols; colIndex++) {
            // Get the image container at the specified row and column
            const imageContainer = document.querySelector(`.grid-row:nth-child(${rowIndex}) .image-item-container:nth-child(${colIndex})`);

            if (imageContainer) {
                const image = imageContainer.querySelector('.current-image');

                // Calculate the center point of the image
                const centerX = image.offsetWidth / 2;
                const centerY = image.offsetHeight / 2;

                // Adjust image size based on zoom value while keeping the center in the same position
                image.style.transformOrigin = `${centerX}px ${centerY}px`;
                image.style.transform = `scale(${zoomValue / 100})`;
                // Ensure the image container size remains the same
                imageContainer.style.width = '100%';
                imageContainer.style.height = '100%';
            }}
    }
}

export function getCurrentZoomValue() {
    return currentZoomValue;
}