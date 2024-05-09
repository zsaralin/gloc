import {getCurrentOffsetValues, handleZoomAndOffset} from "./offset.js";

let zoomSlider;
// let currentZoomValue = 100; // Initial zoom value

function initZoom(){
    zoomSlider = document.getElementById('zoom-slider');
}

export function getCurrentZoomValue() {
    if(!zoomSlider){
        initZoom()
    }
    return zoomSlider.value;
}