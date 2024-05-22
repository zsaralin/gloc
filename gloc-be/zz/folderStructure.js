// const fs = require('fs')
// const path = require('path');
//
// const util = require("util"); // Import your config file after loading env variables
// const config = require('../config.js');
//
// const {keyFilename, bucketName} = config.googleCloudStorage;
// const storage = new Storage({keyFilename});
// const bucket = storage.bucket(bucketName);
//
// const targetFolder = 'portraits/'
//
// function deleteCropCompressedFiles(targetFolder) {
//     fs.readdir(targetFolder, { withFileTypes: true }, (err, items) => {
//         if (err) {
//             console.error('Error reading directory:', err);
//             return;
//         }
//
//         items.forEach(item => {
//             const filePath = path.join(targetFolder, item.name);
//
//             if (item.isDirectory()) {
//                 // Recursively call the function if the item is a directory
//                 deleteCropCompressedFiles(filePath);
//             } else if (item.isFile() && item.name.includes('_crop_padded')) {
//                 // Delete the file if its name includes '_crop_cmp'
//                 fs.unlink(filePath, unlinkErr => {
//                     if (unlinkErr) {
//                         console.error(`Error deleting file ${filePath}:`, unlinkErr);
//                     } else {
//                         console.log(`Deleted file: ${filePath}`);
//                     }
//                 });
//             }
//         });
//     });
// }
//
// async function createFolders() {
//     // Prefix to list objects within the folder
//     const prefix = targetFolder
//
//     try {
//         // Get list of files with the specified prefix
//         const [files] = await bucket.getFiles({
//             prefix: prefix,
//         });
//
//         // Iterate through each file in the folder
//         for (const file of files) {
//             // Extracting file name
//             const fileName = path.basename(file.name);
//             // Extracting file name without extension
//             const imageName = fileName.split('.')[0];
//             // Creating folder name
//             const folderName = `${targetFolder}/${imageName}`;
//
//             // Check if the folder exists, if not, create it
//             const exists = await bucket.file(folderName).exists();
//             const remnantFilePath = `${folderName}/${imageName}`; // Assuming remnants are without extension
//             const remnantFile = bucket.file(remnantFilePath);
//             if (exists[0]) {
//                 await remnantFile.delete();
//                 console.log(`Remnant file ${remnantFilePath} deleted.`);
//             }
//
//             // Move the file into the folder
//             await file.move(`${folderName}/${fileName}`);
//
//             console.log(`File ${fileName} moved to folder ${folderName}.`);
//             // await file.delete();
//
//         }
//         console.log('Files moved to folders successfully.');
//     } catch (err) {
//         console.error('Error moving files to folders:', err);
//     }
// }
//
// async function createTxtFiles(directory) {
//     try {
//         // Read the contents of the directory
//         const subfolders = await fs.promises.readdir(directory, { withFileTypes: true });
//
//         // Filter only directories
//         const directories = subfolders.filter(dirent => dirent.isDirectory());
//
//         // Iterate through each directory and assign a name from the list to a JSON file
//         directories.forEach(async (folder, index) => {
//             const folderName = folder.name;
//             const filePath = path.join(directory, folderName, `${folderName}.json`);
//
//             // Check if the index is within the bounds of the names array
//             if (index < names.length) {
//                 const data = {
//                     name: names[index]
//                 };
//
//                 // Create a JSON file with name data
//                 await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
//
//                 console.log(`Created ${folderName}.json with name data in ${directory}`);
//             } else {
//                 console.log(`No more names available for folder ${folderName}`);
//             }
//         });
//     } catch (error) {
//         console.error('Error creating JSON files:', error);
//     }
// }
//
//
// module.exports = {
//     createFolders, createTxtFiles, deleteCropCompressedFiles
// };
//
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