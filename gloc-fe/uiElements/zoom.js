import {getCurrentOffsetValues, handleZoomAndOffset} from "./offset.js";

let zoomSliderT; let zoomSliderB;
// let currentZoomValue = 100; // Initial zoom value

function initZoom(){
    zoomSliderT = document.getElementById('zoom-slider-top');
    zoomSliderB = document.getElementById('zoom-slider-bottom');
}

export function getCurrentZoomValue() {
    if(!zoomSliderT || !zoomSliderB){
        initZoom()
    }
    return [zoomSliderT.value, zoomSliderB.value];
}