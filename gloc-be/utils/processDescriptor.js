const fs = require('fs');
const mime = require('mime-types');
const tf = require('@tensorflow/tfjs-node'); // in nodejs environments tfjs-node is required to be loaded before face-api
const path = require('path');
const faceapi = require("face-api.js");
const sharp = require("sharp");
const minConfidence = 0.2;
const maxResults = 5;
let optionsSSDMobileNet;
let faceapiInitialized = false;

// Function to load image file as TensorFlow.js tensor with resizing
async function loadImageAsTensor(imageDataURL, targetSize = { width: 512, height: 512 }) {
    const buffer = Buffer.from(imageDataURL.split(',')[1], 'base64');

    // Resize the image using sharp to reduce the memory footprint
    const resizedBuffer = await sharp(buffer)
        .resize(targetSize.width, targetSize.height)
        .toBuffer();

    // Decode resized image into a TensorFlow.js tensor
    const tensor = tf.node.decodeImage(resizedBuffer, 3);
    return tensor;
}

async function getDescriptor(imageDataURL) {
    if (!faceapiInitialized) {
        await initializeFaceAPI();
        faceapiInitialized = true;
    }

    // Load and resize image
    const tensor = await loadImageAsTensor(imageDataURL);

    let detections = await faceapi.detectAllFaces(tensor).withFaceLandmarks().withFaceDescriptors();

    if (!detections || detections.length === 0) {
        const inputSizes = [32, 64, 96, 128, 160, 192, 224, 256, 288, 320];
        for (const inputSize of inputSizes) {
            detections = await faceapi.detectAllFaces(tensor, new faceapi.TinyFaceDetectorOptions({ inputSize }))
                .withFaceLandmarks().withFaceDescriptors();
            if (detections && detections.length > 0) break;
        }
    }

    tensor.dispose(); // Dispose tensor to free memory

    if (detections && detections.length > 0) {
        return detections.map(detection => detection.descriptor);  // Return all descriptors as an array of arrays
    } else {
        return null;
    }
}

async function initializeFaceAPI() {
    await faceapi.tf.setBackend('tensorflow');
    await faceapi.tf.ready();
    const modelPath = '../models';
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
        faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
    ]);
    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({ minConfidence, maxResults });
}

async function get_image_descriptor(imagePath) {
    try {
        // Read image as a buffer
        const imageBuffer = await fs.promises.readFile(imagePath);

        // Get the MIME type of the image
        const mimeType = mime.lookup(imagePath);

        // Convert buffer to a base64 Data URL
        const dataUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

        // Call the face API to get the descriptor from the Data URL
        const descriptors = await getDescriptor(dataUrl);

        if (descriptors) {
            return descriptors;  // Return an array of descriptors (each descriptor is an array)
        }
    } catch (error) {
        console.error(`Failed to get descriptor for image: ${imagePath}`, error);
    }

    return null;
}
async function process_folders(baseDir, outputFile) {
    const results = {};

    const processDirectory = async (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const imagesDir = path.join(dir, entry.name, 'images');
                if (fs.existsSync(imagesDir) && fs.lstatSync(imagesDir).isDirectory()) {
                    const folderName = entry.name;
                    const descriptors = [];
                    const imageFiles = fs.readdirSync(imagesDir).filter(file => file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg'));

                    for (const fileName of imageFiles) {
                        const imagePath = path.join(imagesDir, fileName);
                        const imageDescriptors = await get_image_descriptor(imagePath);
                        if (imageDescriptors) {
                            imageDescriptors.forEach(descriptorArray => {
                                descriptors.push(Array.from(descriptorArray));  // Ensure descriptors remain arrays
                            });
                        }
                    }

                    if (descriptors.length > 0) {
                        results[folderName] = {
                            label: folderName,
                            descriptors: descriptors // Descriptors is an array of arrays
                        };
                    } else {
                        console.log(`No descriptors found for ${folderName}.`);
                    }
                }
            }
        }
    };

    await processDirectory(baseDir);

    // Save the results to the specified output file
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 4), 'utf8');
    console.log(`All descriptors saved to ${outputFile}`);
}


const baseDirectory = path.resolve(__dirname, '../../../face_backet', 'arg');  // Change this to navigate 3 levels up and into the arg directory
const outputFile = "results_arg.json";  // Output file in the same directory as the script
console.log(`Starting processing in base directory: ${baseDirectory}`);
process_folders(baseDirectory, outputFile).then(() => {
    console.log(`Processing completed. Results saved to ${outputFile}`);
});
