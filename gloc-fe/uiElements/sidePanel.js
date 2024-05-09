import {handleRefreshTime} from "../faceRecognition/faceRecognition.js";
import {initNumPhotoSlider} from "../imageGrid/imageGridHelper.js";
import {initWhiteSlider} from "./whiteBorder.js";
import {SERVER_URL} from "../index.js";
import {handleZoomAndOffset} from "./offset.js";
import {handleFadeTime} from "../imageGrid/updateImageGrid.js";

export let animationType = "crossfade"; // Initially, apply crossfade animation
export let updateOnlyDifferentImg = true; // Initially, update all images
export let drawLandmarks = true;
export let drawBox = true;

export async function restartSidePanel() {
    const response = await fetch('./uiElements/sidePanel.html');
    document.getElementById('sidePanel').innerHTML = await response.text();
    setupSidePanel();
}

export async function setupSidePanel() {
    console.log('setting up side panel')
    setupSidePanelButton()
    addSliderNumberSyncs()
    await loadSettings()


    const saveButton = document.getElementById('save');
    saveButton.addEventListener('click', saveSettings);

    const similarityCheckbox = document.getElementById("similarity");
    const scaledSimilarityCheckbox = document.getElementById("scaledSimilarity");
    similarityCheckbox.addEventListener("change", function () {
        const showSimilarity = similarityCheckbox.checked;
        updateSimilarityText(showSimilarity, scaledSimilarityCheckbox.checked);
    });

    scaledSimilarityCheckbox.addEventListener("change", function () {
        const showScaledSimilarity = scaledSimilarityCheckbox.checked;
        updateSimilarityText(similarityCheckbox.checked, showScaledSimilarity);
    });


    const updateOnlyDifferentSrcCheckbox = document.getElementById("updateOnlyDifferentImg");
    //
    // updateOnlyDifferentSrcCheckbox.addEventListener("change", function () {
    //     updateOnlyDifferentImg = updateOnlyDifferentSrcCheckbox.checked;
    // });

    const boxCheckbox = document.getElementById("boxCheckbox");
    boxCheckbox.addEventListener("change", function () {
        drawBox = boxCheckbox.checked;
    });

    const landmarksCheckbox = document.getElementById("landmarksCheckbox");
    landmarksCheckbox.addEventListener("change", function () {
        drawLandmarks = landmarksCheckbox.checked;
    });

    // const animationTypeRadios = document.querySelectorAll('input[name="animationType"]');
    // animationTypeRadios.forEach((radio) => {
    //     radio.addEventListener("change", function () {
    //         animationType = radio.value; // Update the selected animation type
    //     });
    // });

    // const opacitySlider = document.getElementById('opacity-slider')
    // const opacitySliderVal = document.getElementById('opacity-slider-value')
    //
    // opacitySlider.addEventListener('input', function () {
    //     opacitySliderVal.textContent = opacitySlider.value;
    // });
}

function setupSidePanelButton() {
    const closePanelButton = document.getElementById("closePanelButton");
    const sidePanel = document.getElementById("sidePanel");
    const closePanelHandler = () => toggleSidePanel(sidePanel, closePanelButton, false);
    closePanelButton.addEventListener("click", closePanelHandler);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'g' || event.key === 'G') {
            const isOpen = !sidePanel.classList.contains("open");
            toggleSidePanel(sidePanel, closePanelButton, isOpen);
        }
    });
}


function toggleSidePanel(sidePanel, closePanelButton, isOpen) {
    isOpen ? sidePanel.classList.add("open") : sidePanel.classList.remove("open");
    closePanelButton.style.display = isOpen ? "block" : "none";
}

// Function to update the photo display based on the checkbox states
function updateSimilarityText(showSimilarity, showScaledSimilarity) {
    const imageContainers = document.querySelectorAll(".image-item-container");
    imageContainers.forEach((imageContainer) => {
        const textOverlay = imageContainer.querySelector(".top-text-overlay");

        const similarityElement = textOverlay.querySelector(".similarity");
        const scaledSimilarityElement = textOverlay.querySelector(".scaled-similarity");

        similarityElement.style.display = showSimilarity ? "block" : "none";
        scaledSimilarityElement.style.display = showScaledSimilarity ? "block" : "none";
    });
}

async function loadSettings() {
    try {
        const response = await fetch(`${SERVER_URL}/get-settings`); // Modify with the actual path to your JSON file
        const settings = await response.json();

        // Set values from settings and update number inputs
        setSliderValue('shuffle-slider', 'shuffle-number', settings.shuffleSpeed);
        setSliderValue('shuffle-dur-slider', 'shuffle-dur-number', settings.shuffleDur);

        setSliderValue('zoom-slider', 'zoom-number', settings.zoomLevel);
        setSliderValue('time-slider', 'refresh-number', settings.refreshTime);
        setSliderValue('fade-slider', 'fade-number', settings.fadeDuration);
        setSliderValue('min-dist-slider', 'eye-number', settings.minEyeDistance);
        setSliderValue('opacity-slider', 'opacity-number', settings.minOpacity);
        setSliderValue('xoffset-slider', 'xoffset-number', settings.xoffset);
        setSliderValue('yoffset-slider', 'yoffset-number', settings.yoffset);

        // Update checkboxes
        document.getElementById('sporadicShuffle').checked = settings.shuffleSporadically;
        document.getElementById('similarity').checked = settings.showSimilarity;
        document.getElementById('scaledSimilarity').checked = settings.showScaledSimilarity;
        document.getElementById('boxCheckbox').checked = settings.boundingBox;
        document.getElementById('landmarksCheckbox').checked = settings.faceLandmarks;
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

function setSliderValue(sliderId, numberInputId, value) {
    const slider = document.getElementById(sliderId);
    const numberInput = document.getElementById(numberInputId);
    slider.value = value;
    numberInput.value = value;
}
function updateDisplayValues() {
    // For each slider-container in the document
    document.querySelectorAll('.slider-container').forEach(container => {
        const slider = container.querySelector('input[type="range"]');
        const numberInput = container.querySelector('input[type="number"]');
        // Update the number input and optionally the span when the slider value changes
        slider.addEventListener('input', () => {
            numberInput.value = slider.value; // Synchronize number input with slider
        });
})
}

function gatherSettings() {
    return {
        shuffleSpeed: document.getElementById('shuffle-slider').value,
        shuffleSporadically: document.getElementById('sporadicShuffle').checked,
        shuffleDur: document.getElementById('shuffle-dur-slider').value,
        zoomLevel: document.getElementById('zoom-slider').value,
        xoffset: document.getElementById('xoffset-slider').value,
        yoffset: document.getElementById('yoffset-slider').value,
        showSimilarity: document.getElementById('similarity').checked,
        showScaledSimilarity: document.getElementById('scaledSimilarity').checked,
        refreshTime: document.getElementById('time-slider').value,
        boundingBox: document.getElementById('boxCheckbox').checked,
        faceLandmarks: document.getElementById('landmarksCheckbox').checked,
        fadeDuration: document.getElementById('fade-slider').value,
        minEyeDistance: document.getElementById('min-dist-slider').value,
        minOpacity: document.getElementById('opacity-slider').value
    };
}

async function saveSettings() {
    try {
        const settings = gatherSettings()
        const response = await fetch(`${SERVER_URL}/save-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });
        console.log(response.ok)
        if (!response.ok) throw new Error('Failed to save settings');
        console.log('Settings saved successfully!');
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}


function addSliderNumberSyncs() {
    // Function to add event listeners to sliders and number inputs
    function addSliderNumberSync(sliderId, numberInputId, updateFunction) {
        const slider = document.getElementById(sliderId);
        const numberInput = document.getElementById(numberInputId);

        slider.addEventListener('input', () => {
            numberInput.value = slider.value;
            if(updateFunction) updateFunction(); // Call update function directly with new value
        });

        numberInput.addEventListener('change', () => {
            slider.value = numberInput.value;
            if(updateFunction) updateFunction(); // Call update function directly with new value
        });
    }

    // Add synchronization for all sliders
    addSliderNumberSync('shuffle-slider', 'shuffle-number');
    addSliderNumberSync('shuffle-dur-slider', 'shuffle-dur-number');

    addSliderNumberSync('zoom-slider', 'zoom-number', handleZoomAndOffset);
    addSliderNumberSync('xoffset-slider', 'xoffset-number', handleZoomAndOffset);
    addSliderNumberSync('yoffset-slider', 'yoffset-number', handleZoomAndOffset);

    addSliderNumberSync('time-slider', 'refresh-number', handleRefreshTime);
    addSliderNumberSync('fade-slider', 'fade-number', handleFadeTime);
    addSliderNumberSync('min-dist-slider', 'eye-number');
    addSliderNumberSync('opacity-slider', 'opacity-number');
}