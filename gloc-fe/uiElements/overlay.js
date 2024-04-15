// helper function to print strings to html document as a log
import {resetNewDB, setupCamera} from "../index.js";
import {initializeDBModal} from "./dbModal.js";
import {startFaceRecognition} from "../faceRecognition.js";
import {startShuffle} from "../imageGrid/startShuffle.js";

export function setupLandingPage() {
    const overlayContent = `
        <div class="overlay-content">
            <button class="choose-db-button">Change Database</button> 
            <h2 class="overlay-header">Global Level of Confidence</h2>
            <p class="overlay-text">${lorep}</p>
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
                    </label>
                    <label>
                        <input type="radio" name="database" value="small" />
                        Flickr-Faces-HQ (3143)
                    </label>
                </form>
            </div>
        </div>
    `;

    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.innerHTML = overlayContent;
        const button = document.querySelector('.enter-button');
        const accessCamera = async () => {
            button.innerHTML = 'Accessing Camera<span class="ellipsis"></span>';
            await setupCamera();
        };
        button.addEventListener('click', async function () {
            await accessCamera();
        });

        initializeDBModal()
    }
}

const lorep =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pulvinar libero nec nisi vehicula, nec ultricies libero dapibus. Sed ut eros eget ante volutpat pharetra non sit amet turpis. Nullam nec urna velit. Mauris commodo fringilla ultrices. Vivamus fringilla nec sapien ac scelerisque. "


export function activateEnterButton() {
    const button = document.getElementsByClassName('enter-button')[0]
    button.classList.remove('loading');
    button.disabled = false; // Enable the button
    button.innerText = "Enter the Experience"; // Update button text if needed
}

export function deactivateEnterButton() {
    const button = document.getElementsByClassName('enter-button')[0];
    button.classList.add('loading'); // Add a 'loading' class to indicate it's being processed or shouldn't be interacted with
    button.disabled = true; // Disable the button to prevent clicks
    button.innerText = ""; // Update button text to indicate the loading or disabled state
}