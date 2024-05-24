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
        modal.addEventListener('click', function () {
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

        const label = imageData.name;

        const imageElement = document.createElement('img');
        imageElement.src = imageData.srcOrig;
        imageElement.alt = label;
        imageContainer.appendChild(imageElement);

        // show modal when image is loaded
        imageElement.onload = function() {
            modal.style.visibility = 'visible';
            document.body.appendChild(modal);
        };

        const textContainer = document.createElement('div');
        textContainer.className = 'bio-text-container';
        textContainer.innerHTML = `<p>${label}</p> ${dummyText}`;

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

const dummyText =
    `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit justo et neque tincidunt, eu mattis sapien suscipit.
       Quisque varius, augue ac sodales auctor, tellus dolor ullamcorper neque, at viverra nisl massa vel ligula. Sed lacinia tristique lacus, sit amet feugiat odio volutpat nec.</p>
    <p>Vivamus nec purus a mi viverra volutpat. Sed gravida, risus a dictum dignissim, leo felis sagittis libero, nec malesuada velit ex a arcu. Nulla facilisi.</p>
    <p>Cras fringilla urna ut lorem tincidunt, quis varius libero convallis. Nulla facilisi. Etiam consectetur varius erat eget euismod. Phasellus venenatis vel velit id fermentum.</p>
    <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce aliquet, risus vel elementum hendrerit, ipsum augue dictum neque, at volutpat turpis
       velit id odio. Sed facilisis nec arcu vel iaculis. In eleifend quam vitae justo faucibus sed tristique elit rhoncus. Sed suscipit orci eget efficitur vehicula. Vivamus ac velit quis libero aliquam laoreet.</p>`;
