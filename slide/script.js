function renderCarousel() {
    const slider = document.querySelector('.slider');
    const slides = document.querySelector('.slider .slides');
    const radios = [...document.querySelectorAll('.slider input[type="radio"]')];
    const s1 = document.getElementById('s1');
    const s5 = document.getElementById('s5');
    const progressBar = document.getElementById('progressBar');

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pauseCheckbox = document.querySelector('.dots-play-btn');

    const slideDuration = 5;
    let startTime, rafId;
    let paused = false; // Começa tocando
    let isManuallyPaused = false; // Começa tocando
    let elapsedBeforePause = 0;

    let isTransitioning = false;

    // --- Lógica invertida para o checkbox ---
    function toggleManualPause(isChecked) {
        if (isChecked) { // Checkbox marcado = modo PLAY
            isManuallyPaused = false;
            progressBar.style.opacity = '1';
            // Se o mouse não estiver em cima, retoma o timer
            if (!slider.matches(':hover')) {
                resumeTimer();
            }
        } else { // Checkbox desmarcado = modo PAUSE
            isManuallyPaused = true;
            pauseTimer();
            progressBar.style.opacity = '0';
        }
    }

    // --- Funções de controle de slide e trava ---
    function onTransitionEnd() {
        slides.removeEventListener('transitionend', onTransitionEnd);
        isTransitioning = false;
        if (!paused) {
            restartTimer();
        }
    }

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        const i = radios.findIndex(r => r.checked);
        const lastRealIndex = radios.length - 2;
        
        if (i === lastRealIndex) {
            radios[i + 1].checked = true;
            const onEnd = () => {
                slides.removeEventListener('transitionend', onEnd);
                slides.classList.add('no-anim');
                s1.checked = true;
                void slides.offsetWidth;
                slides.classList.remove('no-anim');
                isTransitioning = false;
                if (!paused) {
                    restartTimer();
                }
            };
            slides.addEventListener('transitionend', onEnd);
        } else {
            const nextIndex = (i + 1) % radios.length;
            radios[nextIndex].checked = true;
            slides.addEventListener('transitionend', onTransitionEnd);
        }
    }

    function prevSlide() {
        if (isTransitioning) return;
        isTransitioning = true;
        const i = radios.findIndex(r => r.checked);
        const lastRealIndex = radios.length - 2;
        const firstRealIndex = 0;

        if (i === firstRealIndex) {
            slides.classList.add('no-anim');
            radios[radios.length - 1].checked = true;
            void slides.offsetWidth;
            slides.classList.remove('no-anim');
            radios[lastRealIndex].checked = true;
        } else {
            radios[i - 1].checked = true;
        }
        slides.addEventListener('transitionend', onTransitionEnd);
    }

    // --- Funções de controle do timer ---
    function updateProgressBar() {
        if (paused) return;
        const elapsed = Date.now() - startTime;
        const percent = Math.min((elapsed / (slideDuration * 1000)) * 100, 100);
        progressBar.style.width = percent + '%';
        if (percent >= 100) {
            nextSlide();
        } else {
            rafId = requestAnimationFrame(updateProgressBar);
        }
    }

    function restartTimer() {
        cancelAnimationFrame(rafId);
        startTime = Date.now();
        progressBar.style.width = '0%';
        if (!paused) {
            rafId = requestAnimationFrame(updateProgressBar);
        } else {
            elapsedBeforePause = 0;
        }
    }

    function pauseTimer() {
        if (paused) return;
        paused = true;
        cancelAnimationFrame(rafId);
        elapsedBeforePause = Date.now() - startTime;
    }

    function resumeTimer() {
        if (isManuallyPaused || !paused) return;
        paused = false;
        startTime = Date.now() - elapsedBeforePause;
        rafId = requestAnimationFrame(updateProgressBar);
    }

    slider.addEventListener('mouseenter', () => {
        if (!isManuallyPaused) {
            pauseTimer();
        }
    });

    slider.addEventListener('mouseleave', () => {
        if (!isManuallyPaused) {
            resumeTimer();
        }
    });

    if (pauseCheckbox) {
        pauseCheckbox.addEventListener('change', (e) => {
            toggleManualPause(e.target.checked);
        });
    }
    
    radios.forEach(radio => radio.addEventListener('change', () => {
        if (!paused) {
             restartTimer();
        }
        slides.addEventListener('transitionend', onTransitionEnd);
    }));

    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
    });

    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
    });

    // Inicia o carrossel no estado de "play", com o checkbox marcado
    toggleManualPause(pauseCheckbox.checked);
        restartTimer();
}

document.addEventListener('DOMContentLoaded', function() {
    renderCarousel();
});