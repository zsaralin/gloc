// const fs = require('fs').promises
// const path = require('path');
//
// const inputFolderPath = './images';
// const outputFolderPath = './compressed_images';
//
// async function compressImagesInFolder(inputFolder, outputFolder) {
//     try {
//         // Ensure the output folder exists (create it if it doesn't)
//         await ensureDirectoryExists(outputFolder);
//
//         const files = await fs.readdir(inputFolder);
//
//         for (const file of files) {
//             const inputFilePath = path.join(inputFolder, file);
//             const outputFilePath = path.join(outputFolder, file);
//
//             await sharp(inputFilePath)
//                 .png({ quality: 5 }) // Adjust quality as needed
//                 .toFile(outputFilePath);
//
//             console.log(`Compressed: ${file}`);
//         }
//
//         console.log('Compression completed.');
//     } catch (error) {
//         console.error('Error compressing images:', error);
//     }
// }
//
// async function ensureDirectoryExists(directory) {
//     try {
//         await fs.mkdir(directory, { recursive: true });
//     } catch (error) {
//         if (error.code !== 'EEXIST') {
//             throw error;
//         }
//     }
// }
//
// async function compressImageToBuffer(imageData) {
//     // Define compression options (adjust quality as needed)
//     const compressionOptions = {
//         quality: 80, // Set compression quality (adjust as needed)
//     };
//     try {
//         const compressedBuffer = await sharp(imageData)
//             .resize({ width: 400 }) // Set the desired width (adjust as needed)
//             .png(compressionOptions) // Use PNG format with compression options
//             .toBuffer();
//
//         return compressedBuffer;
//     } catch (error) {
//         console.error('Error compressing image:', error);
//         throw error; // Re-throw the error for further handling, if needed
//     }
// }
//
// const { Storage } = require('@google-cloud/storage');
// const config = require('../../config.js');
// const sharp = require("sharp"); // Adjust the path based on your project structure
//
// const { keyFilename, bucketName } = config.googleCloudStorage;
//
// const storage = new Storage({ keyFilename });
//
// // traverse directories and compress _crop.png files
// async function compressCropImages() {
//     try {
//         const [folders] = await storage.bucket(bucketName).getFiles({ prefix: 'stuff' });
//
//         for (const folder of folders) {
//             const folderPath = folder.name;
//
//             if (folderPath.endsWith('_crop.png')) {
//                 const inputFilePath = folderPath; // Remove 'gs://' prefix
//                 const outputFilePath = folderPath.replace('_crop.png', '_compressed.png'); // Remove 'gs://' prefix
//
//                 await compressImage(inputFilePath, outputFilePath);
//             }
//         }
//
//         console.log('Compression completed.');
//     } catch (error) {
//         console.error('Error compressing images:', error);
//     }
// }
//
// async function compressImage(inputFilePath, outputFilePath) {
//     try {
//         const bucket = storage.bucket(bucketName);
//         const inputFile = bucket.file(inputFilePath);
//         const outputFile = bucket.file(outputFilePath);
//
//         const [inputFileMetadata] = await inputFile.getMetadata();
//
//         const sharpStream = sharp()
//             .png({ quality: 10 }) // Adjust quality as needed
//             .on('error', (error) => {
//                 console.error('Error processing image:', error);
//             });
//
//         const inputStream = inputFile.createReadStream();
//         const outputStream = outputFile.createWriteStream({
//             metadata: {
//                 contentType: inputFileMetadata.contentType,
//             },
//         });
//
//         inputStream.pipe(sharpStream).pipe(outputStream);
//
//         await new Promise((resolve, reject) => {
//             sharpStream.on('end', () => {
//                 console.log(`Compressed: ${inputFilePath} -> ${outputFilePath}`);
//                 resolve();
//             });
//
//             sharpStream.on('error', (error) => {
//                 console.error('Error processing image:', error);
//                 reject(error);
//             });
//         });
//     } catch (error) {
//         console.error('Error compressing image:', error);
//     }
// }
//
//
// module.exports = {
//     compressImagesInFolder,
//     compressImageToBuffer,
//     compressCropImages
// };
