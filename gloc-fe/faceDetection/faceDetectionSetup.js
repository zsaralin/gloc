import {FaceDetector, FilesetResolver, FaceLandmarker} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import * as faceapi from '../dist/face-api.esm.js';

export let faceLandmarker; export let faceDetector; export let optionsTinyFaceDetector;
const modelPath = './model/'; // path to model folder that will be loaded using http

export async function setupFaceLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "./internal_cdn/package/wasm"
    );


    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `./internal_cdn/face_landmarker.task`,
            delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1
    });

}

export async function setupFaceDetector() {
    const vision = await FilesetResolver.forVisionTasks(
        "./internal_cdn/package/wasm"
    );

    faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:`./internal_cdn/blaze_face_short_range.tflite`,
            delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: 'IMAGE',
        numFaces: 1
    });

}