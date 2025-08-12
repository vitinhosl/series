const seriesData = [
  {
    group_name: "SÉRIES BIBLÍCAS",
    group: [
      //A TERRA PROMETIDA
      {
        carrousel: {
          enabled: true,
          title: "A TERRA PROMETIDA",
          logo: "", //https://i.imgur.com/J5WkXJP.png
          thumb: "https://i.imgur.com/H7LkieU.png",
          text: "Destaque",
          description: `
            Após a morte de Moisés, Josué é o novo líder dos hebreus 
            e terá que cumprir uma difícil missão ordenada por Deus: 
            Comandar as 12 tribos de Israel na conquista de Canaã, 
            a Terra Prometida. Continuação da saga Os Dez Mandamentos.
          `
        },
      },

      //OS DEZ MANDAMENTOS
      {
        carrousel: {
          enabled: true,
          title: "OS DEZ MANDAMENTOS",
          logo: "", //https://i.imgur.com/MJL97ex.png
          thumb: "https://i.imgur.com/v0uF3s6.png",
          text: "Destaque",
          description: `
            Grande sucesso da televisão brasileira, este épico bíblico 
            narra a saga de Moisés, o hebreu que escapou da morte ainda 
            bebê, virou príncipe do Egito e acabou se transformando no 
            líder escolhido por Deus para libertar seu povo da escravidão.
          `
        },
      },

      //JESUS
      {
        carrousel: {
          enabled: true,
          title: "JESUS",
          logo: "",
          thumb: "https://i.imgur.com/gnZ9oJ0.png",
          text: "Destaque",
          description: `
            Quando a história dos homens estava perto de cair em desgraça, 
            a história do mundo muda para sempre após a chegada do Salvador. 
            Jesus, a novela, conta pela primeira vez na íntegra a trajetória 
            do homem que revolucionou a humanidade com sua palavra e suas 
            ações e dividiu a história em dois: antes e depois de Cristo.
          `
        },
      },

      //O RICO E LÁZARO
      {
        carrousel: {
          enabled: true,
          title: "O RICO E LÁZARO",
          logo: "",
          thumb: "https://i.imgur.com/sz0LCJC.png",
          text: "Destaque",
          description: `
            Após o governo de vários reis que se afastaram de Deus, Jerusalém 
            encontra-se mergulhada na idolatria. A grande amizade de Zac e Asher 
            é abalada pelo amor que ambos sentem pela companheira de infância, 
            Joana. Ao contrário deles, ela acredita nas profecias de Jeremias 
            e empenha-se para que o povo hebreu se volte novamente para Deus.
          `
        },
      },

    ]
  }
];

function renderCarousel() {
  const slider = document.querySelector('.slider');
  const slidesContainer = document.getElementById('slides');
  const dotsContainer = document.getElementById('dots');
  const progressBar = document.getElementById('progressBar');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pauseCheckbox = document.querySelector('.dots-play-btn');

  // Check if group exists and is not empty
  if (!seriesData[0]?.group || seriesData[0].group.length === 0) {
    slidesContainer.innerHTML = ''; // Clear any existing content
    dotsContainer.innerHTML = '';
    return; // Exit if no data
  }

  // Filter enabled series and generate slides
  const enabledSeries = seriesData[0].group.filter(item => item.carrousel && item.carrousel.enabled !== false);
  if (enabledSeries.length === 0) {
    slidesContainer.innerHTML = ''; // Clear if no enabled slides
    dotsContainer.innerHTML = '';
    return; // Exit if no enabled data
  }

  const totalSlides = enabledSeries.length;
  const slidesHTML = [];
  const radios = [];
  const dotsHTML = [];

  enabledSeries.forEach((item, index) => {
    const carrousel = item.carrousel;
    const radioId = `s${index + 1}`;
    const isFirst = index === 0;

    // Create radio input
    radios.push(`<input ${isFirst ? 'checked' : ''} type="radio" name="slider" id="${radioId}">`);

    // Create slide
    let titleContent = '';
    if (carrousel.logo && carrousel.logo.trim() !== '') {
      titleContent = `<img src="${carrousel.logo}" alt="${carrousel.title}" class="brand-logo">`;
    } else {
      titleContent = carrousel.title;
    }
    slidesHTML.push(`
      <section class="slide" style="--bg: url('${carrousel.thumb}')">
        <div class="content">
          <h1 class="brand-title">${titleContent}</h1>
          <span class="chip new">${carrousel.text}</span>
          <p class="desc">${carrousel.description.trim()}</p>
          <div class="actions">
            <button class="btn primary">ASSISTIR</button>
            <button class="btn">FAVORITAR</button>
          </div>
        </div>
      </section>
    `);

    // Create dot for each real slide
    dotsHTML.push(`<label for="${radioId}"></label>`);
  });

  // Add clone of first enabled slide at the end
  const firstEnabledItem = enabledSeries[0];
  let cloneTitleContent = '';
  if (firstEnabledItem.carrousel.logo && firstEnabledItem.carrousel.logo.trim() !== '') {
    cloneTitleContent = `<img src="${firstEnabledItem.carrousel.logo}" alt="${firstEnabledItem.carrousel.title}" class="brand-logo">`;
  } else {
    cloneTitleContent = firstEnabledItem.carrousel.title;
  }
  slidesHTML.push(`
    <section class="slide clone" style="--bg: url('${firstEnabledItem.carrousel.thumb}')">
      <div class="content">
        <h1 class="brand-title">${cloneTitleContent}</h1>
        <span class="chip new">${firstEnabledItem.carrousel.text}</span>
        <p class="desc">${firstEnabledItem.carrousel.description.trim()}</p>
        <div class="actions">
          <button class="btn primary">ASSISTIR</button>
          <button class="btn">FAVORITAR</button>
        </div>
      </section>
  `);
  radios.push(`<input type="radio" name="slider" id="s${totalSlides + 1}">`);

  // Inject radio inputs and slides
  slider.insertAdjacentHTML('afterbegin', radios.join(''));
  slidesContainer.innerHTML = slidesHTML.join('');
  dotsContainer.innerHTML = dotsHTML.join('');

  // Set dynamic width for slides based on number of enabled slides
  const slidesElement = document.querySelector('.slides');
  slidesElement.style.width = `${100 * (totalSlides + 1)}%`; // +1 for clone

  // Set dynamic width for each slide (including clone)
  const slideElements = document.querySelectorAll('.slide');
  slideElements.forEach(slide => {
    slide.style.width = `${100 / (totalSlides + 1)}%`;
  });

  const slides = document.querySelector('.slider .slides');
  const radioInputs = [...document.querySelectorAll('.slider input[type="radio"]')];
  const s1 = document.getElementById('s1'); // primeiro real
  const sLast = document.getElementById(`s${totalSlides + 1}`); // clone do primeiro (último)

  // ===== Config =====
  const slideDuration = 5;             // segundos (auto-play)
  const dragPercentThreshold = 0.30;   // 30% da largura do slide
  const flingVelocityThreshold = 0.65; // px/ms: flick rápido
  const rubberbandFactor = 0.35;       // "borracha" nas pontas

  // ===== Estado =====
  let startTime, rafId;
  let paused = false;
  let isManuallyPaused = false;
  let elapsedBeforePause = 0;
  let isTransitioning = false;

  // Drag
  let isDragging = false;
  let startX = 0;
  let dragDistance = 0;
  let baseOffset = 0;
  let slideWidth = 0;
  let lastX = 0, lastT = 0, velocity = 0;

  // ===== Helpers =====
  const getIndex = () => radioInputs.findIndex(r => r.checked);
  const clearInlineTransform = () => { slides.style.transform = ''; };

  function measureSlideWidthAndGap() {
    const first = slides.firstElementChild;
    if (!first) return slider.clientWidth;
    const rect = first.getBoundingClientRect();
    const mr = parseFloat(getComputedStyle(first).marginRight) || 0;
    return rect.width + mr;
  }

  // ===== Play/Pause (checkbox invertido) =====
  function toggleManualPause(isChecked) {
    if (isChecked) { // marcado = PLAY
      isManuallyPaused = false;
      if (progressBar) progressBar.style.opacity = '1';
      if (!slider.matches(':hover') && !isDragging) resumeTimer();
    } else {         // desmarcado = PAUSE
      isManuallyPaused = true;
      pauseTimer();
      if (progressBar) progressBar.style.opacity = '0';
    }
  }

  // ===== Transições =====
  function onTransitionEnd() {
    slides.removeEventListener('transitionend', onTransitionEnd);
    isTransitioning = false;
    if (!paused) restartTimer();
  }

  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;

    const i = getIndex();
    const lastRealIndex = radioInputs.length - 2; // penúltimo = último real

    if (i === lastRealIndex) {
      // vai pro clone final e depois teleporta pro primeiro real
      radioInputs[i + 1].checked = true;
      const onEnd = () => {
        slides.removeEventListener('transitionend', onEnd);
        slides.classList.add('no-anim');
        s1 && (s1.checked = true);
        void slides.offsetWidth; // reflow
        slides.classList.remove('no-anim');
        isTransitioning = false;
        if (!paused) restartTimer();
      };
      slides.addEventListener('transitionend', onEnd);
    } else {
      const nextIndex = (i + 1) % radioInputs.length;
      radioInputs[nextIndex].checked = true;
      slides.addEventListener('transitionend', onTransitionEnd);
    }
  }

  function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;

    const i = getIndex();
    const lastRealIndex = radioInputs.length - 2; // último real
    const firstRealIndex = 0;

    if (i === firstRealIndex) {
      // salta pro clone do fim e volta pro último real
      slides.classList.add('no-anim');
      radioInputs[radioInputs.length - 1].checked = true; // clone final
      void slides.offsetWidth;
      slides.classList.remove('no-anim');
      radioInputs[lastRealIndex].checked = true;
    } else {
      radioInputs[i - 1].checked = true;
    }
    slides.addEventListener('transitionend', onTransitionEnd);
  }

  // ===== Timer / Progress =====
  function updateProgressBar() {
    if (paused) return;
    const elapsed = Date.now() - startTime;
    const percent = Math.min((elapsed / (slideDuration * 1000)) * 100, 100);
    if (progressBar) progressBar.style.width = percent + '%';
    if (percent >= 100) {
      nextSlide();
    } else {
      rafId = requestAnimationFrame(updateProgressBar);
    }
  }

  function restartTimer() {
    cancelAnimationFrame(rafId);
    startTime = Date.now();
    if (progressBar) progressBar.style.width = '0%';
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

  // ===== Drag =====
  function startDragging(e) {
    if (isTransitioning) return;
    isDragging = true;

    const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    startX = lastX = pageX;
    lastT = performance.now();
    dragDistance = 0;
    velocity = 0;

    pauseTimer();

    slideWidth = measureSlideWidthAndGap();
    const i = getIndex();
    baseOffset = -(i * slideWidth);

    slides.classList.add('no-anim');
    slides.style.willChange = 'transform';
    slides.style.cursor = 'grabbing';
    slides.style.transform = `translateX(${baseOffset}px)`;

    if (e.cancelable) e.preventDefault();
  }

  function drag(e) {
    if (!isDragging) return;

    const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;

    // velocidade px/ms (pra flick)
    const now = performance.now();
    velocity = (pageX - lastX) / Math.max(1, (now - lastT));
    lastX = pageX;
    lastT = now;

    dragDistance = pageX - startX;

    // alvo + rubberband nas bordas
    let desired = baseOffset + dragDistance;
    const maxOffset = -((radioInputs.length - 1) * slideWidth);

    if (desired > 0) {
      desired = desired * rubberbandFactor; // borracha na esquerda
    } else if (desired < maxOffset) {
      desired = maxOffset + (desired - maxOffset) * rubberbandFactor; // direita
    }

    slides.style.transform = `translateX(${desired}px)`;
    if (e.cancelable) e.preventDefault();
  }

  function endDragging() {
    if (!isDragging) return;
    isDragging = false;

    slides.style.cursor = 'grab';
    slides.style.willChange = '';
    slides.classList.remove('no-anim');

    const movedFraction = Math.abs(dragDistance) / Math.max(1, slideWidth);
    const fastSwipe = Math.abs(velocity) > flingVelocityThreshold;

    if (movedFraction >= dragPercentThreshold || fastSwipe) {
      clearInlineTransform();
      if (dragDistance < 0) nextSlide(); else prevSlide();
    } else {
      // volta pro slide atual com animação
      slides.style.transform = `translateX(${baseOffset}px)`;
      const onBack = () => {
        slides.removeEventListener('transitionend', onBack);
        clearInlineTransform();
        if (!isManuallyPaused && !slider.matches(':hover')) resumeTimer();
      };
      slides.addEventListener('transitionend', onBack);
    }
  }

  // ===== Eventos =====
  slider.addEventListener('mouseenter', () => {
    if (!isManuallyPaused) pauseTimer();
  });

  slider.addEventListener('mouseleave', () => {
    if (!isManuallyPaused && !isDragging) resumeTimer();
  });

  // Mouse
  slides.addEventListener('mousedown', startDragging);
  slides.addEventListener('mousemove', drag);
  slides.addEventListener('mouseup', endDragging);
  slides.addEventListener('mouseleave', endDragging);

  // Touch (precisa passive:false pra preventDefault)
  slides.addEventListener('touchstart', startDragging, { passive: false });
  slides.addEventListener('touchmove', drag, { passive: false });
  slides.addEventListener('touchend', endDragging);

  // Evita clique em links se houve arrasto
  slides.addEventListener('click', (e) => {
    if (Math.abs(dragDistance) > 3) e.preventDefault();
  }, true);

  if (pauseCheckbox) {
    pauseCheckbox.addEventListener('change', (e) => {
      toggleManualPause(e.target.checked);
    });
  }

  radioInputs.forEach(radio => radio.addEventListener('change', () => {
    if (!paused) restartTimer();
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

  // ===== CSS Transform Rules for Slides =====
  const style = document.createElement('style');
  document.head.appendChild(style);
  const cssRules = radioInputs.map((_, index) => {
    return `#s${index + 1}:checked ~ .slides { transform: translateX(-${index * 100 / (totalSlides + 1)}%); }`;
  }).join('\n');
  style.textContent = cssRules;

  // ===== Dot Highlight Rules =====
  const dotRules = enabledSeries.map((_, index) => {
    return `#s${index + 1}:checked ~ .dots label[for="s${index + 1}"] { background: #fff; width: 40px; }`;
  }).join('\n');
  style.textContent += `\n${dotRules}`;

  // Highlight first dot when on clone
  style.textContent += `\n#s${totalSlides + 1}:checked ~ .dots label[for="s1"] { background: #fff; width: 40px; }`;

  // ===== Init =====
  const initialPlay = pauseCheckbox ? pauseCheckbox.checked : true;
  toggleManualPause(initialPlay);
  restartTimer();
}

document.addEventListener('DOMContentLoaded', renderCarousel);