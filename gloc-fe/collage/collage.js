// Replace this with your folder path
import {reset} from "../index.js";
import {resetAbortController} from "../faceRecognition.js";

const imageFolder = `./images/small` ;
const imageFileNames = [
    '001_fe3347c0.jpg',
    // '002_8f8da10e.jpg',
    '003_57612506.jpg',
    // '004_f61e7d0c.jpg',
    // '005_582c121a.jpg',
    // '006_9135205d.jpg',
    // '007_cabbfcbb.jpg',
    // '008_d1f87068.jpg',
    '009_fb3e6174.jpg',
    '010_f99d79e3.jpg',
    '011_7344ca35.jpg',
    '012_cfcd4007.jpg',
    '013_95ecbd39.jpg',
    '014_0d29db88.jpg',
    '015_8bac79b5.jpg',
    '016_8945d6ca.jpg',
    // '017_e28ea9d4.jpg',
    // '018_fcafe1a8.jpg',
    // '019_57ab290d.jpg',
    // '020_4c4b655f.jpg',
    // '021_6e419870.jpg',
    // '022_b497b92e.jpg',
    // '023_7781dd1c.jpg',
    // '024_ca32be97.jpg',
    // '025_41cee764.jpg',
    // '026_2828fcaf.jpg',
    // '027_58887f30.jpg'
];

// Define the showImage function
async function findBestColumnConfiguration(imageFileNames) {
    let bestNumColumns = 3;
    let bestHeightDifference = Infinity;
    let bestColumns = [];
    let i = imageFileNames.length < 6 ? 1 : (imageFileNames.length < 12 ? 2 : 3);
    // Try both 3 and 5 columns
    for (let numColumns = i; numColumns <= i; numColumns++) {
        const {columns, heightDifference} = await distributeImagesEqually(imageFileNames, numColumns);

        // If the current configuration has a smaller height difference, update the best configuration
        if (heightDifference < bestHeightDifference) {
            bestHeightDifference = heightDifference;
            bestNumColumns = numColumns;
            bestColumns = columns;
        }
    }

    return {bestColumns};
}

async function distributeImagesEqually(imageFileNames, numColumns) {
    const columns = Array.from({length: numColumns}, () => []);
    const columnHeights = Array(numColumns).fill(0);

    // Function to load image asynchronously and return a promise
    function loadImageAsync(imageUrl) {
        return new Promise(async (resolve) => {
            const img = new Image();
            img.src = imageUrl;

            // Wait for the image to load
            img.onload = function () {
                resolve({width: img.width, height: img.height});
            };

            // Handle error if the image fails to load
            img.onerror = function () {
                console.error(`Error loading image: ${imageUrl}`);
                resolve(null);
            };
        });
    }

    // Create an array of promises for loading all images
    const imageLoadingPromises = imageFileNames.map((fileName) => {
        const imageUrl = `${imageFolder}/${fileName}`;
        return loadImageAsync(imageUrl);
    });

    // Wait for all image loading promises to resolve
    const imageDimensionsArray = await Promise.all(imageLoadingPromises);

    // Process image dimensions and distribute them equally
    imageDimensionsArray.forEach(({width, height}, index) => {
        const aspectRatio = width / height;
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

        columns[shortestColumnIndex].push(`
            <div class="image-container">
                <img src="${imageFolder}/${imageFileNames[index]}" alt="${imageFileNames[index]}" class="full-width">
            </div>
        `);

        columnHeights[shortestColumnIndex] += 300 / aspectRatio; // Adjust 300 as needed to control column heights
    });

    // Calculate the difference in column heights
    const heightDifference = Math.max(...columnHeights) - Math.min(...columnHeights);

    return {columns, heightDifference};
}

export async function addImageClickListener(imageItemContainer) {
    // Define the named async function for the event listener outside of the addEventListener call
    const clickListener = async function () {
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
        contentModal.style.borderRadius = '8px'; // Gives the sleek look
        contentModal.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        contentModal.style.margin = 'auto';
        contentModal.style.height = 'calc(100% - 50px)'; // Adjust 40px to increase/decrease the total vertical margin
        contentModal.style.width = 'auto'//'calc(100% - 50px)';
        contentModal.style.overflow = 'hidden'; // Add scroll for content that exceeds the modal's height
        contentModal.style.padding = '15px'; // Add scroll for content that exceeds the modal's height
        contentModal.style.maxWidth = '80%'; // Maintain the aspect ratio of the image
        contentModal.style.display = 'flex'; // Using flexbox for layout
        contentModal.style.flexDirection = 'column'; // Stack children vertically
        // contentModal.style.alignItems = 'stretch'; // Center children horizontally in the cross axis
        contentModal.style.justifyContent = 'center'; // Center children vertically in the main axis if needed
        contentModal.style.position = 'relative'; // This makes it the reference point for closeButton
        const imageContainer = document.createElement('div');
        imageContainer.style.overflow = 'auto'; // In case you need to control overflow

        let imagesHtml = '';
        if (imageFileNames.length === 1) {
            // If there's only one image
            const singleImageUrl = `${imageFolder}/${imageFileNames[0]}`;
                imagesHtml = `<div class="full-width-image-container">
    <img src="${singleImageUrl}" alt="Image" style="width: 100%; height: auto;">
    </div>`;
            } else {
                // Calculate the best column configuration
                const {bestColumns} = await findBestColumnConfiguration(imageFileNames);
                // Create a new HTML document with the photo collage layout and CSS styling
                const columnsHtml = bestColumns.map((columnImagesHtml) => `
                <div class="column">
                    ${columnImagesHtml.join('')}
                </div>
            `);

            imagesHtml = `<div style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; flex: 2; width: 100%;">${columnsHtml}</div>`;
        }

        // Create a container element to directly insert the HTML
        imageContainer.innerHTML = imagesHtml;
        contentModal.appendChild(imageContainer);

        // Ensure clicks inside the contentModal don't close the modal
        contentModal.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        // Now, add the text content in a scrollable container below the image
        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');
        textContainer.style.overflowY = 'auto'; // Make only the Y-axis (vertical) scrollable
        textContainer.style.width = 'auto'; // Maintain the aspect ratio of the image
        textContainer.style.flex = '1';
        textContainer.style.minHeight = '25%';

        textContainer.innerHTML = `
            <p>Angelina Jolie</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce suscipit justo et neque tincidunt, eu mattis sapien suscipit.
                         Quisque varius, augue ac sodales auctor, tellus dolor ullamcorper neque, at viverra nisl massa vel ligula. Sed lacinia tristique lacus, sit amet feugiat odio volutpat nec. </p>
                        <p>Vivamus nec purus a mi viverra volutpat. Sed gravida, risus a dictum dignissim, leo felis sagittis libero, nec malesuada velit ex a arcu. Nulla facilisi.</p>
                         <p>Cras fringilla urna ut lorem tincidunt, quis varius libero convallis. Nulla facilisi. Etiam consectetur varius erat eget euismod. Phasellus venenatis vel velit id fermentum. </p>
                         <p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Fusce aliquet, risus vel elementum hendrerit, ipsum augue dictum neque, at volutpat turpis
                         velit id odio. Sed facilisis nec arcu vel iaculis. In eleifend quam vitae justo faucibus sed tristique elit rhoncus. Sed suscipit orci eget efficitur vehicula. Vivamus ac velit quis libero aliquam laoreet.</p>
        `;

        // Append the text container below the image container within the contentModal
        contentModal.appendChild(textContainer);

        // Create the close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;'; // Use HTML entity for "X"
        closeButton.style.position = 'absolute'; // Use 'fixed' to ensure it's relative to the viewport
        closeButton.style.top = '0px';
        closeButton.style.right = '0px';
        closeButton.style.zIndex = '1001';
        closeButton.style.border = 'none';
        closeButton.style.background = 'none';
        closeButton.style.color = 'grey';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';

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

        // Append the modal to the body to display it
        document.body.appendChild(modal);
    };

    // Remove the previous listener to prevent duplicates
    if (imageItemContainer._clickListener42) {
        imageItemContainer.removeEventListener('click', imageItemContainer._clickListener42);
    }

    // Save the reference to the listener on the element itself for future removal
    imageItemContainer._clickListener42 = clickListener;

    // Add the new event listener
    imageItemContainer.addEventListener('click', clickListener);
//     imageItemContainer.addEventListener('click', async function () {
//         try {
//
//             const playPauseButton = document.getElementById('playPauseButton');
//             const video = document.getElementById('video');
//             if(video) {
//                 video.pause()
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
//
//             // Show the loading overlay
//             // const loadingOverlay = document.getElementById('loading-overlay');
//             // loadingOverlay.style.backgroundColor = 'rgba(255,255,255,.8)';
//             //
//             // if (loadingOverlay) {
//             //     loadingOverlay.style.display = 'block';
//             // }
//
//             // Generate HTML to display all the images in a grid with consistent container size
//             let imagesHtml = '';
//             if (imageFileNames.length === 1) {
//                 // If there's only one image, create HTML to display it taking up the full area
//                 const singleImageUrl = `${imageFolder}/${imageFileNames[0]}`;
//                 imagesHtml = `<div class="full-width-image-container">
//     <img src="${singleImageUrl}" alt="Image" style="width: 100%; height: auto;">
//     </div>`;
//             } else {
//                 // Calculate the best column configuration
//                 const {bestColumns} = await findBestColumnConfiguration(imageFileNames);
//                 // Create a new HTML document with the photo collage layout and CSS styling
//                 const columnsHtml = bestColumns.map((columnImagesHtml) => `
//                 <div class="column">
//                     ${columnImagesHtml.join('')}
//                 </div>
//             `);
//
//                 // Add the loading="lazy" attribute to each image tag
//                 // const lazyColumnsHtml = bestColumns.map((columnImagesHtml) => `
//                 // <div class="column">
//                 //     ${columnImagesHtml.map(imageHtml => imageHtml.replace('<img', '<img loading="lazy"')).join('')}
//                 // </div>
//                 // `);
//                 imagesHtml = columnsHtml.join('')
//             }
//             const newQueryString = `collage`; // Replace with your desired query string
//             const newURL = `${window.location.origin}${window.location.pathname}?${newQueryString}`;
//
//             history.replaceState({}, '', newURL);
//             history.pushState({}, null, newURL);
//             // const overlayContainer = document.createElement('div');
//             // overlayContainer.id = 'overlay-container';
//             // overlayContainer.classList.add('overlay');
//             // overlayContainer.style.display = 'none';
//
// // Create the content container
//             const contentContainer = document.createElement('div');
//             contentContainer.classList.add('content-container');
//             // const contentContainer = document.createElement('div');
//             contentContainer.innerHTML = `
//                 <html lang="en">
//                     <head>
//                         <title>Photo Collage</title>
//                         <link rel="stylesheet" type="text/css" href="collage.css">
//                     </head>
//                     <body>
//                         <div class="photo-container">
//                             ${imagesHtml}
//                         </div>
//                         <div class="text-container">
//                            <div class="text-container">
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
//
//             addImageClickListeners();
//
//         } catch (error) {
//             console.error(error);
//         }
//     });
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

// function handlePopState() {
window.addEventListener('popstate', async function () {
    const currentURL = new URL(window.location.href);
    const searchParams = currentURL.searchParams;

    if (searchParams.has('collage')) {
        searchParams.delete('collage');
        const newURL = currentURL.toString().replace(currentURL.search, '');
        const response = await fetch('./index.html'); // Replace 'index.html' with the correct path
        const indexHtmlContent = await response.text();
        history.replaceState(null, '', newURL);
        history.pushState({}, null, newURL);
        document.documentElement.innerHTML = indexHtmlContent;
        reset()
    }
});

// }