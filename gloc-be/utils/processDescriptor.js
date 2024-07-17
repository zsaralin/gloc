const fs = require('fs');
const path = require('path');
const { getDescriptor } = require('./getDescriptor');

async function get_image_descriptor(imagePath) {
    console.log(`Processing image: ${imagePath}`);
    try {
        const descriptors = await getDescriptor(imagePath);
        if (descriptors) {
            console.log(`Descriptor generated for image: ${imagePath}`);
            return descriptors;
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
                            descriptors.push(...imageDescriptors);
                        }
                    }

                    if (descriptors.length > 0) {
                        results[folderName] = {
                            label: folderName,
                            descriptors: descriptors
                        };
                        console.log(`Descriptors for ${folderName} added.`);
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
