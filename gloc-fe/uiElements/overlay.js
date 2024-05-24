import {setupCamera} from "../index.js";
import {initializeDBModal} from "./dbModal.js";

export function setupLandingPage() {
    const overlay = document.getElementById('overlay');
    if (!overlay) return;

    overlay.innerHTML = getOverlayContent();

    const camAccessBtn = document.querySelector('.enter-button');
    if (camAccessBtn) {
        camAccessBtn.addEventListener('click', async () => {
            camAccessBtn.disabled = true;
            camAccessBtn.innerHTML = 'Accessing Camera<span class="ellipsis"></span>';
            await setupCamera();
            camAccessBtn.disabled = false;
            camAccessBtn.style.display = 'none';
            initializeDBModal();
        });
    }
}

function getOverlayContent() {
    return `
        <div class="overlay-content">
            <button class="language-button">ENGLISH</button> 
            <h2 class="overlay-header">Global Level of Confidence</h2>
            <p class="overlay-text">[Placeholder for Project Info]</p>
            <p class="overlay-text">[Placeholder for Legal Lease]</p>
            <ul class="overlay-list" style="padding-bottom: 15px">
                <li>We will require access to your camera.</li>
                <li>Your facial landmarks will be extracted.</li>
                <li>No data is retained.</li>
            </ul>
            <button class="enter-button loading" disabled ></button>
            <div id="chooseDbModal">
                <div class="modal-content">
                    <h2>Select a Database</h2>
                    <form id="dbForm">
                        ${getDatabaseOptions()}
                    </form>
                </div>
            </div>
            <div id="loadingText" style="margin-top: 10px;"></div>
        </div>
    `;
}

function getDatabaseOptions() {
    return `
        <label class="radio-input">
            <input type="radio" name="database" value="42"/>
            <span class="custom-radio"></span>
            Ayotzinapa (43)
            <p>This is additional text providing more details about the Ayotzinapa database.</p>
        </label>
        <label class="radio-input">
            <input type="radio" name="database" value="small" />
            <span class="custom-radio"></span>
            Flickr-Faces-HQ (3143)
            <p>This paragraph describes the Flickr-Faces-HQ database.</p>
        </label>
    `;
}

export function activateEnterButton() {
    const button = document.getElementsByClassName('enter-button')[0]
    button.classList.remove('loading');
    button.disabled = false; // Enable the button
    button.innerText = "Access My Camera"; // Update button text if needed
}

document.addEventListener('DOMContentLoaded', function () {
    const languageButton = document.querySelector('.language-button');
    languageButton.addEventListener('click', function () {
        languageButton.textContent = languageButton.textContent === 'ENGLISH' ? 'ESPAÑOL' : 'ENGLISH';
    });
});

export function fadeoutOverlay(){
    const overlay = document.getElementById('overlay')
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 1000);
}

const lorep =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pulvinar libero nec nisi vehicula, nec ultricies libero dapibus. Sed ut eros eget ante volutpat pharetra non sit amet turpis. Nullam nec urna velit. Mauris commodo fringilla ultrices. Vivamus fringilla nec sapien ac scelerisque. "

