

const MAX_WIDTH = 525;
export let isMobile = false;
export function checkDisplaySize(){
    const windowWidth = window.innerWidth;
    if(windowWidth < MAX_WIDTH){
        isMobile = true;
    }

    const main = document.getElementById('main');
    main.style.maxWidth = 800 + 'px';
    // main.style.width = isMobile ? MAX_WIDTH + 'px' ;

    const top = document.getElementById('top');
    if(!isMobile){
        top.style.height = '40%'
    } else{
        const thirdWidth = windowWidth / 3;
        const idealHeight = thirdWidth * (16 / 12);  // Calculate the height that would make the thirdWidth a 9:16 aspect ratio
        const windowHeight = window.innerHeight;

        // Determine the percentage of the window height that the ideal height represents
        const heightPercentage = (idealHeight / windowHeight) * 100;

        // Determine the closest standard height: 25% or 40%
        const standardHeight = (heightPercentage > 25 && heightPercentage < 40) ? `${heightPercentage}%` : (Math.abs(heightPercentage - 25) < Math.abs(heightPercentage - 40) ? '25%' : '40%');

        // Set the height of the top element
        top.style.height = standardHeight;
    }
    // top.style.height = isMobile ? '25%' : '40%'

    const videoContainer = document.getElementById('video-container');
    videoContainer.style.width = isMobile ? '33.33%' : '25%'

    const topContainer = document.getElementById('top-image-container');
    topContainer.style.width = isMobile ? '66.66%' : '75%'
}