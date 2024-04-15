// const fs = require('fs').promises
// const faceapi = require('face-api.js');
// const tmp = require("tmp");
// const {createCanvas, loadImage} = require('canvas');
// const {Client} = require("ssh2");
// const {statPromise, readdirPromise} = require("../sftp");
// const path = require("path"); // Import createCanvas and loadImage
// const MODEL_URI = "./models";
// const sftpConnection = require('../sftp.js');
// const {compressImageToBuffer} = require("./compressImages");
//
// const PADDING = 40; // padding around detected face
//
// async function cropFaces() {
//     try {
//         // Load face detection models
//         await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URI);
//         await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URI);
//         await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URI);
//
//         const remotePath = './dataset_images/faces_dataset_small_folder';
//         const conn = await sftpConnection.createSftpConnection()
//         // Retrieve file list from the remote directory
//         const filesResult = await new Promise((resolve, reject) => {
//             conn.sftp((err, sftp) => {
//                 if (err) {
//                     console.error('Error establishing SFTP connection:', err);
//                     return reject(err);
//                 }
//
//                 sftp.readdir(remotePath, (err, files) => {
//                     if (err) return reject(err);
//                     resolve({ sftp, files: files.map(file => file.filename) });
//                 });
//             });
//         });
//
//         const { sftp, files } = filesResult;
//
//         const results = {};
//
//         for (let i = 0; i < files.length; i++) {
//             const file = files[i];
//
//             const imagePath = `${remotePath}/${file}`;
//
//             try {
//                 const stats = await statPromise(sftp, imagePath);
//                 let descriptors = [];
//                 let boundingBoxes = [];
//
//                 if (stats && stats.isDirectory()) {
//                     const subfolderFiles = await readdirPromise(sftp, imagePath);
//
//                     // Process the first file in the directory (if any)
//                     if (subfolderFiles.length > 0) {
//                         const firstFile = subfolderFiles[0].filename;
//                         const secondFile = subfolderFiles.length > 1 ? subfolderFiles[1].filename : null;
//
//                         if (firstFile.endsWith('_crop.png') && secondFile) {
//                             // If the first file ends with _crop.png, use the second file
//                             const subfolderFilePath = `${imagePath}/${secondFile}`;
//                             const { descriptor, boundingBox } = await processAndDetectFace(sftp, subfolderFilePath);
//                             if (descriptor && boundingBox) {
//                                 descriptors.push(descriptor);
//                                 boundingBoxes.push(boundingBox);
//                             }
//                         } else {
//                             // Otherwise, use the first file
//                             const subfolderFilePath = `${imagePath}/${firstFile}`;
//                             const { descriptor, boundingBox } = await processAndDetectFace(sftp, subfolderFilePath);
//                             if (descriptor && boundingBox) {
//                                 descriptors.push(descriptor);
//                                 boundingBoxes.push(boundingBox);
//                             }
//                         }
//                     }
//                 } else {
//                     // Process individual file
//                     const { descriptor, boundingBox } = await processAndDetectFace(sftp, imagePath);
//
//                     if (descriptor && boundingBox) {
//                         descriptors.push(descriptor);
//                         boundingBoxes.push(boundingBox);
//                     }
//                 }
//
//                 // Create a LabeledFaceDescriptors instance
//                 const label = path.basename(file, path.extname(file));
//                 results[label] = { label, descriptors, boundingBoxes };
//             } catch (err) {
//                 console.error(`Error getting file stats for ${imagePath}:`, err);
//                 // Handle the error as needed
//             }
//         }
//         console.log('Done Cropping!')
//     } catch (error) {
//         console.error('Error processing face descriptors:', error);
//         return null;
//     }
// }
//
// // helper fn to process an image, detect a face, crop it, and save the cropped image to the remote server.
// async function processAndDetectFace(sftp, imagePath) {
//     console.log(`Processing and detecting face in image: ${imagePath}`);
//
//     const tmpobj = tmp.fileSync();
//
//     await new Promise((resolve, reject) => {
//         const readStream = sftp.createReadStream(imagePath);
//
//         readStream.on('end', resolve);
//         readStream.on('error', (readError) => {
//             console.error('Error reading stream:', readError);
//             reject(readError);
//         });
//
//         fs.writeFile(tmpobj.name, readStream)
//             .then(resolve)
//             .catch((writeError) => {
//                 console.error('Error writing to file:', writeError);
//                 reject(writeError);
//             });
//     });
//
//     const img = await loadImage(tmpobj.name); // Use loadImage to load the image
//
//     const detections = await faceapi
//         .detectSingleFace(img)
//         .withFaceLandmarks()
//         .withFaceDescriptor();
//
//     if (detections) {
//         const descriptor = new Float32Array(detections.descriptor);
//
//         // Get bounding box coordinates
//         const {x, y, width, height} = detections.detection.box;
//         const boundingBox = {x, y, width, height};
//
//         // Crop the image using the bounding box
//         const croppedImage = cropImage(img, boundingBox);
//
//         // Save the cropped image to the remote server with "_crop" added to the name
//         const croppedImagePath = imagePath.replace('.png', '_crop.png');
//
//         await saveCroppedImage(sftp, croppedImage, croppedImagePath);
//
//         await fs.unlink(tmpobj.name);
//
//         return {descriptor, boundingBox};
//     } else {
//         console.log(`No face detected in ${imagePath}`);
//         return null;
//     }
// }
//
// function cropImage(image, boundingBox) {
//     const {x, y, width, height} = boundingBox;
//     // Calculate the maximum allowed size for the cropped image
//     const maxWidth = width + 2 * PADDING;
//     const maxHeight = height + 2 * PADDING;
//
//     // Calculate the new size and make sure it doesn't exceed the maximum dimensions
//     let newSize = Math.min(maxWidth, maxHeight);
//
//     const newX = Math.max(0, x - (newSize - width) / 2);
//     const newY = Math.max(0, y - (newSize - height) / 2);
//     const canvas = createCanvas(newSize, newSize);
//
//     const context = canvas.getContext('2d');
//     context.drawImage(image, newX, newY, newSize, newSize, 0, 0, newSize, newSize);
//     return canvas.toDataURL('image/png'); // Change the format as needed
// }
//
//
// async function saveCroppedImage(sftp, croppedImage, imagePath) {
//     try {
//         // Extract the base64 data from the data URL
//         const base64Data = croppedImage.slice(croppedImage.indexOf(',') + 1);
//         const imageData = Buffer.from(base64Data, 'base64');
//         const resizedImage = await compressImageToBuffer(imageData)
//
//         // Create a writable stream to save the image to the specified path
//         const writeStream = sftp.createWriteStream(imagePath);
//         writeStream.end(resizedImage);
//
//         writeStream.on('finish', () => {
//             console.log(`Cropped and compressed image saved as PNG to: ${imagePath}`);
//         });
//
//         writeStream.on('error', (writeError) => {
//             console.error('Error writing cropped image:', writeError);
//         });
//     } catch (error) {
//         console.error('Error saving cropped image:', error);
//     }
// }
//
// module.exports = {
//     cropFaces,
// };
