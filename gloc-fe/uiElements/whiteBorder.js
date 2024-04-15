export function initWhiteSlider() {
    const whiteSlider = document.getElementById("white-slider");
    whiteSlider.addEventListener("input", function () {
        let newSize = parseInt(whiteSlider.value); // Convert to integer and update updateCount
        const currentImages = document.querySelectorAll('.current-image');
        const nextImages = document.querySelectorAll('.next-image');
        currentImages.forEach(currentImage => {
            currentImage.style.border = `${newSize}px solid white`;
        });
        nextImages.forEach(nextImage => {
            nextImage.style.border = `${newSize}px solid white`;
        });
    });
}