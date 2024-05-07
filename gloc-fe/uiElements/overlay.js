// helper function to print strings to html document as a log
import {enterExperience, resetNewDB, setupCamera} from "../index.js";
import {initializeDBModal} from "./dbModal.js";
import {startFaceRecognition} from "../faceRecognition.js";
import {startShuffle} from "../imageGrid/startShuffle.js";

export function setupLandingPage() {
    const overlayContent = `
        <div class="overlay-content">
        <button class="language-button">ENGLISH</button> 

<!--            <button class="choose-db-button">Change Database</button> -->
            <h2 class="overlay-header">Global Level of Confidence</h2>
            <p class="overlay-text">[Placeholder for Project Info]</p>
            <p class="overlay-text">[Placeholder for Legal Lease]</p>

            <ul class="overlay-list">
                <li>We will require access to your camera.</li>
                <li>Your facial landmarks will be extracted.</li>
                <li>No data is retained.</li>
            </ul>
            <button class="enter-button loading" disabled ></button>
        </div>
        <!-- Modal for choosing database -->
        <div id="chooseDbModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Select a Database</h2>
                <form id="dbForm">
                <label>
                    <input type="radio" name="database" value="42" checked/>
                    Ayotzinapa (43)
                    <p>This is additional text providing more details about the Ayotzinapa database.</p>
                </label>
                <label>
                    <input type="radio" name="database" value="small" />
                    Flickr-Faces-HQ (3143)
                    <p>This paragraph describes the Flickr-Faces-HQ database.</p>
                </label>
                    <button class="ok-button">OK</button>

            </form>
            </div>
        </div>
    `;

    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.innerHTML = overlayContent;
        const button = document.querySelector('.enter-button');
        async function handleButtonClick() {
            button.disabled = true; // Enable the button
            button.innerHTML = 'Accessing Camera<span class="ellipsis"></span>';
            await setupCamera();
            button.disabled = false; // Enable the button
            button.innerHTML = 'Select Database';
            button.removeEventListener('click', handleButtonClick);  // Remove the listener
            initializeDBModal();
        }

        button.addEventListener('click', handleButtonClick);

    }
}

const lorep =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pulvinar libero nec nisi vehicula, nec ultricies libero dapibus. Sed ut eros eget ante volutpat pharetra non sit amet turpis. Nullam nec urna velit. Mauris commodo fringilla ultrices. Vivamus fringilla nec sapien ac scelerisque. "


export function activateEnterButton() {
    const button = document.getElementsByClassName('enter-button')[0]
    button.classList.remove('loading');
    button.disabled = false; // Enable the button
    button.innerText = "Access My Camera"; // Update button text if needed
}

export function activateExperienceButton() {
    const button = document.getElementsByClassName('enter-button')[0]
    button.disabled = true; // Enable the button
    button.classList.remove('loading');
    button.disabled = false; // Enable the button
    button.innerText = "Start"; // Update button text if needed
    button.addEventListener('click', enterExperience);
}
export function deactivateEnterButton() {
    const button = document.getElementsByClassName('enter-button')[0];
    button.classList.add('loading'); // Add a 'loading' class to indicate it's being processed or shouldn't be interacted with
    button.disabled = true; // Disable the button to prevent clicks
    button.innerText = ""; // Update button text to indicate the loading or disabled state
}


document.addEventListener('DOMContentLoaded', function() {
    const languageButton = document.querySelector('.language-button');
    languageButton.addEventListener('click', function() {
        languageButton.textContent = languageButton.textContent === 'ENGLISH' ? 'ESPAÑOL' : 'ENGLISH';
    });
});