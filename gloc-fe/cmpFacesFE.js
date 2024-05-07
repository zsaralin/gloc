import {SERVER_URL} from "./index.js";
import {faceDetector, setupFaceDetector} from "./faceDetection/faceDetectionSetup.js";

async function fetchImages(page, limit) {
    try {
        console.log(page, limit)
        const response = await fetch(`${SERVER_URL}/get-images?page=${page}&limit=${limit}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error; // Re-throw the error for handling in the calling function
    }
}

export async function cmpFacesFE(page, limit) {
    try {
        let images = await fetchImages(page, limit);
        images = images.data
        const cmpImages = [];

        // Array to store promises returned by img.onload callbacks
        const onLoadPromises = [];

        images.forEach(image => {
            const img = new Image();
            img.src = `data:image/png;base64,${image.buffer}`;

            const onLoadPromise = new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log(image.path)
                    cmpImages.push({
                        originalImagePath: image.path
                    });
                    resolve(); // Resolve the promise once img.onload completes
                };

                img.onerror = reject; // Reject the promise if there's an error loading the image
            });

            onLoadPromises.push(onLoadPromise);
        });

        // Wait for all img.onload callbacks to complete before sending cropped images to the backend
        await Promise.all(onLoadPromises);

        console.log(cmpImages);

        // Send cropped images to the backend
        await fetch(`${SERVER_URL}/save-cmp-images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cmpImages)
        });
    } catch (error) {
        console.error('Error cropping faces:', error);
    }
}

export async function cmpImagesParent(limit) {
    try {
        // const startPage = Math.ceil(7000 / limit);

        let page = 1//startPage;
        let hasMore = true;

        while (hasMore) {
            const { data, total } = await fetchImages(page, limit);

            if (data.length > 0) {
                await cmpFacesFE(page, limit); // Process each page
            }

            hasMore = (page - 1) * limit + data.length < total;
            page += 1;
        }
    } catch (error) {
        console.error('Failed to process images:', error);
    }
}