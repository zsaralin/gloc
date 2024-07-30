import { SERVER_URL } from "../index.js";

export async function addImageClickListener42(imageItemContainer, imageData) {
    const clickListener = async function () {
        // pause video when modal is open
        const playPauseButton = document.getElementById('playPauseButton');
        if (playPauseButton) {
            playPauseButton.click();
        }

        // close modal on click outside of content
        const modal = document.createElement('div');
        modal.className = 'bio-modal-overlay';
        modal.addEventListener('click', function (event) {
            if (event.target === modal) { // Check if the clicked element is the modal itself and not a child
                modal.remove();
                if (playPauseButton) {
                    playPauseButton.click();
                }
            }
        });

        const contentModal = document.createElement('div');
        contentModal.className = 'bio-content-modal';

        const innerWrapper = document.createElement('div');
        innerWrapper.className = 'bio-inner-wrapper';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'bio-image-container';

        const label = imageData.jsonData.nombre;

        // Create and append img elements for each imagePath
        imageData.imagePath.forEach(imagePath => {
            const imageElement = document.createElement('img');
            imageElement.src = `${SERVER_URL}${imagePath}`; // Use the full URL
            imageElement.alt = label;
            imageElement.style.marginBottom = '10px'; // Add some spacing between images
            imageContainer.appendChild(imageElement);
        });

        // Show modal when images are loaded
        let imagesLoaded = 0;
        imageContainer.querySelectorAll('img').forEach(img => {
            img.onload = function() {
                imagesLoaded++;
                if (imagesLoaded === imageData.imagePath.length) {
                    modal.style.visibility = 'visible';
                    document.body.appendChild(modal);
                }
            };
        });

        // Function to format key names to have spaces and capitalization
        function formatKeyName(key) {
            return key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
        }

        // Generate content for textContainer based on JSON data
        let contentHtml = `<p>${label}</p>`;
        for (const [key, value] of Object.entries(imageData.jsonData)) {
            if (key !== 'numRecords' && key !== 'name') {
                contentHtml += `<p>${formatKeyName(key)}: ${value}</p>`;
            }
        }

        const textContainer = document.createElement('div');
        textContainer.className = 'bio-text-container';
        textContainer.innerHTML = contentHtml;

        innerWrapper.appendChild(imageContainer);
        innerWrapper.appendChild(textContainer);

        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'bio-button-wrapper';

        const appointmentButton = document.createElement('button');
        appointmentButton.className = 'appt-button';
        appointmentButton.textContent = 'Set Up Appointment at Genetic Bank';
        appointmentButton.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        buttonWrapper.appendChild(appointmentButton);

        innerWrapper.appendChild(buttonWrapper);
        contentModal.appendChild(innerWrapper);

        const closeButton = document.createElement('button');
        closeButton.className = 'bio-close-button';
        closeButton.innerHTML = '✖';
        closeButton.addEventListener('click', function (event) {
            event.stopPropagation();
            modal.remove();
            if (playPauseButton) {
                playPauseButton.click();
            }
        });

        contentModal.appendChild(closeButton);
        modal.appendChild(contentModal);
        document.body.appendChild(modal);
    };

    if (imageItemContainer._clickListener42) {
        imageItemContainer.removeEventListener('click', imageItemContainer._clickListener42);
    }
    imageItemContainer._clickListener42 = clickListener;
    imageItemContainer.addEventListener('click', clickListener);
}
