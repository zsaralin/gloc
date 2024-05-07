import {SERVER_URL} from "../index.js";
import {faceDetector, setupFaceDetector} from "../faceDetection/faceDetectionSetup.js";

async function fetchImages(page, limit) {
    try {
        const response = await fetch(`${SERVER_URL}/get-images?page=${page}&limit=${limit}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error; // Re-throw the error for handling in the calling function
    }
}

export async function cropFacesFE(page, limit) {
    try {
        await setupFaceDetector();
        let images = await fetchImages(page, limit);
        images = images.data
        const croppedImages = [];

        // Array to store promises returned by img.onload callbacks
        const onLoadPromises = [];

        images.forEach(image => {
            const img = new Image();
            img.src = `data:image/png;base64,${image.buffer}`;
            const onLoadPromise = new Promise(async (resolve, reject) => {
                img.onload = async function() {
                    const detections = await faceDetector.detect(img).detections;
                    console.log(detections);
                    if (detections && detections.length > 0) {
                        console.log('Face detected in image:', image.name);
                        const boundingBoxes = detections.map(detection => detection.boundingBox);
                        croppedImages.push({
                            originalImagePath: image.path,
                            boundingBoxes
                        });
                    }
                    resolve(); // Resolve the promise once img.onload completes
                };
                img.onerror = reject; // Reject the promise if there's an error loading the image
            });
            onLoadPromises.push(onLoadPromise);
        });

        // Wait for all img.onload callbacks to complete before sending cropped images to the backend
        await Promise.all(onLoadPromises);

        console.log(croppedImages);

        // Send cropped images to the backend
        await fetch(`${SERVER_URL}/save-cropped-images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(croppedImages)
        });
    } catch (error) {
        console.error('Error cropping faces:', error);
    }
}

export async function cropImagesParent(limit) {
    try {
        const startPage  = Math.ceil(7800 / limit);

        let page = startPage;
        // let page = 1;
        let hasMore = true;

        while (hasMore) {
            const { data, total } = await fetchImages(page, limit);

            if (data.length > 0) {
                await cropFacesFE(page, limit); // Process each page
            }

            hasMore = (page - 1) * limit + data.length < total;
            page += 1;
        }
    } catch (error) {
        console.error('Failed to process images:', error);
    }
}