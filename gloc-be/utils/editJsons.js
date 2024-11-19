const fs = require('fs');

// Read the input JSON file
fs.readFile('../results/results_arg.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Loop through all keys in the JSON data and ensure descriptors are in array of arrays
    Object.keys(jsonData).forEach(key => {
        const descriptors = jsonData[key].descriptors;

        // Wrap the descriptors array in another array if it's not already
        jsonData[key].descriptors = [descriptors];
    });

    // Write the modified JSON to a new file
    fs.writeFile('output.json', JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
            console.error('Error writing the file:', err);
        } else {
            console.log('New JSON file with updated descriptors saved as output.json');
        }
    });
});
