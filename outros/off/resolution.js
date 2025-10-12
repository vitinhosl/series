//RESOLUÇÃO
function updateScreenSize() {
    const seriesTitle = document.getElementById('series-title');
    const width = window.innerWidth;
    const height = window.innerHeight;
    seriesTitle.innerHTML = `Séries (${width}x${height})`;
}

document.addEventListener('DOMContentLoaded', function() {
    updateScreenSize(); // Chama ao carregar
    window.addEventListener('resize', updateScreenSize);
});