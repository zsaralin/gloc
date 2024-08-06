

const MAX_WIDTH = 525; //px
export let isMobile = false;
export function adjustLayoutForScreenSize() {
    const windowWidth = window.innerWidth;
    isMobile = windowWidth < MAX_WIDTH;

    const main = document.getElementById('main');
    // main.style.maxWidth = '800px';

    const top = document.getElementById('top');
    const videoContainer = document.getElementById('video-container');
    const topContainer = document.getElementById('top-image-container');
    const windowHeight = window.innerHeight;

    if (isMobile) {
        const thirdWidth = windowWidth / 3;
        const idealHeight = thirdWidth * (16 / 12);  // Aspect ratio calculation
        const heightPercentage = (idealHeight / windowHeight) * 100;
        const standardHeight = (heightPercentage > 25 && heightPercentage < 40) ? `${heightPercentage}%` : (Math.abs(heightPercentage - 25) < Math.abs(heightPercentage - 40) ? '25%' : '40%');
        top.style.height = standardHeight;
        videoContainer.style.width = '33.33%';
        topContainer.style.width = '66.66%';
    } else {
        top.style.height = '40%';
        videoContainer.style.width = '25%';
        topContainer.style.width = '75%';
    }
}