// import {reset} from "../index.js";
// const imageFolder = `./images/42` ;
//
// export async function addImageClickListener42(imageItemContainer, label) {
//     imageItemContainer.addEventListener('click', async function () {
//         try {
//             console.log('LABE LIS ' + label)
//             const playPauseButton = document.getElementById('playPauseButton');
//             if (playPauseButton) {
//                 playPauseButton.click();
//             }
//             const loadingHTML = `
//                 <html lang="en">
//                     <head>
//                         <title>Photo Collage</title>
//                         <link rel="stylesheet" type="text/css" href="./collage.css">
//                         <style>
//                             /* Loading spinner styles */
//                             .overlay {
//                                 display: none;
//                                 position: fixed;
//                                 top: 0;
//                                 left: 0;
//                                 width: 100%;
//                                 height: 100%;
//                                 background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent white background */
//                                 z-index: 9999; /* Ensure the overlay is on top of other elements */
//                                 }
//                             .spinner {
//                                 border: 4px solid rgba(0, 0, 0, 0.1);
//                                 border-top: 4px solid grey;
//                                 border-radius: 50%;
//                                 width: 40px;
//                                 height: 40px;
//                                 animation: spin 1s linear infinite;
//                             }
//                             @keyframes spin {
//                                 0% { transform: rotate(0deg); }
//                                 100% { transform: rotate(360deg); }
//                             }
//                         </style>
//                     </head>
//                     <body>
//                     <div id="loading-overlay" class="overlay">
//                             <div class="spinner"></div>
//                         </div>
//                     </body>
//                 </html>
//             `;
//             document.documentElement.innerHTML = loadingHTML;
//             const photo = label + '.png'
//             const lastTwoDigits = label.slice(-2); // Gets the last two characters/digits of the label
//             const name = names[parseInt(lastTwoDigits)]
//             let imagesHtml = '';
//             // If there's only one image, create HTML to display it taking up the full area
//             const singleImageUrl = `${imageFolder}/${photo}`;
//             imagesHtml = `<div class="full-width-image-container" style="display: flex; align-items: center; justify-content: center; overflow: hidden;">
//     <img src="${singleImageUrl}" alt="Image" style="width: 100%; height: auto;">
//     </div>`;
//
//             const newQueryString = `collage`; // Replace with your desired query string
//             const newURL = `${window.location.origin}${window.location.pathname}?${newQueryString}`;
//
//             history.replaceState({}, '', newURL);
//             history.pushState({}, null, newURL);
//             const contentContainer = document.createElement('div');
//             contentContainer.classList.add('content-container');
//             // const contentContainer = document.createElement('div');
//             contentContainer.innerHTML = `
//                 <html lang="en">
//                     <head>
//                         <title>Photo Collage</title>
//                         <link rel="stylesheet" type="text/css" href="./collage.css">
//                     </head>
//                     <body>
//                         <div class="photo-container">
//                             ${imagesHtml}
//                         </div>
//                         <div class="text-container">
//                            <div class="text-container">
//                            <p>${name}</p>
//                         <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit justo et neque tincidunt, eu mattis sapien suscipit.
//                         Quisque varius, augue ac sodales auctor, tellus dolor ullamcorper neque, at viverra nisl massa vel ligula. Sed lacinia tristique lacus, sit amet feugiat odio volutpat nec. </p>
//                         <p>Vivamus nec purus a mi viverra volutpat. Sed gravida, risus a dictum dignissim, leo felis sagittis libero, nec malesuada velit ex a arcu. Nulla facilisi.</p>
//                         <p>Cras fringilla urna ut lorem tincidunt, quis varius libero convallis. Nulla facilisi. Etiam consectetur varius erat eget euismod. Phasellus venenatis vel velit id fermentum. </p>
//                         <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce aliquet, risus vel elementum hendrerit, ipsum augue dictum neque, at volutpat turpis
//                         velit id odio. Sed facilisis nec arcu vel iaculis. In eleifend quam vitae justo faucibus sed tristique elit rhoncus. Sed suscipit orci eget efficitur vehicula. Vivamus ac velit quis libero aliquam laoreet.</p>
//                     </div>
//                         </div>
//                     </body>
//                 </html>
//             `;
//             document.documentElement.innerHTML = contentContainer.innerHTML;
//             addImageClickListeners();
//
//         } catch (error) {
//             console.error(error);
//         }
//     });
// }
//
// function addImageClickListeners() {
//     const imageElements = document.querySelectorAll('.photo-container img');
//     imageElements.forEach(img => {
//         img.addEventListener('click', function () {
//             openModal(img.src);
//         });
//     });
// }
//
// function openModal(imageSrc) {
//     const modal = document.createElement('div');
//     modal.classList.add('modal');
//
//     const modalImage = document.createElement('img');
//     modalImage.src = imageSrc;
//
//     modal.appendChild(modalImage);
//
//     const overlayContainer = document.createElement('div');
//
//     document.body.appendChild(modal);
//
//     modal.addEventListener('click', function () {
//         modal.remove();
//     });
//
//     modal.style.display = 'block';
// }
//
// const names = [
//     "Jesús Jovany Rodríguez Tlatempa",
//     "Mauricio Ortega Valerio",
//     "Martín Getsemany Sánchez García",
//     "Magdaleno Rubén Lauro Villegas",
//     "Giovanni Galindo Guerrero",
//     "José Luis Luna Torres",
//     "Julio César López Patolzin",
//     "Jonás Trujillo González",
//     "Miguel Ángel Hernández Martínez",
//     "Christian Alfonso Rodríguez",
//     "José Ángel Navarrete González",
//     "Carlos Iván Ramirez Villareal",
//     "José Ángel Campos Cantor",
//     "Israel Caballero Sánchez",
//     "Israel Jacinto Lugardo",
//     "Antonio Santana Maestro",
//     "Christian Tomás Colón Garnica",
//     "Luis Ángel Francisco Arzola",
//     "Miguel Ángel Mendoza Zacarias",
//     "Benjamín Ascencio Bautista",
//     "Alexander Mora Venancio",
//     "Leonel Castro Abarca",
//     "Everardo Rodríguez Bello",
//     "Doriam González Parral",
//     "Jorge Luis González Parral",
//     "Marcial Pablo Baranda",
//     "Jorge Aníbal Cruz Mendoza",
//     "Abelardo Vázquez Peniten",
//     "Cutberto Ortiz Ramos",
//     "Bernardo Flores Alcaraz",
//     "Jhosivani Guerrero De La Cruz",
//     "Luis Ángel Abarca Carrillo",
//     "Marco Antonio Gómez Molina",
//     "Saul Bruno Garcia",
//     "Jorge Antonio Tizapa Legideño",
//     "Abel García Hernández",
//     "Carlos Lorenzo Hernández Muñoz",
//     "Adán Abraján De La Cruz",
//     "Felipe Arnulfo Rosa",
//     "Emiliano Alen Gaspar De La Cruz",
//     "César Manuel González Hernandez",
//     "Jorge Álvarez Nava",
//     "José Eduardo Bartolo Tlatempa"
// ];