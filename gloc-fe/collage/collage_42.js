import {reset} from "../index.js";
const imageFolder = `./images/42` ;

export async function addImageClickListener42(imageItemContainer, imageData) {
    // Define the named async function for the event listener outside of the addEventListener call
    const clickListener = async function () {
        const label = imageData.name
        // Create the modal container
        const playPauseButton = document.getElementById('playPauseButton');
        if (playPauseButton) {
            playPauseButton.click();
        }
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.zIndex = '1000';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        // modal.style.overflow = 'hidden'; // In case you need to control overflow

        // Prevent clicks on the modal from closing it
        modal.addEventListener('click', function () {
            modal.remove();
            if (playPauseButton) {
                playPauseButton.click();
            }
        });
        // Inner modal (white content container)
        const contentModal = document.createElement('div');
        contentModal.style.background = 'white';
        // contentModal.style.borderRadius = '8px'; // Gives the sleek look
        contentModal.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        contentModal.style.margin = 'auto';
        contentModal.style.height = 'calc(100% - 50px)'; // Adjust 40px to increase/decrease the total vertical margin
        contentModal.style.width = 'auto'//'calc(100% - 50px)';
        // contentModal.style.overflow = 'hidden'; // Add scroll for content that exceeds the modal's height
        contentModal.style.padding = '15px 15px 15px 15px';
        contentModal.style.maxWidth = '80%'; // Maintain the aspect ratio of the image

        contentModal.style.position = 'relative'; // This makes it the reference point for closeButton

        // New inner wrapper for managing overflow
        const innerWrapper = document.createElement('div');
        innerWrapper.style.display = 'flex';
        innerWrapper.style.flexDirection = 'column';
        innerWrapper.style.height = '100%'; // Take up full height of contentModal
        innerWrapper.style.overflow = 'hidden'; // Hide overflow here
        innerWrapper.style.justifyContent = 'center'; // Center children vertically in the main axis if needed
        // innerWrapper.style.maxWidth = '80%'; // Maintain the aspect ratio of the image
        innerWrapper.style.width = 'auto'//'calc(100% - 50px)';


        const photo = label + '.png';
        const lastTwoDigits = label.slice(-2); // Gets the last two characters/digits of the label
        const name = label//names[parseInt(lastTwoDigits, 10)]; // Parse the digits to get the name index
        // const singleImageUrl = `${imageFolder}/${photo}`; // Construct the image URL

        // Create the image element
        const imageElement = document.createElement('img');
        imageElement.src = imageData.srcOrig; // Set the source of the image
        imageElement.alt = name; // Use the name as alt text for accessibility
        imageElement.style.width = 'auto'; // Make the image take up the full width of its container
        imageElement.style.height = '100%'; // Maintain the aspect ratio of the image
        imageElement.style.overflow = 'hidden'; // In case you need to control overflow

        // Create a container for the image to control layout/styling more easily
        const imageContainer = document.createElement('div');
        imageElement.style.maxWidth = '100%'; // Allow the image to scale down if necessary, but not up
        imageElement.style.height = 'auto'; // Maintain aspect ratio
        imageElement.style.display = 'block'; // Prevent inline default behavior which can add unwanted space

        // For the image container, ensure it can scale but also respects the image's natural size and aspect ratio
        imageContainer.style.display = 'flex'; // Use flex to center the image
        imageContainer.style.alignItems = 'center';
        imageContainer.style.justifyContent = 'center';
        // imageContainer.style.overflow = 'hidden'; // In case you need to control overflow

        // imageContainer.style.maxWidth = '90%'; // Limit how large the container can get, but this won't enforce aspect ratio by itself
        imageContainer.style.width = 'auto'; // Allow the container to grow with the image size
        imageContainer.style.margin = 'auto'; // Center the container in the parent

        // imageContainer.style.overflow = 'hidden'; // In case you need to control overflow
        imageContainer.appendChild(imageElement); // Add the image to the container

        // Append the image container to the contentModal (the white part of the modal)


        // Ensure clicks inside the contentModal don't close the modal
        contentModal.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        // Now, add the text content in a scrollable container below the image
        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');
        textContainer.style.overflowY = 'auto'; // Make only the Y-axis (vertical) scrollable
        textContainer.style.width = 'auto'; // Maintain the aspect ratio of the image
        textContainer.style.minHeight = '25%';

        textContainer.innerHTML = `
            <p>${name}</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit justo et neque tincidunt, eu mattis sapien suscipit.
                         Quisque varius, augue ac sodales auctor, tellus dolor ullamcorper neque, at viverra nisl massa vel ligula. Sed lacinia tristique lacus, sit amet feugiat odio volutpat nec. </p>
                        <p>Vivamus nec purus a mi viverra volutpat. Sed gravida, risus a dictum dignissim, leo felis sagittis libero, nec malesuada velit ex a arcu. Nulla facilisi.</p>
                         <p>Cras fringilla urna ut lorem tincidunt, quis varius libero convallis. Nulla facilisi. Etiam consectetur varius erat eget euismod. Phasellus venenatis vel velit id fermentum. </p>
                         <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce aliquet, risus vel elementum hendrerit, ipsum augue dictum neque, at volutpat turpis
                         velit id odio. Sed facilisis nec arcu vel iaculis. In eleifend quam vitae justo faucibus sed tristique elit rhoncus. Sed suscipit orci eget efficitur vehicula. Vivamus ac velit quis libero aliquam laoreet.</p>
        `;

        // Append the text container below the image container within the contentModal
        innerWrapper.appendChild(imageContainer);
        innerWrapper.appendChild(textContainer);
        contentModal.appendChild(innerWrapper);
        // Create the close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✖'; // Use HTML entity for "X"
        closeButton.style.position = 'absolute'; // Use 'fixed' to ensure it's relative to the viewport
        closeButton.style.zIndex = '1001';
        closeButton.style.border = 'none';
        // closeButton.style.border = '1px solid grey'; // Optionally add a border for visibility
        // closeButton.style.borderRadius = '50%'; // Optional: make it circular
        closeButton.style.background = 'none';
        // closeButton.style.color = 'grey';
        closeButton.style.fontSize = '10px'; // Example: Adjust as needed
        closeButton.style.width = '18px'; // Specify a size for the button
        closeButton.style.height = '18px' ; // Ensure the button is circular
        closeButton.style.display = 'flex'; // Use flexbox to center the 'X'
        closeButton.style.alignItems = 'center'; // Center the content vertically
        closeButton.style.justifyContent = 'center'; // Center the content horizontally

        closeButton.style.cursor = 'pointer';
        closeButton.style.overflow = 'hidden'; // Ensure content doesn't overflow button
        closeButton.style.padding = '0';
        closeButton.style.top = '0px'
        closeButton.style.right = '0px'
        closeButton.style.lineHeight = '18px'; // Ensure vertical centering

        // Append the close button to the modal
        contentModal.appendChild(closeButton);
        modal.appendChild(contentModal);

        // Function to close the modal
        closeButton.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent click through
            if (playPauseButton) {
                playPauseButton.click();
            }
            modal.remove(); // Remove the modal from the DOM when the button is clicked
        });
        imageElement.onload = async () => {
            document.body.appendChild(modal);

        }
        // Append the modal to the body to display it
    };

    // Remove the previous listener to prevent duplicates
    if (imageItemContainer._clickListener42) {
        imageItemContainer.removeEventListener('click', imageItemContainer._clickListener42);
    }

    // Save the reference to the listener on the element itself for future removal
    imageItemContainer._clickListener42 = clickListener;

    // Add the new event listener
    imageItemContainer.addEventListener('click', clickListener);
}

function addImageClickListeners() {
    const imageElements = document.querySelectorAll('.photo-container img');
    imageElements.forEach(img => {
        img.addEventListener('click', function () {
            openModal(img.src);
        });
    });
}

function openModal(imageSrc) {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalImage = document.createElement('img');
    modalImage.src = imageSrc;

    modal.appendChild(modalImage);

    const overlayContainer = document.createElement('div');

    document.body.appendChild(modal);

    modal.addEventListener('click', function () {
        modal.remove();
    });

    modal.style.display = 'block';
}

const names = [
    "Jesús Jovany Rodríguez Tlatempa",
    "Mauricio Ortega Valerio",
    "Martín Getsemany Sánchez García",
    "Magdaleno Rubén Lauro Villegas",
    "Giovanni Galindo Guerrero",
    "José Luis Luna Torres",
    "Julio César López Patolzin",
    "Jonás Trujillo González",
    "Miguel Ángel Hernández Martínez",
    "Christian Alfonso Rodríguez",
    "José Ángel Navarrete González",
    "Carlos Iván Ramirez Villareal",
    "José Ángel Campos Cantor",
    "Israel Caballero Sánchez",
    "Israel Jacinto Lugardo",
    "Antonio Santana Maestro",
    "Christian Tomás Colón Garnica",
    "Luis Ángel Francisco Arzola",
    "Miguel Ángel Mendoza Zacarias",
    "Benjamín Ascencio Bautista",
    "Alexander Mora Venancio",
    "Leonel Castro Abarca",
    "Everardo Rodríguez Bello",
    "Doriam González Parral",
    "Jorge Luis González Parral",
    "Marcial Pablo Baranda",
    "Jorge Aníbal Cruz Mendoza",
    "Abelardo Vázquez Peniten",
    "Cutberto Ortiz Ramos",
    "Bernardo Flores Alcaraz",
    "Jhosivani Guerrero De La Cruz",
    "Luis Ángel Abarca Carrillo",
    "Marco Antonio Gómez Molina",
    "Saul Bruno Garcia",
    "Jorge Antonio Tizapa Legideño",
    "Abel García Hernández",
    "Carlos Lorenzo Hernández Muñoz",
    "Adán Abraján De La Cruz",
    "Felipe Arnulfo Rosa",
    "Emiliano Alen Gaspar De La Cruz",
    "César Manuel González Hernandez",
    "Jorge Álvarez Nava",
    "José Eduardo Bartolo Tlatempa"
];