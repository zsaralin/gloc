
let minDist = 50;

export function isEyeDistanceAboveThreshold(person) {
    if (!person) {
        return false; // Return false if landmarks are not available
    }

    // Get the positions of the left and right eye landmarks
    const leftEye = person[468]; // Adjust index as needed
    const rightEye = person[473]; // Adjust index as needed

    // Calculate the Euclidean distance between the left and right eyes
    const distance = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
    // Check if the distance is greater than the threshold (50)
    return (distance * 1000)> minDist;
}

export function initMinDistSlider() {
    const timeSlider = document.getElementById("min-dist-slider");
    const sliderValue = document.getElementById("min-dist-slider-value");
    // Update the slider value display initially
    sliderValue.textContent = timeSlider.value;
    minDist = parseInt(timeSlider.value);
    // Add an event listener to update the display and updateCount when the slider value changes
    timeSlider.addEventListener("input", function () {
        sliderValue.textContent = timeSlider.value;
        minDist = parseInt(timeSlider.value); // Convert to integer and update updateCount
    });
}