const fs = require('fs').promises
const faceapi = require('face-api.js');
const MAX_DISTANCE = 1.2385318850506823
const numMatchesHandler = require('../numMatchesHandler');
const MinHeap = require("./minHeap");
let cachedData = null;
const { getDbName } = require('../db.js');
let dbName = getDbName();

loadDataIntoMemory();

// cache the JSON file in memory
async function loadDataIntoMemory() {
    dbName = getDbName();
    console.log(dbName)
    try {
        // Read and parse the JSON file only if it's not already cached
        if (!cachedData) {
            const rawData = await fs.readFile(`./results/results_${dbName}.json`, 'utf8');
            cachedData = JSON.parse(rawData);
            console.log('Data loaded into memory');
        }
    } catch (error) {
        console.error('Error loading data into memory:', error);
    }
}

async function findNearestDescriptors(targetDescriptor, numMatches) {
    try {
        if (!cachedData || !targetDescriptor) return
        const rawData = await fs.readFile(`./results/results_${dbName}.json`, 'utf8');
        cachedData = JSON.parse(rawData);

        const minHeap = new MinHeap();

        for (const label of Object.keys(cachedData)) {
            const descriptors = cachedData[label].descriptors;

            if (descriptors.length === 0) {
                continue; // Skip labels with no descriptors
            }

            let distance;

            if (descriptors.length === 1) {
                distance = faceapi.euclideanDistance(Array.from(targetDescriptor), descriptors[0]);
            } else {
                const totalDistance = descriptors.reduce((acc, desc) =>
                    acc + faceapi.euclideanDistance(Array.from(targetDescriptor), desc), 0);
                distance = totalDistance / descriptors.length;
            }

            minHeap.insert({ label, distance });

            if (minHeap.size() > numMatches) {
                minHeap.extractMin(); // Remove the farthest descriptor if exceeding N
            }
        }

        // Extract the top N nearest descriptors from the min-heap
        const topNDescriptors = [];
        while (!minHeap.isEmpty()) {
            const { label, distance } = minHeap.extractMin();
            topNDescriptors.push({ label, distance });
        }
        // Normalize distances
        const normalizedDescriptors = topNDescriptors.map((item) => ({
            label: item.label,
            normalizedDistance: 1 - item.distance / MAX_DISTANCE,
        }));

        return normalizedDescriptors.reverse(); // Reverse to get closest first
    } catch (error) {
        console.error('Error reading or parsing results.json:', error);
        throw error;
    }
}


// max distance between two descriptors, only run with new dataset
async function calculateMaxPossibleDistance() {
    const dbName = getDbName();

    const data = await fs.readFile(`./results/results_${dbName}.json`, 'utf8');
    const descriptorList = JSON.parse(data);
    let maxDistance = 0;

    for (let i = 0; i < descriptorList.length; i++) {

        const descriptor1 = descriptorList[i].descriptors;

        for (let j = i + 1; j < descriptorList.length; j++) {
            const descriptor2 = descriptorList[j].descriptors;

            const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
    }
    return maxDistance;
}

// async function getBoundingBoxes(labels) {
//     try {
//         // Find the entries with matching labels
//         const boundingBoxesArray = [];
//         const cleanedLabelsString = labels.replace(/^\[|\]$/g, '');
//         const labelsArray = cleanedLabelsString.split(',');
//
//         labelsArray.forEach((label) => {
//             const entry = cachedData[label];
//             if (entry) {
//                 boundingBoxesArray.push(entry.boundingBoxes);
//             }
//         });
//
//         return boundingBoxesArray;
//     } catch (error) {
//         console.error('Error reading or parsing the JSON file:', error);
//         return null;
//     }
// }

module.exports = {
    findNearestDescriptors,
    calculateMaxPossibleDistance,
    loadDataIntoMemory
};

