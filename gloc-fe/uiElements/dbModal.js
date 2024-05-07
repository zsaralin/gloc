import {resetNewDB, SERVER_URL} from "../index.js";
import {activateEnterButton, activateExperienceButton, deactivateEnterButton} from "./overlay.js";

export let db = '42';

// Function to fetch current database name from the server
async function fetchCurrentDbName() {
    try {
        const response = await fetch(`${SERVER_URL}/get-db-name`);
        const data = await response.json();
        return data.dbName;
    } catch (error) {
        console.error('Error fetching current database name:', error);
        return null;
    }
}

// Function to get the selected database name from the radio buttons
function getSelectedDbName() {
    const radios = document.querySelectorAll('input[name="database"]');
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}

// Function to set the selected database name based on the fetched current name
async function setSelectedDbName() {
    const currentDbName = await fetchCurrentDbName();
    if (currentDbName) {
        const radios = document.querySelectorAll('input[name="database"]');
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].value === currentDbName) {
                radios[i].checked = true;
                break;
            }
        }
        db = currentDbName
    }
}

// Function to handle closing the modal
async function closeModal(lastSelectedDbName) {
    const currentSelectedDbName = getSelectedDbName();
    // if (lastSelectedDbName !== currentSelectedDbName) {
    console.log(`Database name changed to: ${currentSelectedDbName}`);
    db = currentSelectedDbName;
    try {
        await fetch(`${SERVER_URL}/set-db-name`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({newName: currentSelectedDbName}),
        });
        console.log('Database name updated successfully.');
        document.getElementById("chooseDbModal").style.display = "none";
        const button  = document.querySelector(".enter-button")
        button.disabled = true; // Enable the button
        button.innerHTML = 'Loading Database<span class="ellipsis"></span>';
        await resetNewDB();
        activateExperienceButton()
    } catch (error) {
        console.error('Error updating database name:', error);
    }
}

export function initializeDBModal() {
    const modal = document.getElementById("chooseDbModal");
    const btn = document.querySelector(".enter-button");
    const close = document.getElementsByClassName("close")[0];
    const ok = document.getElementsByClassName("ok-button")[0];

    const dbForm = document.getElementById('dbForm');

    dbForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
    });

    let lastSelectedDbName; // Track the last selected database name

    function handleClick() {
        lastSelectedDbName = getSelectedDbName();
        const modal = document.getElementById('chooseDbModal');
        modal.style.display = "flex";
    }
    btn.addEventListener('click', handleClick);

    close.onclick = () => {
        document.getElementById("chooseDbModal").style.display = "none";
    }
    window.onclick = (event) => {
        if (event.target == modal) {
            document.getElementById("chooseDbModal").style.display = "none";
        }
    }
    ok.onclick = () => {
        btn.innerHTML = 'Enter the Experience'
        btn.removeEventListener('click', handleClick);
        closeModal(lastSelectedDbName);
    }

    setSelectedDbName();
}