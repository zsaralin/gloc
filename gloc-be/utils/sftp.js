// utils/sftp.js
const util = require("util");
require('dotenv').config(); // Load environment variables from .env file
const config = require('../config.js'); // Import your config file after loading env variables
const {Client} = require('ssh2');

// Create an SFTP connection and make it available to the request handler
const createSftpConnection = () => {
    const conn = new Client();
    return new Promise((resolve, reject) => {
        conn
            .on('ready', () => {
                resolve(conn); // Return the 'conn' object when it's ready
            })
            .on('error', (err) => {
                reject(err);
            })
            .connect({
                ...config.remoteServerConfig,
                readyTimeout: 20000, // Adjust the timeout value as needed (in milliseconds)
            });
    });
};

const createSftp = () => {
    const conn = new Client();
    return new Promise((resolve, reject) => {
        conn
            .on('ready', () => {
                conn.sftp((err, sftp) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(sftp);
                    }
                });
            })
            .on('error', (err) => {
                reject(err);
            })
            .connect({
                ...config.remoteServerConfig,
                readyTimeout: 20000, // Adjust the timeout value as needed (in milliseconds)
            });    });
};

function statPromise(sftp, remotePath) {
    return new Promise((resolve, reject) => {
            sftp.stat(remotePath, (err, stats) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(stats);
                }
            });
        });
}

function readdirPromise(sftp, remoteDirectoryPath) {
    return new Promise((resolve, reject) => {
        sftp.readdir(remoteDirectoryPath, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    })
}

async function getImageBuffer(sftp, remoteFilePath) {
    return new Promise((resolve, reject) => {
        const readStream = sftp.createReadStream(remoteFilePath);

        const chunks = [];

        readStream.on('data', chunk => chunks.push(chunk));

        readStream.on('end', () => {
            const fileBuffer = Buffer.concat(chunks);
            resolve(fileBuffer);
        });

        readStream.on('error', err => {
            reject(err);
        });
    });
}

module.exports = {
    createSftpConnection,
    createSftp,
    statPromise,
    readdirPromise,
    getImageBuffer,
};