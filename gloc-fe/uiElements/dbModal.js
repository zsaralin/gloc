import {resetNewDB, SERVER_URL} from "../index.js";
import {activateEnterButton, deactivateEnterButton} from "./overlay.js";
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
    if (lastSelectedDbName !== currentSelectedDbName) {
        console.log(`Database name changed to: ${currentSelectedDbName}`);
        db = currentSelectedDbName;
        try {
            await fetch(`${SERVER_URL}/set-db-name`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newName: currentSelectedDbName }),
            });
            console.log('Database name updated successfully.');
            document.getElementById("chooseDbModal").style.display = "none";
            deactivateEnterButton()
            await resetNewDB();
            activateEnterButton()
        } catch (error) {
            console.error('Error updating database name:', error);
        }
    } else{
        document.getElementById("chooseDbModal").style.display = "none";

    }
}

export function initializeDBModal() {
    document.addEventListener('DOMContentLoaded', function () {
        const modal = document.getElementById("chooseDbModal");
        const btn = document.querySelector(".choose-db-button");
        const span = document.getElementsByClassName("close")[0];
        let lastSelectedDbName; // Track the last selected database name

        btn.onclick = function () {
            lastSelectedDbName = getSelectedDbName(); // Store the initial selected value
            modal.style.display = "block";
        }

        span.onclick = () => closeModal(lastSelectedDbName);
        window.onclick = (event) => {
            if (event.target == modal) {
                closeModal(lastSelectedDbName);
            }
        }
        setSelectedDbName();
        console.log(db)
    });
}