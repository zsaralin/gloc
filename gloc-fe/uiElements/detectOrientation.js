export function handleOrientationChange() {
    const overlay = document.getElementById('overlay')
    if (!window.orientation || window.orientation === 0 || window.orientation === 180) {
        overlay.style.display = 'none'
        return true;
    } else if (window.orientation === 90 || window.orientation === -90) {
        overlay.style.display = 'block'
        overlay.innerHTML = ''
        return false;
    }
}
