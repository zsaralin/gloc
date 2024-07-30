const fs = require('fs');
const path = require('path');

// Create a mapping from English to Spanish key names
const keyMapping = {
    "status": "estado",
    "dateOfAbduction": "fechaDeSecuestro",
    "placeOfAbduction": "lugarDeSecuestro",
    "name": "nombre",
    "age": "edad",
    "gender": "sexo",
    "dateOfBirth": "fechaDeNacimiento",
    "placeOfBirth": "lugarDeNacimiento",
    "nationality": "nacionalidad",
    "nicknames": "apodos",
    "maritalStatus": "estadoCivil",
    "addresses": "domicilios",
    "occupations": "ocupaciones",
    "education": "estudios",
    "simultaneousVictims": "victimasSimultaneas",
    "militancy": "militancia",
    "articles": "articulosPeriodisticos",
    "relatedVictims": "victimasRelacionadas",
    "numberOfChildren": "cantidadDeHijos",
    "dateOfDeath": "fechaDeAsesinado",
    "placeOfDeath": "lugarDeAsesinato",
    "identificationData": "datosDeLaIdentificacion",
    "pregnant": "embarazada",
    "observations": "observaciones",
    "familyData": "datosFamiliares",
    "surname": "apellido",
    "firstNames": "nombres",
    "numRecords": "numeroDeRegistros"
};

// Add additional keys
keyMapping["name"] = "nombre";
keyMapping["numRecords"] = "numeroDeRegistros";

// Directory to start searching from
const baseDir = path.join(__dirname, '../../../face_backet', 'arg');

// Function to recursively get all info.json files in the directory
function getInfoJsonFiles(dir) {
    let infoJsonFiles = [];
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            infoJsonFiles = infoJsonFiles.concat(getInfoJsonFiles(fullPath));
        } else if (file === 'info.json') {
            infoJsonFiles.push(fullPath);
        }
    });

    return infoJsonFiles;
}

// Get all info.json files in the base directory
const infoJsonFiles = getInfoJsonFiles(baseDir);

// Function to switch keys to their Spanish equivalent
function switchKeysToSpanish(json, keyMapping) {
    const newJson = {};

    for (const [key, value] of Object.entries(json)) {
        const newKey = keyMapping[key] || key; // Use the mapped key or keep the original key if no mapping is found
        newJson[newKey] = value;
    }

    return newJson;
}

// Process each info.json file and replace keys
infoJsonFiles.forEach(file => {
    const jsonData = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const updatedJsonData = switchKeysToSpanish(jsonData, keyMapping);
    fs.writeFileSync(file, JSON.stringify(updatedJsonData, null, 2), 'utf-8');
    console.log(`Updated ${file} with Spanish keys.`);
});
