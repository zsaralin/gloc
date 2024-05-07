import {initZoom} from "./zoom.js";
import {initTimeSlider} from "../faceRecognition/faceRecognition.js";
import {initNumPhotoSlider} from "../imageGrid/imageGridHelper.js";
import {initFadeSlider} from "../imageGrid/updateImageGrid.js";
import {initWhiteSlider} from "./whiteBorder.js";
import {initMinDistSlider} from "../minEyeDist.js";
import {initializeShuffleUIElements} from "../imageGrid/startShuffle.js";

export let animationType = "crossfade"; // Initially, apply crossfade animation
export let updateOnlyDifferentImg = true; // Initially, update all images
export let drawLandmarks = true;
export let drawBox = true;

export async function restartSidePanel() {
    const response = await fetch('./uiElements/sidePanel.html');
    document.getElementById('sidePanel').innerHTML = await response.text();
    setupSidePanel();
}

export function setupSidePanel() {
    console.log('setting up side panel')
    setupSidePanelButton()

    initZoom();
    initTimeSlider()
    initNumPhotoSlider()
    initFadeSlider()
    initWhiteSlider()
    initMinDistSlider()
    initializeShuffleUIElements()

    const similarityCheckbox = document.getElementById("similarity");
    const scaledSimilarityCheckbox = document.getElementById("scaledSimilarity");
    // Listen for changes in the Similarity checkbox state
    similarityCheckbox.addEventListener("change", function () {
        const showSimilarity = similarityCheckbox.checked;
        updateImageDisplay(showSimilarity, scaledSimilarityCheckbox.checked);
    });

    // Listen for changes in the Scaled Similarity checkbox state
    scaledSimilarityCheckbox.addEventListener("change", function () {
        const showScaledSimilarity = scaledSimilarityCheckbox.checked;
        updateImageDisplay(similarityCheckbox.checked, showScaledSimilarity);
    });

    const updateOnlyDifferentSrcCheckbox = document.getElementById("updateOnlyDifferentImg");

    // Listen for changes in the Update Only Different Src checkbox state
    updateOnlyDifferentSrcCheckbox.addEventListener("change", function () {
        updateOnlyDifferentImg = updateOnlyDifferentSrcCheckbox.checked;
    });

    const boxCheckbox = document.getElementById("boxCheckbox");
    boxCheckbox.addEventListener("change", function () {
        drawBox = boxCheckbox.checked;
    });

    const landmarksCheckbox = document.getElementById("landmarksCheckbox");
    landmarksCheckbox.addEventListener("change", function () {
        drawLandmarks = landmarksCheckbox.checked;
    });

    const animationTypeRadios = document.querySelectorAll('input[name="animationType"]');
    animationTypeRadios.forEach((radio) => {
        radio.addEventListener("change", function () {
            animationType = radio.value; // Update the selected animation type
        });
    });
}

function setupSidePanelButton(){
    const openPanelButton = document.getElementById("openPanelButton");
    const closePanelButton = document.getElementById("closePanelButton");
    const sidePanel = document.getElementById("sidePanel");
    const openPanelHandler = () => toggleSidePanel(sidePanel, openPanelButton, closePanelButton, true);
    const closePanelHandler = () => toggleSidePanel(sidePanel, openPanelButton, closePanelButton, false);
    openPanelButton.addEventListener("click", openPanelHandler);
    closePanelButton.addEventListener("click", closePanelHandler);
}


function toggleSidePanel(sidePanel, openPanelButton, closePanelButton, isOpen) {
    if (isOpen) {
        sidePanel.classList.add("open");
        openPanelButton.style.display = "none"; // Hide the open button
        closePanelButton.style.display = "block"; // Show the close button
    } else {
        sidePanel.classList.remove("open");
        openPanelButton.style.display = "block"; // Show the open button
        closePanelButton.style.display = "none"; // Hide the close button
    }
}
// Function to update the photo display based on the checkbox states
function updateImageDisplay(showSimilarity, showScaledSimilarity) {
    const imageContainers = document.querySelectorAll(".image-item-container");
    imageContainers.forEach((imageContainer) => {
        const textOverlay = imageContainer.querySelector(".text-overlay");

        const similarityElement = textOverlay.querySelector(".similarity");
        const scaledSimilarityElement = textOverlay.querySelector(".scaled-similarity");

        similarityElement.style.display = showSimilarity ? "block" : "none";
        scaledSimilarityElement.style.display = showScaledSimilarity ? "block" : "none";
    });
}