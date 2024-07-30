const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Directory to start searching from
const baseDir = path.join(__dirname, '../../../face_backet', 'arg');

// Function to recursively get all HTML files in the directory
function getHtmlFiles(dir) {
    let htmlFiles = [];
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            htmlFiles = htmlFiles.concat(getHtmlFiles(fullPath));
        } else if (file.endsWith('.html')) {
            htmlFiles.push(fullPath);
        }
    });

    return htmlFiles;
}

// Get all HTML files in the base directory
const htmlFiles = getHtmlFiles(baseDir);

// Function to extract unique key names from HTML files
function extractUniqueKeyNames(files) {
    const uniqueKeyNames = new Set();

    files.forEach(file => {
        const htmlContent = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(htmlContent);

        $('.columns.seven .ficha .row .label').each((index, element) => {
            const label = $(element).text().trim().toLowerCase();
            uniqueKeyNames.add(label);
        });
    });

    return Array.from(uniqueKeyNames);
}

// Extract unique key names
// const uniqueKeyNames = extractUniqueKeyNames(htmlFiles);
// console.log('Unique Key Names:', uniqueKeyNames);
//
// // Save the extracted unique key names to a JSON file
// const outputFilePath = path.join(__dirname, 'uniqueKeyNames.json');
// fs.writeFileSync(outputFilePath, JSON.stringify(uniqueKeyNames, null, 2), 'utf-8');
// console.log(`Extracted unique key names have been saved to ${outputFilePath}`);
// Function to convert key names to camelCase format

// Function to convert key names to camelCase format

// Function to convert key names to camelCase format while preserving special characters
function toCamelCase(str) {
    return str
        .toLowerCase()
        .replace(/ (.)/g, (match, chr) => chr.toUpperCase());
}

// Path to the uniqueKeyNames.json file
const uniqueKeyNamesPath = path.join(__dirname, 'uniqueKeyNames.json');

// Read the unique key names from the JSON file
const uniqueKeyNames = JSON.parse(fs.readFileSync(uniqueKeyNamesPath, 'utf-8'));

// Convert each key name to camelCase
const formattedKeyNames = uniqueKeyNames.map(toCamelCase);

// Add additional keys
const additionalKeys = [
    "nombre", // name
    "numeroDeRegistros" // numRecords
];

// Combine and ensure uniqueness
const allKeyNames = Array.from(new Set([...formattedKeyNames, ...additionalKeys]));

// Output file path
const outputFilePath = path.join(__dirname, 'formattedKeyNames.json');

// Save the formatted key names to a JSON file
fs.writeFileSync(outputFilePath, JSON.stringify(allKeyNames, null, 2), 'utf-8');
console.log(`Formatted key names have been saved to ${outputFilePath}`);