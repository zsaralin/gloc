module.exports = {
    remoteServerConfig: {
        host: '192.168.91.193',
        port:  22,
        username:  'dnab',
        password: 'hemmer4462',
    },
    googleCloudStorage: {
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        bucketName: 'face_backet',
    },
};