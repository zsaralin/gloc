import {reset} from "../index.js";
const imageFolder = `./images/42` ;

export async function addImageClickListener42(imageItemContainer, imageData) {
    const clickListener = async function () {
        const label = imageData.name

        const playPauseButton = document.getElementById('playPauseButton');
        if (playPauseButton) {
            playPauseButton.click();
        }
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            visibility: hidden;  // Initially set to hidden to prevent flash of unstyled content

        `;
        modal.addEventListener('click', function () {
            modal.remove();
            if (playPauseButton) {
                playPauseButton.click();
            }
        });

        const contentModal = document.createElement('div');
        contentModal.style.cssText = `
                border-radius: 5px;

            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: auto;
            padding: 20px 20px 10px 20px;
            width: auto;
            max-width: 80%;
            height: calc(100% - 50px);
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `;

        const innerWrapper = document.createElement('div');
        innerWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
            height: 100%;
        `;

        const imageContainer = document.createElement('div');
        imageContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            height: auto; 
        `;

        const imageElement = document.createElement('img');
        imageElement.src = imageData.srcOrig
        imageElement.alt = label;//names[parseInt(imageData.label.slice(-2), 10)];
        imageElement.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        `;
        imageContainer.appendChild(imageElement);
        imageElement.onload = function() {
            modal.style.visibility = 'visible';  // Make modal visible only after image is loaded
            document.body.appendChild(modal);
        };

        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        textContainer.style.cssText = `
            overflow-y: auto;
            flex: 1;
            min-height: 20%;
        `;
        textContainer.innerHTML = `<p>${label}</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit justo et neque tincidunt, eu mattis sapien suscipit.
                         Quisque varius, augue ac sodales auctor, tellus dolor ullamcorper neque, at viverra nisl massa vel ligula. Sed lacinia tristique lacus, sit amet feugiat odio volutpat nec. </p>
                        <p>Vivamus nec purus a mi viverra volutpat. Sed gravida, risus a dictum dignissim, leo felis sagittis libero, nec malesuada velit ex a arcu. Nulla facilisi.</p>
                         <p>Cras fringilla urna ut lorem tincidunt, quis varius libero convallis. Nulla facilisi. Etiam consectetur varius erat eget euismod. Phasellus venenatis vel velit id fermentum. </p>
                         <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce aliquet, risus vel elementum hendrerit, ipsum augue dictum neque, at volutpat turpis
                         velit id odio. Sed facilisis nec arcu vel iaculis. In eleifend quam vitae justo faucibus sed tristique elit rhoncus. Sed suscipit orci eget efficitur vehicula. Vivamus ac velit quis libero aliquam laoreet.</p>`

        innerWrapper.appendChild(imageContainer);
        innerWrapper.appendChild(textContainer);

        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.display = 'flex';
        buttonWrapper.style.justifyContent = 'flex-end';
        buttonWrapper.style.marginTop = '5px';
        buttonWrapper.style.width = '100%'; // Ensures the wrapper stretches across its parent


        const appointmentButton = document.createElement('button');
        appointmentButton.textContent = 'Set Up Appointment at Genetic Bank';
        appointmentButton.style.cssText = `
        padding: 5px 10px;
        font-size: 10px;
        border: none;
        border-radius: 5px;
        background-color: grey;
        color: #ffffff;
        cursor: pointer;
        right: 0 ; 
    `;

        appointmentButton.addEventListener('click', function(event) {
            event.stopPropagation(); // This prevents the event from bubbling up to parent elements
        });
        buttonWrapper.appendChild(appointmentButton);
        innerWrapper.appendChild(buttonWrapper);

        contentModal.appendChild(innerWrapper);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✖';
        closeButton.style.cssText = `
            position: absolute;
            top: 4px;
            right: 4px;
            border: none;
            background: none;
            color: grey;
            font-size: .5rem;
            cursor: pointer;
        `;
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