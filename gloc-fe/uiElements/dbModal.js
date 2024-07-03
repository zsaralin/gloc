import {enterMainPage, resetNewDB, SERVER_URL} from "../index.js";

export let db = '42';

async function setDb(selectedDbName) {
    console.log(`Database name changed to: ${selectedDbName}`);
    db = selectedDbName;  // Update the global database variable directly
    try {
        await fetch(`${SERVER_URL}/set-db-name`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newName: selectedDbName }),
        });
        document.getElementById("chooseDbModal").style.display = "none";
        const loadingText = document.getElementById("loadingText");
        let dotCount = 0;
        loadingText.innerHTML = "Loading database";
        const intervalId = setInterval(() => {
            dotCount = (dotCount + 1) % 4; // Cycles dot count from 0 to 3
            loadingText.innerHTML = "Loading database" + ".".repeat(dotCount);
        }, 200);

        // await resetNewDB();
        clearInterval(intervalId);
        enterMainPage();
    } catch (error) {
        console.error('Error updating database name:', error);
    }
}

export function initializeDBModal() {
    const modal = document.getElementById("chooseDbModal");
    modal.style.display = "flex";

    modal.addEventListener('change', function(event) {
        if (event.target.type === 'radio') {
            setDb(event.target.value);  // Pass the radio value directly
        }
    });
}