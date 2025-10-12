import { seriesAll } from '../episodes/index.js';
const seriesData = seriesAll;

const seriesData2 = [
    {
      group_name: "Stream",
      visible: true,
      group: [
        //STREAM
        {
            name: "Baiano",
            thumb_page: "",
            thumb_buttons: {
              url: [
                "",
              ],
            },
            badge: "",
            type: "",
            canais: false,
            enabled: true,
            stream: true,
            visible: true,
            title: "", //TEXTO DO BOTÃO ENABLED OFF
            carrousel: {
                enabled: false,
                title: "",
                logo: {
                  enabled: false,
                  url: "",
                  minimalist: false,
                },
                thumb: [""],
                text: "",
                description: `
                    
                `
            },
            description: {
                title: "",
                thumb: [
                  "",
                ],
                video: [
                  "",
                ],
                sinopse:  `

                `
            },
            season: [
                {
                  name: "Stream",
                  thumb_season: "",
                  movies: false,
                  episodes: [
                    { title: "Stream", subtitle: "", duration: "", thumb: "" , url: [ "twitch.tv/baiano", "https://kick.com/djsmierc"]},
                  ]
                },
            ]
        },
      ]
    },
];

//=======================================================================
//CONFIGURAÇÕES
//=======================================================================
// localStorage.clear();                       //LIMPA TODO O CACHE (FAVORITOS, ASSISTIDOS, ETC...)
const parentDomain              = '127.0.0.1'; //HOST: 127.0.0.1 ou vitinhos.github.io
let autoPlay                    = false;       //AUTOPLAY NOS EPISÓDIOS
let enableArrowButtons          = false;       //EPISÓDIOS EM LISTAS >>>
let blockRequestTop             = false;       //PERMITE BLOQUEAR A REQUISIÇÃO DO SCROLL NO TOPO (APENAS PARA TESTE DE THUMBS)
let randomImagesCards           = false;       //AS IMAGENS ALEATÓRIAS DOS BOTÕES
let randomImagesDescription     = false;       //AS IMAGENS ALEATÓRIAS DAS DESCRIÇÕES
let randomImagesCarrousel       = false;       //AS IMAGENS ALEATÓRIAS DO CARROUSEL
let animationReverseEpisodes    = false;       //ANIMAÇÃO REVERSA NOS EPISÓDIOS
let animationPauseCarrousel     = true;        //ANIMAÇÃO DO CARROUSEL COMEÇA PAUSADA
let animationSpeedCarrouselDrag = 0.30;        //QUANTIDADE PRESSIONADO QUE TEM QUE ARRASTAR 0.30 = 30%
let animationSpeedCarrouselBar  = 5;           //VELOCIDADE DAS ANIMAÇÕES DO CARROUSEL
let animationSpeedEpisodes      = 3;           //VELOCIDADE DAS ANIMAÇÕES DOS EPISÓDIOS
let animationSpeedButtons       = 30;          //VELOCIDADE DAS ANIMAÇÕES DOS BOTÕES
let animationSpeedSearchsKeys   = 2;           //VELOCIDADE DAS ANIMAÇÕES DOS BOTÕES DE PESQUISA
let animationSpeedLogs          = 20;          //VELOCIDADE DAS ANIMAÇÕES DOS CARDS DE HISTÓRICOS
let descriptionVideoLoop        = true;        //LOOP DO VIDEO
let descriptionVideoFadeSec     = 0.0;         //DURAÇÃO DE ENTRADA/SAIDA PARA O VÍDEO APARECER
let descriptionVideoHover       = false;       //DURAÇÃO DE ENTRADA/SAIDA PARA O VÍDEO APARECER
let disableButtonFirst          = false;       //SE AS SÉRIES DESATIVADAS DEVEM SER OS PRIMEIROS

//=======================================================================
//FLAGS
//=======================================================================
let currentSerie                = null;
let currentEpisodeIndex         = 0;
let currentSeasonIndex          = 0;
let previousEpisodeCount        = 0;
let savedScrollPosition         = 0;
let favorites                   = JSON.parse(localStorage.getItem('favorites')) || [];
let continues                   = JSON.parse(localStorage.getItem('continues')) || {};
let currentSeasonDropdownValue  = 'all';
let seasonExpandedState         = {};
let currentFilter               = null;
const selectedThumbs            = {};
const thumbnailCache            = {};

//=======================================================================
//FUNÇÕES UTILS E HELPERS
//=======================================================================
const toArray = v => Array.isArray(v) ? v : (v ? [v] : []);
const isVideoURL = u => /\.(mp4|webm|ogg)(\?.*)?$/i.test(u);

function getOrCreateStyleTag(id) {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  return style;
}

function removeControlsBottom(sliderEl) {
  const el = sliderEl.querySelector('.controls-bottom');
  if (el) el.remove();
}

function injectPlayPause(slider) {
  const existing = slider.querySelector('.dots-play-btn');
  if (existing) return existing;
  const controlsBottom = document.createElement('div');
  controlsBottom.className = 'controls-bottom';
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'dots-container';
  const label = document.createElement('div');
  label.className = 'dots-toggle';
  label.setAttribute('aria-label', 'Reproduzir/Pausar');
  const input = document.createElement('input');
  input.className = 'dots-play-btn';
  input.type = 'checkbox';
  input.checked = true;
  label.appendChild(input);
  dotsWrap.appendChild(label);
  controlsBottom.appendChild(dotsWrap);
  slider.appendChild(controlsBottom);
  return input;
}

function coerceUrlList(u) {
  return Array.isArray(u) ? u : (u ? [u] : []);
}

function primaryUrlOf(ep) {
    const list = coerceUrlList(ep && ep.url);
    const url = list[0] || '';
    return convertToEmbedUrl(url);
}

function requestTop() {
  if (!blockRequestTop) return;

  requestAnimationFrame(() => {
    const candidates = [
      window,
      document.scrollingElement || document.documentElement,
      document.body,
      document.querySelector('#main'),
      document.getElementById('series'),
      document.getElementById('home'),
      document.getElementById('logs-section'),
      document.getElementById('video-overlay'),
    ].filter(Boolean);

    candidates.forEach(el => {
      if (el === window) {
        window.scrollTo(0, 0);
      } else {
        // tenta de todos os jeitos
        el.scrollTop = 0;
        el.scrollLeft = 0;
        if (typeof el.scrollTo === 'function') el.scrollTo(0, 0);
      }
    });
  });
}

function lockPageScroll(lock) {
  const main = document.getElementById('main');
  document.documentElement.classList.toggle('no-scroll', lock);
  document.body.classList.toggle('no-scroll', lock);
  if (main) main.classList.toggle('lock-scroll', lock);
}

function blockOverlayScrollEvents(overlay, lock) {
  const handler = e => { e.preventDefault(); };
  if (!overlay) return;
  if (lock) {
    overlay.addEventListener('wheel', handler, { passive: false });
    overlay.addEventListener('touchmove', handler, { passive: false });
    overlay.__blockHandler = handler; // guarda p/ remover depois
  } else if (overlay.__blockHandler) {
    overlay.removeEventListener('wheel', overlay.__blockHandler);
    overlay.removeEventListener('touchmove', overlay.__blockHandler);
    overlay.__blockHandler = null;
  }
}

function shouldShowDescription(desc) {
  return !!desc && typeof desc === 'object' && desc.enabled !== false && Array.isArray(desc.thumb) && desc.thumb.length > 0;
}

//=======================================================================
//SERIE ATUAL
//=======================================================================
function renderCurrentSeries(serie, dropdownValue = currentSeasonDropdownValue) {
  const seriesContainer = document.getElementById('series');
  const seriesNameContainer = document.getElementById('series-name');

  seriesContainer.innerHTML = '';
  seriesNameContainer.innerHTML = '<h1>' + serie.name + '</h1>';

  if (serie.season.length === 0 && (!serie.movies || serie.movies.length === 0)) {
    seriesContainer.innerHTML = `
      <div id="current-series">
        <div id="current-series-header">
          <p>Nenhum episódio ou filme disponível.</p>
        </div>
      </div>`;
    return;
  }

  const isNewSeries = !currentSerie || currentSerie.name !== serie.name;
  currentSerie = serie;

  const hasSeasons = serie.season.length > 0;

  // Apenas filmes?
  const onlyMovies = hasSeasons && serie.season.every(s => !!s.movies);
  const allLabel   = onlyMovies ? 'Ver todos os filmes' : 'Ver todos os episódios';

  // Mostrar dropdown? (não mostrar quando só houver filmes)
  const showDropdownBase   = hasSeasons && (serie.season.length > 1 || (serie.season.length === 1 && serie.season.some(s => s.movies)));
  const showAllOption      = serie.season.length > 1 || (serie.season.length === 1 && serie.season.some(s => s.movies));
  const shouldShowDropdown = showDropdownBase && !onlyMovies;

  let episodesToRender = [];
  let availableText = '';

  // Ponto inicial do dropdown
  if (isNewSeries || !dropdownValue || (dropdownValue === 'all' && !showAllOption)) {
    if (onlyMovies) {
      currentSeasonIndex = 0;
      dropdownValue = 'season-' + currentSeasonIndex;
      currentSeasonDropdownValue = dropdownValue;
    } else if (showAllOption) {
      dropdownValue = 'all';
      currentSeasonDropdownValue = 'all';
    } else {
      currentSeasonIndex = 0;
      dropdownValue = 'season-' + currentSeasonIndex;
      currentSeasonDropdownValue = dropdownValue;
    }
  }

  if (hasSeasons) {
    if (dropdownValue === 'all' && showAllOption) {
      episodesToRender = serie.season.flatMap(function (s) { return s.episodes; });
      availableText = onlyMovies
        ? 'Filmes disponíveis: ' + episodesToRender.length
        : 'Todos os episódios: ' + episodesToRender.length;
    } else {
      currentSeasonIndex = parseInt(dropdownValue.split('-')[1], 10);
      const currentSeason = serie.season[currentSeasonIndex];
      episodesToRender = currentSeason.episodes;
      const isMovie = !!currentSeason.movies;
      const seasonsOfType = serie.season.filter(function (s) { return (!!s.movies) === isMovie; });
      const relativeIndex = serie.season.slice(0, currentSeasonIndex).filter(function (s) { return (!!s.movies) === isMovie; }).length;

      availableText = isMovie ? 'Filmes disponíveis' : 'Episódios disponíveis';
      if (seasonsOfType.length > 1) availableText = 'T' + (relativeIndex + 1) + ' - ' + availableText;
      availableText += ': ' + currentSeason.episodes.length;
    }
  } else {
    const currentSeason = serie.season[0];
    episodesToRender = currentSeason.episodes;
    availableText = 'Episódios disponíveis: ' + currentSeason.episodes.length;
    currentSeasonIndex = 0;
    dropdownValue = 'season-0';
    currentSeasonDropdownValue = dropdownValue;
  }

  // ===== Descrição =====
  let descriptionHTML = '';
  let desc = serie.description;
  if (dropdownValue !== 'all' && serie.season[currentSeasonIndex] && serie.season[currentSeasonIndex].description) {
    desc = serie.season[currentSeasonIndex].description;
  }

  const showDescription = shouldShowDescription(desc);

  if (showDescription) {
    const parts = [];
    if (dropdownValue === 'all') {
      const episodeSeasons = serie.season.filter(function (s) { return !s.movies; });
      const movieSeasons   = serie.season.filter(function (s) { return !!s.movies; });
      const totalEpisodes  = episodeSeasons.reduce(function (sum, s) { return sum + (s.episodes ? s.episodes.length : 0); }, 0);
      const totalMovies    = movieSeasons.reduce(function (sum, s) { return sum + (s.episodes ? s.episodes.length : 0); }, 0);
      if (episodeSeasons.length) {
        parts.push('Temporadas ' + String(episodeSeasons.length).padStart(2, '0') + ' - Episódios ' + totalEpisodes);
      }
      if (movieSeasons.length)   parts.push('Filmes: ' + totalMovies);
    } else {
      const cs = serie.season[currentSeasonIndex];
      const isMovieSeason = !!cs.movies;
      const count = (cs.episodes ? cs.episodes.length : 0);

      if (isMovieSeason) {
        parts.push('Filmes: ' + count);
      } else {
        const nonMovieSeasons = serie.season.filter(function (s) { return !s.movies; });
        const totalNonMovieSeasons = nonMovieSeasons.length;

        if (totalNonMovieSeasons <= 1) {
          // Só 1 temporada ⇒ não mostrar "Temporada 1 - ..."
          parts.push('Episódios ' + count);
        } else {
          const seasonOrdinal = nonMovieSeasons.indexOf(cs) + 1;
          const seasonLabel = cs.name ? cs.name : ('Temporada ' + seasonOrdinal);
          parts.push(seasonLabel + ' - Episódios ' + count);
        }
      }
    }

    let summaryHTML = '';
    if (parts.length > 0) {
      summaryHTML = '<h3>' + parts[0] + '</h3>';
      if (parts.length > 1) summaryHTML += '<h4>' + parts[1] + '</h4>';
    }

    const sinopseHTML = (desc.sinopse || '').replace(/(?:\r\n|\r|\n)/g, '<br>');
    const isFavorite = favorites.some(function (fav) { return fav.name === serie.name; });
    const descriptionThumb = (randomImagesDescription && desc.thumb && desc.thumb.length > 0)
      ? desc.thumb[Math.floor(Math.random() * desc.thumb.length)]
      : (desc.thumb && desc.thumb[0]) ? desc.thumb[0] : '';

    descriptionHTML = `
      <div id="series-description">
        <div class="description-thumb" style="background-image: url('${descriptionThumb}');"></div>
        <div class="description-content">
          <h2>${desc.title || serie.name}</h2>
          ${summaryHTML}
          <p>${sinopseHTML}</p>
          <button class="favorite-button-s2 ${isFavorite ? 'active' : ''}"
                  data-serie='${JSON.stringify(serie)}'
                  aria-label="${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"></button>
          ${shouldShowDropdown ? `
            <p2>Seleciona uma opção:</p2>
            <select id="season-dropdown">
              ${showAllOption ? `<option value="all" ${dropdownValue === 'all' ? 'selected' : ''}>${allLabel}</option>` : ''}
              ${serie.season.map(function (season, idx) {
                const label = season.name || (season.movies ? 'Filmes' : ('Temporada ' + (idx + 1)));
                return `<option value="season-${idx}" ${dropdownValue === 'season-' + idx ? 'selected' : ''}>${label}</option>`;
              }).join('')}
            </select>` : ''}
        </div>
      </div>`;
  }

  const html = `
    <div id="current-series">
      ${descriptionHTML}
      <div id="section-season">
        <div id="current-series-header">
          <p id="series-available-text">${availableText}</p>
          ${!showDescription && shouldShowDropdown ? `
            <select id="season-dropdown">
              ${showAllOption ? `<option value="all" ${dropdownValue === 'all' ? 'selected' : ''}>${allLabel}</option>` : ''}
              ${serie.season.map(function (season, idx) {
                const label = season.name || (season.movies ? 'Filmes' : ('Temporada ' + (idx + 1)));
                return `<option value="season-${idx}" ${dropdownValue === 'season-' + idx ? 'selected' : ''}>${label}</option>`;
              }).join('')}
            </select>` : ''}
        </div>
        <div id="current-series-episodes">
          ${renderEpisodes(serie, dropdownValue)}
        </div>
      </div>
    </div>`;
  document.getElementById('series').innerHTML = html;

  const effectConfig = showDescription
    ? ((dropdownValue !== 'all' && currentSerie.season[currentSeasonIndex] && currentSerie.season[currentSeasonIndex].description && currentSerie.season[currentSeasonIndex].description.effect)
      || (currentSerie.description && currentSerie.description.effect)
      || currentSerie.effect)
    : null;

  setupDescriptionEffects(effectConfig);
  setupDescriptionHoverPreview(desc);

  const newDropdown = document.getElementById('season-dropdown');
  const episodesContainer = document.getElementById('current-series-episodes');

  if (!newDropdown) {
    episodesContainer.style.display = 'flex';
  } else {
    newDropdown.value = dropdownValue;
    episodesContainer.style.display = newDropdown.value === 'all' ? 'block' : 'flex';
  }

  renderContinueWatchingSection();
  animateEpisodes(episodesToRender.length, previousEpisodeCount);
  previousEpisodeCount = episodesToRender.length;

  if (shouldShowDropdown && newDropdown) {
    newDropdown.addEventListener('change', function () {
      const value = this.value;
      currentSeasonDropdownValue = value;
      episodesContainer.style.display = (value === 'all') ? 'block' : 'flex';

      let newEpisodes = [];
      let newText = '';
      if (value === 'all' && showAllOption) {
        newEpisodes = serie.season.flatMap(function (s) { return s.episodes; });
        newText = onlyMovies
          ? 'Filmes disponíveis: ' + newEpisodes.length
          : 'Todos os episódios: ' + newEpisodes.length;
      } else {
        currentSeasonIndex = parseInt(value.split('-')[1], 10);
        const selSeason = serie.season[currentSeasonIndex];
        const isMovieSel = !!selSeason.movies;
        newEpisodes = selSeason.episodes;
        const seasonsOfType = serie.season.filter(function (s) { return (!!s.movies) === isMovieSel; });
        const relIndexSel = serie.season.slice(0, currentSeasonIndex).filter(function (s) { return (!!s.movies) === isMovieSel; }).length;

        newText = isMovieSel ? 'Filmes disponíveis' : 'Episódios disponíveis';
        if (seasonsOfType.length > 1) newText = 'T' + (relIndexSel + 1) + ' - ' + newText;
        newText += ': ' + selSeason.episodes.length;
      }

      document.getElementById('series-available-text').innerText = newText;
      animateEpisodes(newEpisodes.length, previousEpisodeCount, function () { renderCurrentSeries(serie, value); });
      previousEpisodeCount = newEpisodes.length;
    });
  }

  // favorito na descrição
  const favoriteButtonS2 = document.querySelector('.favorite-button-s2');
  if (favoriteButtonS2) {
    favoriteButtonS2.addEventListener('click', function (event) {
      event.stopPropagation();
      const serieObj = JSON.parse(this.getAttribute('data-serie'));
      const willFav = !this.classList.contains('active');

      this.classList.add('heart-pulse');
      setTimeout(() => this.classList.remove('heart-pulse'), 300);

      setFavoriteState(serieObj, willFav);
    });
  }

  addEpisodeButtonListeners();
  updateButtonVisibility();
  setupThumbnailLoading();
}

function normalizeFade(fade, dur) {
  let fi, fo;
  if (typeof fade === 'number') { fi = fo = Math.min(fade, dur / 2); }
  else if (fade && typeof fade === 'object') {
    fi = Math.min(fade.in  || 0, dur / 2);
    fo = Math.min(fade.out || 0, dur / 2);
  } else { fi = fo = 0; }
  return { fi, fo };
}

function runEdgeFade(el, durSec, { fi, fo }, startNow) {
  const durMs = (durSec || 10) * 1000;
  const inMs  = (fi || 0) * 1000;
  const outMs = (fo || 0) * 1000;
  let outTimer;

  const start = () => {
    // fade-in
    el.style.transition = `opacity ${fi}s linear`;
    el.style.opacity = '1';
    // agenda o fade-out no final
    if (outTimer) clearTimeout(outTimer);
    outTimer = setTimeout(() => {
      el.style.transition = `opacity ${fo}s linear`;
      el.style.opacity = '0';
    }, Math.max(0, durMs - outMs));
  };

  const stop = () => {
    if (outTimer) clearTimeout(outTimer);
    el.style.transition = '';
    el.style.opacity = '0';
  };

  if (startNow) start();
  return { start, stop };
}

function applyOneEffect(layerHost, cfg, hoverTarget = layerHost) {
  const layer = document.createElement('div');
  layer.className = 'effect-layer';
  if (cfg.mixBlend) layer.style.mixBlendMode = cfg.mixBlend;
  if (cfg.opacity) layer.style.opacity = cfg.opacity;
  layerHost.appendChild(layer);

  const durationFallback = Number(cfg.duration) || 0;
  const links = toArray(cfg.links);

  const onHoverStart = (starter) => () => starter();
  const onHoverStop  = (stopper) => () => stopper();

  links.forEach(link => {
    if (isVideoURL(link)) {
      const v = document.createElement('video');
      v.src = link; v.muted = true; v.playsInline = true;
      v.loop = false; v.autoplay = !cfg.hover;
      layer.appendChild(v);

      const startWithKnownDur = (dur) => {
        const fade = normalizeFade(cfg.fade, dur);
        const ctrl = runEdgeFade(v, dur, fade, !cfg.hover);
        if (!cfg.hover) v.play().catch(()=>{});

        if (cfg.hover) {
          hoverTarget.addEventListener('mouseenter', onHoverStart(() => {
            v.currentTime = 0; v.play().catch(()=>{}); ctrl.start();
          }));
          hoverTarget.addEventListener('mouseleave', onHoverStop(() => {
            v.pause(); ctrl.stop();
          }));
        } else {
          v.addEventListener('ended', () => {
            v.currentTime = 0; v.play().catch(()=>{}); ctrl.start();
          });
        }
      };

      v.addEventListener('loadedmetadata', () => {
        const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : durationFallback;
        startWithKnownDur(dur);
      });
      v.addEventListener('error', () => startWithKnownDur(durationFallback));
    } else {
      const img = document.createElement('img');
      img.src = link;
      layer.appendChild(img);

      const dur  = durationFallback;
      const fade = normalizeFade(cfg.fade, dur);
      const ctrl = runEdgeFade(img, dur, fade, !cfg.hover);

      if (cfg.hover) {
        let loopTimer;
        const startLoop = () => { ctrl.start(); clearInterval(loopTimer); loopTimer = setInterval(() => ctrl.start(), dur * 1000); };
        const stopLoop  = () => { clearInterval(loopTimer); ctrl.stop(); };
        hoverTarget.addEventListener('mouseenter', startLoop);
        hoverTarget.addEventListener('mouseleave', stopLoop);
      } else {
        setInterval(() => ctrl.start(), dur * 1000);
      }
    }
  });
}

function setupDescriptionEffects(effectConfig) {
  const root = document.querySelector('#series-description');
  const host = root?.querySelector('.description-thumb');
  if (!root || !host || !effectConfig) return;
  const list = toArray(effectConfig);
  list.forEach(cfg => applyOneEffect(host, cfg, root));
}

//=======================================================================
//VÍDEO DA DESCRIÇÃO
//=======================================================================
function parseYouTubeId(u){
  try{
    const url = new URL(u);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')){
      if (url.searchParams.get('v')) return url.searchParams.get('v');
      const m = url.pathname.match(/\/embed\/([^/?#]+)/);
      if (m) return m[1];
    }
  }catch(e){}
  return null;
}

function ensureYouTubeAPI(){
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (window._ytApiReadyPromise) return window._ytApiReadyPromise;
  window._ytApiReadyPromise = new Promise(resolve=>{
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    const iv = setInterval(()=>{
      if (window.YT && window.YT.Player){ clearInterval(iv); resolve(window.YT); }
    }, 50);
  });
  return window._ytApiReadyPromise;
}

function setupDescriptionHoverPreview(desc) {
  if (!shouldShowDescription(desc) || !desc.video) return;

  const root = document.querySelector('#series-description');
  const host = root?.querySelector('.description-thumb');
  if (!root || !host) return;

  // Limpa camadas/btns antigos + timers + listeners + player YT
  host.querySelectorAll('.effect-layer.effect-layer-video, .effect-layer.effect-layer-iframe, .effect-layer.effect-layer-youtube').forEach(n => n.remove());
  host.classList.remove('video-visible');
  host.querySelectorAll('.toggleSound, #checkboxInput').forEach(n => n.remove());
  if (host.__descTimers) { clearTimeout(host.__descTimers.start); clearTimeout(host.__descTimers.hide); }
  if (host.__descHandlers) {
    root.removeEventListener('mouseenter', host.__descHandlers.enter);
    root.removeEventListener('mouseleave', host.__descHandlers.leave);
  }
  // destrói player YT anterior se houver
  if (host.__ytPlayer) {
    try { host.__ytPlayer.destroy(); } catch {}
    host.__ytPlayer = null;
  }

  host.__descTimers   = { start:null, hide:null };
  host.__descHandlers = {};

  // Cria camada base
  const layer = document.createElement('div');
  layer.className = 'effect-layer effect-layer-video';
  host.appendChild(layer);

  // Escolha da mídia: arquivo de vídeo, YouTube ou Drive
  const list       = Array.isArray(desc.video) ? desc.video : [desc.video];
  const videoPick  = list.find(u => /\.(mp4|webm|ogg)(\?.*)?$/i.test(u));
  const drivePick  = list.find(u => u.includes('drive.google.com/file/d/') && u.includes('/preview'));
  const youtubePick= list.find(u => !!parseYouTubeId(u));

  let mediaElement;
  let isDriveVideo = false;
  let isYouTube    = false;

  if (videoPick) {
    // ---- <video> nativo ----
    const v = document.createElement('video');
    v.className = 'hero-bg-video';
    v.src = videoPick;
    v.muted = true;
    v.playsInline = true;
    v.loop = !!descriptionVideoLoop;
    v.autoplay = false;
    v.preload = 'metadata';
    mediaElement = v;

    // Botão de som
    const checkboxInput = document.createElement('input');
    checkboxInput.type = 'checkbox';
    checkboxInput.id = 'checkboxInput';
    checkboxInput.checked = false;
    host.appendChild(checkboxInput);

    const toggleSoundLabel = document.createElement('label');
    toggleSoundLabel.htmlFor = 'checkboxInput';
    toggleSoundLabel.className = 'toggleSound';
    toggleSoundLabel.innerHTML = `
      <div class="speaker"><svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 75 75">
        <path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z" style="stroke:#fff;stroke-width:5;stroke-linejoin:round;fill:#fff;"></path>
        <path d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" style="fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round"></path>
      </svg></div>
      <div class="mute-speaker">
        <svg version="1.0" viewBox="0 0 75 75">
          <path class="speaker-shape" d="m39,14-17,15H6V48H22l17,15z"></path>
          <path class="mute-x" d="m49,26 20,24m0-24-20,24"></path>
        </svg>
      </div>
    `;
    host.appendChild(toggleSoundLabel);
    checkboxInput.addEventListener('change', () => { v.muted = !checkboxInput.checked; });

} else if (youtubePick) {
  // ---- YouTube via IFrame API ----
  const ytId = parseYouTubeId(youtubePick);
  const holder = document.createElement('div');
  holder.className = 'hero-bg-video';
  holder.id = 'yt-prev-' + Math.random().toString(36).slice(2);
  mediaElement = holder;
  isYouTube = true;
  layer.className = 'effect-layer effect-layer-video effect-layer-youtube';

  // Botão de som (funciona via API YT)
  const checkboxInput = document.createElement('input');
  checkboxInput.type = 'checkbox';
  checkboxInput.id = 'checkboxInput';
  checkboxInput.checked = false;
  host.appendChild(checkboxInput);

  const toggleSoundLabel = document.createElement('label');
  toggleSoundLabel.htmlFor = 'checkboxInput';
  toggleSoundLabel.className = 'toggleSound';
  toggleSoundLabel.innerHTML = `
    <div class="speaker"><svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 75 75">
      <path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z" style="stroke:#fff;stroke-width:5;stroke-linejoin:round;fill:#fff;"></path>
      <path d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" style="fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round"></path>
    </svg></div>
    <div class="mute-speaker">
      <svg version="1.0" viewBox="0 0 75 75">
        <path class="speaker-shape" d="m39,14-17,15H6V48H22l17,15z"></path>
        <path class="mute-x" d="m49,26 20,24m0-24-20,24"></path>
      </svg>
    </div>
  `;
  host.appendChild(toggleSoundLabel);

  ensureYouTubeAPI().then(YT => {
    // destrói player anterior se ainda existir
    if (host.__ytPlayer) {
      try { host.__ytPlayer.destroy(); } catch {}
      host.__ytPlayer = null;
    }

    const playerVars = {
      autoplay: 0,               // controlamos no hover
      controls: 0,               // sem controles
      disablekb: 1,              // teclado desativado
      fs: 0,
      modestbranding: 1,
      rel: 0,                    // reduz relacionados (não remove 100%)
      iv_load_policy: 3,
      playsinline: 1,
      loop: descriptionVideoLoop ? 1 : 0,
      playlist: ytId
    };
    if (/^https?:\/\//.test(location.origin)) {
      playerVars.origin = location.origin; // evita erro 153
    }

    const player = new YT.Player(holder.id, {
      width: '100%',
      height: '100%',
      host: 'https://www.youtube-nocookie.com',
      videoId: ytId,
      playerVars,
      events: {
        onReady: (ev) => {
          host.__ytPlayer = ev.target;
          try {
            ev.target.mute();
            const ifr = ev.target.getIframe?.();
            if (ifr) {
              ifr.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
              ifr.setAttribute('allowfullscreen', '');
              ifr.setAttribute('referrerpolicy', 'origin');
              ifr.style.pointerEvents = 'none';   // <- clique não interage (não pausa)
              ifr.setAttribute('tabindex','-1');  // <- sem foco
            }
          } catch {}
        },
        onStateChange: (e) => {
          // se alguém conseguir pausar (ex.: overlay interno), retomamos enquanto estiver em hover
          if (e.data === YT.PlayerState.PAUSED && (host.matches(':hover') || root.matches(':hover'))) {
            try { e.target.playVideo(); } catch {}
          }
        },
        onError: (e) => console.warn('YouTube preview error', e?.data)
      }
    });

    // toggle som para YT (continua funcionando mesmo com pointer-events none)
    const cb = document.getElementById('checkboxInput');
    if (cb) cb.addEventListener('change', () => {
      const p = host.__ytPlayer;
      if (!p) return;
      try { cb.checked ? p.unMute() : p.mute(); } catch {}
    });
  });

} else if (drivePick) {
  // ---- Google Drive preview ----
  const iframe = document.createElement('iframe');
  iframe.className = 'hero-bg-video';
  iframe.src = drivePick;
  iframe.allow = 'autoplay; fullscreen';
  iframe.setAttribute('allowfullscreen', '');
  iframe.referrerPolicy = 'no-referrer';
  iframe.frameBorder = '0';
  iframe.style.pointerEvents = 'none';  // <- clique não interage
  iframe.setAttribute('tabindex','-1'); // <- sem foco
  isDriveVideo = true;
  mediaElement = iframe;
  layer.className = 'effect-layer effect-layer-video effect-layer-iframe';
} else {
  return; // nada suportado
}


  layer.appendChild(mediaElement);

  let shown = false;
  const delayMs = Math.max(0, (descriptionVideoFadeSec || 0.6) * 1000);

  const start = () => {
    clearTimeout(host.__descTimers.hide);
    if (shown) return;
    clearTimeout(host.__descTimers.start);
    host.__descTimers.start = setTimeout(() => {
      if (host.matches(':hover') || root.matches(':hover')) {
        shown = true;
        host.classList.add('video-visible');

        // play
        if (isYouTube) {
          const p = host.__ytPlayer;
          if (p) { try { p.mute(); p.seekTo(0, true); p.playVideo(); } catch {} }
        } else if (!isDriveVideo) {
          mediaElement.currentTime = 0;
          mediaElement.play().catch(()=>{});
        }
      }
    }, delayMs);
  };

  const scheduleHide = () => {
    clearTimeout(host.__descTimers.start);
    clearTimeout(host.__descTimers.hide);
    host.__descTimers.hide = setTimeout(() => {
      if (host.matches(':hover') || root.matches(':hover')) return;
      host.classList.remove('video-visible');

      // stop/reset
      if (isYouTube) {
        const p = host.__ytPlayer;
        if (p) { try { p.pauseVideo(); p.seekTo(0, true); } catch {} }
        shown = false;
      } else if (!isDriveVideo) {
        try { mediaElement.pause(); mediaElement.currentTime = 0; } catch {}
        shown = false;
      } else {
        shown = false;
      }
    }, delayMs);
  };

  host.__descHandlers.enter = start;
  host.__descHandlers.leave = scheduleHide;
  root.addEventListener('mouseenter', host.__descHandlers.enter);
  root.addEventListener('mouseleave', host.__descHandlers.leave);
}

//=======================================================================
//EPISÓDIOS
//=======================================================================
function renderEpisodes(serie, seasonValue) {
  const logs = JSON.parse(localStorage.getItem('logs')) || [];
  const serieKey = currentSerie.name.replace(/\s+/g, '_');
  const continues = JSON.parse(localStorage.getItem('continues')) || {};

  if (seasonValue === 'all') {
    return serie.season.map((season, seasonIdx) => {
      const episodes = season.episodes;
      const totalEpisodes = episodes.length;

      const isExpanded = seasonExpandedState[seasonIdx] !== undefined ? seasonExpandedState[seasonIdx] : true;
      const headerText = season.movies ? `Filmes disponíveis: ${totalEpisodes}` : `T${seasonIdx + 1} - Episódios disponíveis: ${totalEpisodes}`;

      return `
        <div class="season-section">
          <div class="season-header" data-season-index="${seasonIdx}">
            <button class="toggle-button-cards ${isExpanded ? 'expanded' : ''}" data-season-index="${seasonIdx}"></button>
            <p>${headerText}</p>
          </div>
          <div class="episode-list" data-season-index="${seasonIdx}" style="${!isExpanded ? 'display:none;' : 'display:flex;'}">
            ${episodes.map((episode, index) => {
              const fallbackThumb = season.thumb_season;
              const episodeThumb = episode.thumb || fallbackThumb;
              const titleText = !episode.title ? `Episódio ${index + 1}` : /^\d{1,3}$/.test(episode.title.trim()) ? `Episódio ${parseInt(episode.title, 10)}` : episode.title;
              const subtitleText = episode.subtitle && episode.subtitle.trim() ? episode.subtitle.trim() : '';
              const isWatched = logs.some(log =>
                log.serieName === currentSerie.name &&
                log.seasonIndex === seasonIdx &&
                log.episodeTitle === episode.title
              );
              const serieProgress = continues[serieKey]?.[season.name || `Temporada_${seasonIdx + 1}`];
              const activeEpisodeIndex = serieProgress?.activeEpisodeIndex;
              const isActive = activeEpisodeIndex !== undefined && index === activeEpisodeIndex ? 'active' : '';
              const watchedClass = isWatched ? 'watched' : '';
              const urlList = coerceUrlList(episode.url);

              return `
                <div class="episode-container">
                  <div id="episode-button"
                       data-url="${primaryUrlOf(episode)}"
                       data-urls='${JSON.stringify(urlList)}'
                       data-season-index="${seasonIdx}"
                       class="${isActive} ${watchedClass}"
                       style="background-image: url('${fallbackThumb}');">
                    <img class="episode-thumb" data-src="${episodeThumb}" data-fallback="${fallbackThumb}" alt="${titleText}" loading="lazy">
                    <span class="icon-btn"></span>
                    ${isWatched ? `<span class="badge-watched">▶ ASSISTIDO</span>` : ''}
                    ${episode.duration ? `<span class="badge-duration">${episode.duration}</span>` : ''}
                  </div>
                  <p class="episode-title">${titleText}</p>
                  <p class="episode-subtitle">${subtitleText}</p>
                </div>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');
  } else {
    const seasonIndex = parseInt(seasonValue.split('-')[1], 10);
    const season = serie.season[seasonIndex];
    const seasonKey = season.name || `Temporada_${seasonIndex + 1}`;
    const seasonProgress = continues[serieKey]?.[seasonKey];
    const activeEpisodeIndex = seasonProgress?.activeEpisodeIndex;

    return season.episodes.map((episode, index) => {
      const fallbackThumb = season.thumb_season;
      const episodeThumb = episode.thumb || fallbackThumb;
      const titleText = !episode.title ? `Episódio ${index + 1}` : /^\d{1,3}$/.test(episode.title.trim()) ? `Episódio ${parseInt(episode.title, 10)}` : episode.title;
      const subtitleText = episode.subtitle && episode.subtitle.trim() ? episode.subtitle.trim() : '';
      const isWatched = logs.some(log =>
        log.serieName === currentSerie.name &&
        log.seasonIndex === seasonIndex &&
        log.episodeTitle === episode.title
      );
      const isActive = activeEpisodeIndex !== undefined && index === activeEpisodeIndex ? 'active' : '';
      const watchedClass = isWatched ? 'watched' : '';
      const urlList = coerceUrlList(episode.url);

      return `
        <div class="episode-container">
          <div id="episode-button"
               data-url="${primaryUrlOf(episode)}"
               data-urls='${JSON.stringify(urlList)}'
               data-season-index="${seasonIndex}"
               class="${isActive} ${watchedClass}"
               style="background-image: url('${fallbackThumb}');">
            <img class="episode-thumb" data-src="${episodeThumb}" data-fallback="${fallbackThumb}" alt="${titleText}" loading="lazy">
            <span class="icon-btn"></span>
            ${isWatched ? `<span class="badge-watched">▶ ASSISTIDO</span>` : ''}
            ${episode.duration ? `<span class="badge-duration">${episode.duration}</span>` : ''}
          </div>
          <p class="episode-title">${titleText}</p>
          <p class="episode-subtitle">${subtitleText}</p>
        </div>`;
    }).join('');
  }
}

function convertToEmbedUrl(url) {
    if (!url) return url;
    
    console.log('Convertendo URL:', url); // ← Adicione isto para debug
    
    // Se já é um URL de embed, não converte
    if (url.includes('player.twitch.tv') || 
        url.includes('youtube.com/embed') || 
        url.includes('youtu.be/embed') ||
        url.includes('player.kick.com')) {
        return url;
    }
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = parseYouTubeId(url);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }
    
    // Twitch - URLs com ou sem protocolo
    if (url.includes('twitch.tv')) {
        // Adiciona https:// se não tiver protocolo
        let fullUrl = url;
        if (!url.startsWith('http')) {
            fullUrl = 'https://' + url;
        }
        
        const channelRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/;
        const match = fullUrl.match(channelRegex);
        
        if (match && match[1]) {
            return `https://player.twitch.tv/?channel=${match[1]}&parent=${parentDomain}&autoplay=true&muted=false`;
        }
    }
    
    // Kick - URLs com ou sem protocolo
    if (url.includes('kick.com')) {
        let fullUrl = url;
        if (!url.startsWith('http')) {
            fullUrl = 'https://' + url;
        }
        
        const kickRegex = /(?:https?:\/\/)?(?:www\.)?kick\.com\/([a-zA-Z0-9_]+)/;
        const match = fullUrl.match(kickRegex);
        if (match && match[1]) {
            return `https://player.kick.com/${match[1]}`;
        }
    }
    
    return url;
}

//=======================================================================
//CONTINUE ASSISTINDO
//=======================================================================
function renderContinueWatchingSection() {
  const seriesContainer = document.getElementById('current-series');
  let continueSeriesElement = document.getElementById('continue-series');
  if (!continueSeriesElement) {
    continueSeriesElement = document.createElement('div');
    continueSeriesElement.id = 'continue-series';
    const descriptionEl = document.getElementById('series-description');
    if (descriptionEl && descriptionEl.parentNode === seriesContainer) {
      seriesContainer.insertBefore(continueSeriesElement, descriptionEl.nextSibling);
    } else {
      seriesContainer.insertBefore(continueSeriesElement, seriesContainer.firstChild);
    }
  }

  const serieSlug = currentSerie.name.trim().replace(/\s+/g, '-');
  const serieKey  = currentSerie.name.replace(/\s+/g, '_');

  const savedProgress = continues[serieKey] || {};

  // Mantém só 1 por temporada
  const bestBySeason = {};
  Object.entries(savedProgress).forEach(([key, val]) => {
    if (!val || typeof val.seasonIndex !== 'number') return;
    const sIdx = val.seasonIndex;
    const cur  = bestBySeason[sIdx];
    if (!cur || (val.episodeIndex ?? -1) >= (cur.entry.episodeIndex ?? -1)) {
      bestBySeason[sIdx] = { entry: val, key };
    }
  });

  const keysToKeep = new Set(Object.values(bestBySeason).map(o => o.key));
  let changed = false;
  Object.keys(savedProgress).forEach(k => {
    if (!keysToKeep.has(k)) { delete continues[serieKey][k]; changed = true; }
  });
  if (changed) localStorage.setItem('continues', JSON.stringify(continues));

  let episodesHTML = '';
  Object.values(bestBySeason).forEach(({ entry, key }) => {
    const epIndex   = entry.episodeIndex;
    const epNumber  = (epIndex + 1).toString();
    const seasonTxt = entry.movies ? `Filme: ${entry.episodeTitle}` : `T${entry.seasonIndex + 1} - ${entry.episodeTitle}`;
    episodesHTML += `
      <div id="continue-episode-button"
           style="background-image: url('${entry.thumb}');"
           data-season-index="${entry.seasonIndex}"
           data-episode-index="${epIndex}"
           onclick="
              location.hash='${serieSlug}-${epNumber}';
              openVideoOverlay('${appendAutoplay(entry.url)}', ${entry.seasonIndex}, ${epIndex});
           ">
        <span class="icon-btn">
          <span class="trash-lid"></span>
          <span class="trash-handle"></span>
          <span class="trash-bar bar1"></span>
          <span class="trash-bar bar2"></span>
          <span class="trash-bar bar3"></span>
        </span>
        <p>${seasonTxt}</p>
        <div class="remove-button" data-season-key="${key}" data-season-index="${entry.seasonIndex}">✕</div>
      </div>`;
  });

  if (!episodesHTML) { continueSeriesElement.remove(); return; }

  continueSeriesElement.innerHTML = `
    <div id="continue-series-header">
      <p id="available-text">Continuar assistindo</p>
    </div>
    <div id="continue-series-episodes">${episodesHTML}</div>`;

  document.querySelectorAll('#continue-series .remove-button').forEach(button => {
    const newBtn = button.cloneNode(true);
    button.parentNode.replaceChild(newBtn, button);
    newBtn.addEventListener('click', event => {
      event.stopPropagation();
      const seasonKey   = newBtn.getAttribute('data-season-key');
      const seasonIndex = parseInt(newBtn.getAttribute('data-season-index'), 10);
      removeContinueSeriesSeason(seasonKey, seasonIndex);
    });
  });
}

function saveContinueProgress(progress) {
  let currentContinues = JSON.parse(localStorage.getItem('continues')) || {};
  const serieKey = progress.serieName.replace(/\s+/g, '_');
  if (!currentContinues[serieKey]) currentContinues[serieKey] = {};
  Object.entries(currentContinues[serieKey]).forEach(([k, v]) => {
    if (v && typeof v.seasonIndex === 'number' && v.seasonIndex === progress.seasonIndex) {
      delete currentContinues[serieKey][k];
    }
  });
  const seasonKey = progress.seasonName || `Temporada_${progress.seasonIndex + 1}`;
  currentContinues[serieKey][seasonKey] = { ...progress };
  continues = currentContinues;
  localStorage.setItem('continues', JSON.stringify(continues));
}

function removeContinueSeriesSeason(seasonKey) {
  if (!currentSerie) { console.warn('currentSerie não está definido'); return; }
  const serieKey = currentSerie.name.replace(/\s+/g, '_');
  if (continues[serieKey] && continues[serieKey][seasonKey]) {
    delete continues[serieKey][seasonKey];
    if (Object.keys(continues[serieKey]).length === 0) delete continues[serieKey];
    localStorage.setItem('continues', JSON.stringify(continues));
    continues = JSON.parse(localStorage.getItem('continues')) || {};
    renderContinueWatchingSection();
  } else {
    console.warn(`Chave ${seasonKey} não encontrada em continues[${serieKey}]`);
  }
}

//=======================================================================
//CLICO NOS BOTÕES DOS EPISÓDIO
//=======================================================================
function addEpisodeButtonListeners() {
  document.querySelectorAll('#episode-button').forEach((button, index) => {
    button.addEventListener('click', function () {
      const seasonDropdown = document.getElementById('season-dropdown');
      const isAllSeasons = seasonDropdown && seasonDropdown.value === 'all';

      let seasonIndex, episodeIndex;
      if (isAllSeasons) {
        const seasonSection = this.closest('.season-section');
        seasonIndex = parseInt(seasonSection.querySelector('.season-header').getAttribute('data-season-index'), 10);
        const episodeButtonsInSeason = seasonSection.querySelectorAll('.episode-container #episode-button');
        episodeIndex = Array.from(episodeButtonsInSeason).indexOf(this);
      } else {
        seasonIndex = currentSeasonIndex;
        episodeIndex = index;
      }

      // marca anterior no histórico
      if (currentSeasonIndex !== undefined && currentEpisodeIndex !== undefined &&
          (currentSeasonIndex !== seasonIndex || currentEpisodeIndex !== episodeIndex)) {
        const previousEpisode = currentSerie.season[currentSeasonIndex].episodes[currentEpisodeIndex];
        const now = new Date();
        const date = now.toLocaleDateString('pt-BR');
        const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const logs = JSON.parse(localStorage.getItem('logs')) || [];
        logs.push({
          serieName: currentSerie.name,
          seasonIndex: currentSeasonIndex,
          episodeTitle: previousEpisode.title,
          thumb: previousEpisode.thumb || currentSerie.season[currentSeasonIndex].thumb_season,
          date, time
        });
        localStorage.setItem('logs', JSON.stringify(logs));
      }

      currentSeasonIndex = seasonIndex;
      currentEpisodeIndex = episodeIndex;

      const seasonSection = document.querySelector(`.season-section .season-header[data-season-index="${seasonIndex}"]`);
      if (seasonSection) {
        seasonSection.closest('.season-section').querySelectorAll('#episode-button').forEach(btn => btn.classList.remove('active'));
      } else {
        document.querySelectorAll('#episode-button').forEach(btn => btn.classList.remove('active'));
      }
      this.classList.add('active');

      if (!isAllSeasons) currentSeasonDropdownValue = `season-${seasonIndex}`;

      const serieSlug = currentSerie.name.trim().replace(/\s+/g, '-');
      const rawTitle = currentSerie.season[seasonIndex].episodes[episodeIndex].title;
      const epNumber = /^\d+$/.test(rawTitle) ? rawTitle : (episodeIndex + 1).toString();
      window.history.replaceState(
        { page: 'series', serieName: currentSerie.name, episodeIndex, seasonIndex },
        '',
        `#${serieSlug}-${epNumber}`
      );

      const urls = JSON.parse(this.getAttribute('data-urls') || '[]');
      const url = urls[0] || '';
      openVideoOverlay(appendAutoplay(url), seasonIndex, episodeIndex);
      renderToggleButtons(this);
      updateButtonVisibility();

      const seasonObj = currentSerie.season[seasonIndex];
      const episode = seasonObj.episodes[episodeIndex];
      const chosen = primaryUrlOf(episode);
      const progress = {
        serieName: currentSerie.name,
        seasonName: seasonObj.name,
        episodeTitle: episode.title,
        episodeIndex, seasonIndex,
        thumb: episode.thumb || seasonObj.thumb_season,
        activeUrl: chosen,
        url: chosen, // compat
        movies: seasonObj.movies,
        activeEpisodeIndex: episodeIndex
      };
      saveContinueProgress(progress);
      renderContinueWatchingSection();
      logEpisodeClick(episode, seasonIndex, episodeIndex);
    });
  });
}

//=======================================================================
//ANIMAÇÕES / AUTOPLAY / LAZY-LOAD
//=======================================================================
function animateEpisodes(currentCount, previousCount, callback) {
  const episodeContainer = document.getElementById('current-series-episodes');
  const episodeContainers = episodeContainer.querySelectorAll('.episode-container');

  if (animationReverseEpisodes) {
    if (currentCount > previousCount) {
      if (callback) callback();
      const newEpisodeContainers = episodeContainer.querySelectorAll('.episode-container');
      newEpisodeContainers.forEach((episode, index) => {
        episode.style.opacity = '0';
        if (index >= previousCount) {
          setTimeout(() => {
            episode.classList.add('slide-in-right');
            episode.style.opacity = '1';
          }, (index - previousCount) * (animationSpeedEpisodes * 10));
        } else {
          episode.style.opacity = '1';
        }
      });
    } else if (currentCount < previousCount) {
      const episodesToRemove = previousCount - currentCount;
      episodeContainers.forEach((episode, index) => {
        if (index < currentCount) {
          episode.style.opacity = '1';
        } else {
          const reverseIndex = episodesToRemove - (index - currentCount) - 1;
          setTimeout(() => {
            episode.classList.add('slide-out-right');
          }, reverseIndex * (animationSpeedEpisodes * 10));
        }
      });
      const totalAnimationTime = episodesToRemove * (animationSpeedEpisodes * 10) + 500;
      setTimeout(() => { if (callback) callback(); }, totalAnimationTime);
    } else {
      if (callback) callback();
      const newEpisodeContainers = episodeContainer.querySelectorAll('.episode-container');
      newEpisodeContainers.forEach(episode => { episode.style.opacity = '1'; });
    }
  } else {
    if (callback) callback();
    const newEpisodeContainers = episodeContainer.querySelectorAll('.episode-container');
    newEpisodeContainers.forEach((episode, index) => {
      episode.classList.remove('slide-in-right', 'slide-out-right');
      episode.style.opacity = '0';
      setTimeout(() => {
        episode.classList.add('slide-in-right');
        episode.style.opacity = '1';
      }, index * 30);
    });
  }
}

function appendAutoplay(url) {
  if (!autoPlay || !url) return url;
  if (/[?&]autoplay=1\b/.test(url)) return url;
  return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

function setupThumbnailLoading() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                const fallback = img.dataset.fallback;

                if (thumbnailCache[src]) { // Se a thumb já está em cache
                    img.src = thumbnailCache[src];
                    img.closest('#episode-button').style.backgroundImage = `url('${thumbnailCache[src]}')`;
                } else { // Se não está em cache, tenta carregar
                    img.style.opacity = '0'; // Esconde a imagem temporariamente
                    img.src = src; // Define o src para iniciar o carregamento
                    img.onload = () => { // Ao carregar com sucesso
                        thumbnailCache[src] = src;
                        img.closest('#episode-button').style.backgroundImage = `url('${src}')`; // Atualiza background
                        img.style.transition = 'opacity 0.3s ease-in';
                        //img.style.opacity = '1'; // FALTA ESTA LINHA AQUI!
                    };
                    img.onerror = () => { // Em caso de erro ao carregar
                        img.src = fallback;
                        thumbnailCache[src] = fallback;
                        img.closest('#episode-button').style.backgroundImage = `url('${fallback}')`; // Atualiza background com fallback
                        img.style.transition = 'opacity 0.3s ease-in';
                        //img.style.opacity = '1'; // FALTA ESTA LINHA AQUI!
                    };
                }
                observer.unobserve(img); // Para de observar a imagem uma vez carregada
            }
        });
    }, { rootMargin: '200px' });

    document.querySelectorAll('.episode-thumb').forEach(img => {
        if (!img.src || img.src === '') { // Se a imagem não tem src, comece a observá-la
            observer.observe(img);
        } else if (thumbnailCache[img.dataset.src]) { // Se já está em cache (para imagens já carregadas)
            img.style.opacity = '0'; // Esconde
            img.src = thumbnailCache[img.dataset.src]; // Define src do cache
            img.style.transition = 'opacity 0.3s ease-in';
            img.style.opacity = '1'; // Mostra
        }
    });
}

//=======================================================================
//OVERLAY / DROPDOWNS / RENDER DE FONTE DE VÍDEOS / BOTÕES PREV/NEXT
//=======================================================================
function openVideoOverlay(videoUrl, seasonIndex = currentSeasonIndex, episodeIndex = currentEpisodeIndex) {
  savedScrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  lockPageScroll(true);
  const videoOverlay = document.getElementById('video-overlay');
  const videoIframe = document.getElementById('video-iframe');
  const videoOverlayDropdown = document.getElementById('video-overlay-dropdown');

  const serieKey = currentSerie.name.replace(/\s+/g, '_');
  const seasonKey = `continue_${serieKey}_season_${seasonIndex}`;
  const savedProgress = JSON.parse(localStorage.getItem(seasonKey));
  let initialEpisodeIndex = episodeIndex;

  if (savedProgress && savedProgress.episodeIndex !== undefined) {
    initialEpisodeIndex = savedProgress.episodeIndex;
  }

  const initialSeason = currentSerie.season[seasonIndex];
  const initialItem = initialSeason.episodes[initialEpisodeIndex];

  // >>> NOVO: sincroniza globais com o que está abrindo no overlay
  currentSeasonIndex = seasonIndex;
  currentEpisodeIndex = initialEpisodeIndex;

  // Escolhe URL inicial: tenta usar a salva, senão primeira do array
  const initialList = coerceUrlList(initialItem.url);
  const savedUrl = (savedProgress && (savedProgress.activeUrl || savedProgress.url));
  const chosenUrl = (savedUrl && initialList.includes(savedUrl)) ? savedUrl : (initialList[0] || '');

  const convertedUrl = convertToEmbedUrl(chosenUrl);
    
  videoIframe.src = appendAutoplay(convertedUrl);
  videoOverlay.classList.remove('hidden');
  videoOverlay.classList.add('show');

  // >>> NOVO: deixa o episódio atual marcado como .active na grade (se existir)
  (function markInitialActive() {
    const activeBtn = document.querySelector(
      `#episode-button[data-season-index="${seasonIndex}"][data-url="${primaryUrlOf(initialItem)}"]`
    );
    if (activeBtn) {
      document.querySelectorAll('#episode-button').forEach(btn => btn.classList.remove('active'));
      activeBtn.classList.add('active');
      renderToggleButtons(activeBtn);
      updateButtonVisibility();
    } else {
      renderToggleButtons(document.createElement('div'));
      updateButtonVisibility();
    }
  })();

  let overlaySeasonDropdown = document.getElementById('overlay-season-dropdown');
  let overlayEpisodesDropdown = document.getElementById('overlay-episodes-dropdown');

  // util local: marca episódio anterior como assistido (logs + classe + badge)
  function markPreviousAsWatched(prevSeasonIndex, prevEpisodeIndex) {
    if (prevSeasonIndex == null || prevEpisodeIndex == null) return;
    const prevSeason = currentSerie.season[prevSeasonIndex];
    if (!prevSeason) return;
    const previousEpisode = prevSeason.episodes?.[prevEpisodeIndex];
    if (!previousEpisode) return;

    const now = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.push({
      serieName: currentSerie.name,
      seasonIndex: prevSeasonIndex,
      episodeTitle: previousEpisode.title,
      thumb: previousEpisode.thumb || prevSeason.thumb_season,
      date,
      time
    });
    localStorage.setItem('logs', JSON.stringify(logs));

    const prevBtn = document.querySelector(
      `#episode-button[data-season-index="${prevSeasonIndex}"][data-url="${primaryUrlOf(previousEpisode)}"]`
    );
    if (prevBtn) {
      prevBtn.classList.add('watched');
      if (!prevBtn.querySelector('.badge-watched')) {
        const badge = document.createElement('span');
        badge.className = 'badge-watched';
        badge.textContent = '▶ ASSISTIDO';
        prevBtn.appendChild(badge);
      }
    }
  }

  // util local: ativa o novo episódio na grade e sincroniza UI
  function activateEpisodeInDOM(seasonIdx, episodeObj) {
    document.querySelectorAll('#episode-button').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(
      `#episode-button[data-season-index="${seasonIdx}"][data-url="${primaryUrlOf(episodeObj)}"]`
    );
    if (btn) btn.classList.add('active');
    renderToggleButtons(btn || document.createElement('div'));
    updateButtonVisibility();
  }

  if (!overlaySeasonDropdown || !overlayEpisodesDropdown) {
    overlaySeasonDropdown = document.createElement('select');
    overlaySeasonDropdown.id = 'overlay-season-dropdown';
    overlayEpisodesDropdown = document.createElement('select');
    overlayEpisodesDropdown.id = 'overlay-episodes-dropdown';

    if (currentSerie && currentSerie.season.length > 0) {
      currentSerie.season.forEach((season, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = season.name ? season.name : `Temporada ${index + 1}`;
        overlaySeasonDropdown.appendChild(option);
      });

      overlaySeasonDropdown.value = seasonIndex;
      videoOverlayDropdown.appendChild(overlaySeasonDropdown);

      updateEpisodesDropdown(seasonIndex, overlayEpisodesDropdown);
      overlayEpisodesDropdown.value = initialEpisodeIndex;
      videoOverlayDropdown.appendChild(overlayEpisodesDropdown);

      // Troca de TEMPORADA no overlay
      overlaySeasonDropdown.addEventListener('change', function () {
        const newSeasonIndex = parseInt(this.value, 10);

        // pega episódio de destino (salvo em continues, senão 0)
        const serieKey = currentSerie.name.replace(/\s+/g, '_');
        const seasonKey = currentSerie.season[newSeasonIndex].name || `Temporada_${newSeasonIndex + 1}`;
        const newSavedProgress = continues[serieKey] && continues[serieKey][seasonKey];
        const newEpisodeIndex = (newSavedProgress && newSavedProgress.episodeIndex !== undefined)
          ? newSavedProgress.episodeIndex
          : 0;

        // >>> NOVO: marca o anterior como assistido (se mudou de fato)
        if (newSeasonIndex !== currentSeasonIndex || newEpisodeIndex !== currentEpisodeIndex) {
          markPreviousAsWatched(currentSeasonIndex, currentEpisodeIndex);
        }

        currentSeasonIndex = newSeasonIndex;
        currentEpisodeIndex = newEpisodeIndex;

        updateEpisodesDropdown(newSeasonIndex, overlayEpisodesDropdown);
        overlayEpisodesDropdown.value = currentEpisodeIndex;

        const selectedSeason = currentSerie.season[newSeasonIndex];
        const selectedItem = selectedSeason.episodes[currentEpisodeIndex];

        // escolhe url ativa: a salva no continue (activeUrl) se existir nessa lista; senão primeira
        const list = coerceUrlList(selectedItem.url);
        const picked = newSavedProgress?.activeUrl;
        const nextUrl = (picked && list.includes(picked)) ? picked : (list[0] || '');
        videoIframe.src = appendAutoplay(nextUrl);

        // marca .active no grid, se existir na tela
        activateEpisodeInDOM(newSeasonIndex, selectedItem);

        const progress = {
          serieName: currentSerie.name,
          seasonName: selectedSeason.name || `Temporada_${newSeasonIndex + 1}`,
          episodeTitle: selectedItem.title,
          episodeIndex: currentEpisodeIndex,
          seasonIndex: newSeasonIndex,
          thumb: selectedItem.thumb || selectedSeason.thumb_season,
          activeUrl: nextUrl,
          url: nextUrl, // compat
          movies: selectedSeason.movies,
          activeEpisodeIndex: currentEpisodeIndex
        };

        saveContinueProgress(progress);
        renderContinueWatchingSection();

        if (currentSeasonDropdownValue !== 'all') {
          currentSeasonDropdownValue = `season-${newSeasonIndex}`;
        }

        // registra no log
        logEpisodeClick(selectedItem, newSeasonIndex, currentEpisodeIndex);
      });

      // Troca de EPISÓDIO no overlay
      overlayEpisodesDropdown.addEventListener('change', function () {
        const currentOverlaySeasonIndex = parseInt(overlaySeasonDropdown.value, 10);
        const newEpisodeIndex = parseInt(this.value, 10);

        // >>> NOVO: marca o anterior como assistido (se mudou de fato)
        if (newEpisodeIndex !== currentEpisodeIndex || currentOverlaySeasonIndex !== currentSeasonIndex) {
          markPreviousAsWatched(currentSeasonIndex, currentEpisodeIndex);
        }

        currentSeasonIndex = currentOverlaySeasonIndex;
        currentEpisodeIndex = newEpisodeIndex;

        const selectedSeason = currentSerie.season[currentOverlaySeasonIndex];
        const selectedItem = selectedSeason.episodes[currentEpisodeIndex];

        const list = coerceUrlList(selectedItem.url);
        // tenta usar o que estiver salvo como activeUrl para essa season; senão primeira
        const picked = continues[currentSerie.name.replace(/\s+/g,'_')]?.[selectedSeason.name || `Temporada_${currentOverlaySeasonIndex+1}`]?.activeUrl;
        const nextUrl = (picked && list.includes(picked)) ? picked : (list[0] || '');

        videoIframe.src = appendAutoplay(nextUrl);
        overlayEpisodesDropdown.value = currentEpisodeIndex;

        // marca .active no grid, se existir na tela
        activateEpisodeInDOM(currentOverlaySeasonIndex, selectedItem);

        const progress = {
          serieName: currentSerie.name,
          seasonName: selectedSeason.name || `Temporada_${parseInt(currentOverlaySeasonIndex, 10) + 1}`,
          episodeTitle: selectedItem.title,
          episodeIndex: currentEpisodeIndex,
          seasonIndex: parseInt(currentOverlaySeasonIndex, 10),
          thumb: selectedItem.thumb || selectedSeason.thumb_season,
          activeUrl: nextUrl,
          url: nextUrl, // compat
          movies: selectedSeason.movies,
          activeEpisodeIndex: currentEpisodeIndex
        };

        saveContinueProgress(progress);
        renderContinueWatchingSection();

        if (currentSeasonDropdownValue !== 'all') {
          currentSeasonDropdownValue = `season-${currentOverlaySeasonIndex}`;
        }

        // registra no log
        logEpisodeClick(selectedItem, currentOverlaySeasonIndex, currentEpisodeIndex);
      });
    }
  } else {
    overlaySeasonDropdown.value = seasonIndex;
    updateEpisodesDropdown(seasonIndex, overlayEpisodesDropdown);
    overlayEpisodesDropdown.value = initialEpisodeIndex;
  }
}

function updateEpisodesDropdown(seasonIndex, episodesDropdown) {
    episodesDropdown.innerHTML = '';

    let episodes = [];
    if (seasonIndex === 'all') {
        episodes = currentSerie.season.flatMap(season => 
            season.episodes.map((item, idx) => ({
                ...item,
                displayText: `T${currentSerie.season.indexOf(season) + 1} - ${item.title || `Episódio ${idx + 1}`}`
            }))
        );
    } else {
        const selectedSeason = currentSerie.season[seasonIndex];
        episodes = selectedSeason.episodes.map((item, index) => ({
            ...item,
            displayText: item.title || `Episódio ${index + 1}`
        }));
    }

    episodes.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.displayText;
        episodesDropdown.appendChild(option);
    });

    episodesDropdown.value = currentEpisodeIndex;
}

function renderToggleButtons(button) {
  const toggleButtonsContainer = document.getElementById('toggle-buttons-container');
  toggleButtonsContainer.innerHTML = '';

  let urlList = [];
  try { urlList = JSON.parse(button.getAttribute('data-urls') || '[]'); } catch {}
  if (!Array.isArray(urlList) || urlList.length === 0) {
      const single = button.getAttribute('data-url');
      if (single) urlList = [single];
  }
  if (urlList.length === 0) return;

  const videoIframe = document.getElementById('video-iframe');

  // REMOVER: Não crie convertedUrlList para evitar duplicação
  // const convertedUrlList = urlList.map(url => convertToEmbedUrl(url));

  // calcula URL inicial com base no progresso salvo (activeUrl)
  let initialUrl = urlList[0];
  try {
    const serieKey  = currentSerie?.name?.replace(/\s+/g, '_');
    const seasonObj = currentSerie?.season?.[currentSeasonIndex];
    const seasonKey = seasonObj?.name || `Temporada_${currentSeasonIndex + 1}`;
    const savedActive = continues?.[serieKey]?.[seasonKey]?.activeUrl;
    if (savedActive && urlList.includes(savedActive)) {
      initialUrl = savedActive;
    }
  } catch {}

  // função que aplica o ativo + atualiza iframe + salva progresso
  const updateActiveButton = (activeUrl) => {
    document.querySelectorAll('.toggle-button').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-url') === activeUrl);
    });
    
    // CONVERTE o URL para embed apenas quando for usar no iframe
    const embedUrl = convertToEmbedUrl(activeUrl);
    if (embedUrl) videoIframe.src = appendAutoplay(embedUrl);

    if (currentSerie && typeof currentSeasonIndex === 'number' && typeof currentEpisodeIndex === 'number') {
      const selectedSeason = currentSerie.season[currentSeasonIndex];
      const selectedItem   = selectedSeason.episodes[currentEpisodeIndex];
      const progress = {
        serieName: currentSerie.name,
        seasonName: selectedSeason.name || `Temporada_${currentSeasonIndex + 1}`,
        episodeTitle: selectedItem.title,
        episodeIndex: currentEpisodeIndex,
        seasonIndex: currentSeasonIndex,
        thumb: selectedItem.thumb || selectedSeason.thumb_season,
        activeUrl: activeUrl, // salva o URL original, não o convertido
        url: activeUrl, // compat
        movies: selectedSeason.movies,
        activeEpisodeIndex: currentEpisodeIndex
      };
      saveContinueProgress(progress);
      renderContinueWatchingSection();
    }
  };

  // cria os botões apenas UMA VEZ com os URLs originais
  urlList.forEach((u, i) => {
    const b = document.createElement('button');
    b.innerText = (i === 0) ? 'PRINCIPAL' : `OPÇÃO ${i + 1}`;
    b.classList.add('toggle-button');
    if (u === initialUrl) b.classList.add('active');
    b.setAttribute('data-url', u);
    b.addEventListener('click', () => updateActiveButton(u));
    toggleButtonsContainer.appendChild(b);
  });

  // REMOVER: Não crie botões duplicados com convertedUrlList
  // convertedUrlList.forEach((u, i) => {
  //     const b = document.createElement('button');
  //     b.innerText = (i === 0) ? 'PRINCIPAL' : `OPÇÃO ${i + 1}`;
  //     b.classList.add('toggle-button');
  //     if (u === initialUrl) b.classList.add('active');
  //     b.setAttribute('data-url', u);
  //     b.addEventListener('click', () => updateActiveButton(u));
  //     toggleButtonsContainer.appendChild(b);
  // });

  // Inicializa com o URL convertido
  updateActiveButton(initialUrl);
}

function navigateDirection(direction) {
  const seasonDropdown = document.getElementById('season-dropdown');
  const isAllSeasons = seasonDropdown && seasonDropdown.value === 'all';
  if (!currentSerie) return;

  const findPrevNonMovieSeason = (fromIdx) => {
    for (let i = fromIdx - 1; i >= 0; i--) {
      const s = currentSerie.season[i];
      if (s && !s.movies && s.episodes && s.episodes.length) return i;
    }
    return -1;
  };
  const findNextNonMovieSeason = (fromIdx) => {
    for (let i = fromIdx + 1; i < currentSerie.season.length; i++) {
      const s = currentSerie.season[i];
      if (s && !s.movies && s.episodes && s.episodes.length) return i;
    }
    return -1;
  };

  // ===== MODO "ALL": navegação linear entre todos episódios =====
  if (isAllSeasons) {
    const map = [];
    currentSerie.season.forEach((s, sIdx) => (s.episodes || []).forEach((ep, eIdx) => map.push({ sIdx, eIdx, ep, season: s })));

    let gIdx = map.findIndex(m => m.sIdx === currentSeasonIndex && m.eIdx === currentEpisodeIndex);
    if (gIdx === -1) gIdx = 0;

    if (direction === 'prev' && gIdx > 0) gIdx--;
    else if (direction === 'next' && gIdx < map.length - 1) gIdx++;
    else return;

    const { sIdx, eIdx, ep, season } = map[gIdx];
    currentSeasonIndex = sIdx;
    currentEpisodeIndex = eIdx;

    openVideoOverlay(appendAutoplay(primaryUrlOf(ep)), sIdx, eIdx);

    document.querySelectorAll('#episode-button').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`#episode-button[data-season-index="${sIdx}"][data-url="${primaryUrlOf(ep)}"]`);
    if (btn) btn.classList.add('active');
    renderToggleButtons(btn || document.createElement('div'));

    updateButtonVisibility();

    const serieSlug = currentSerie.name.trim().replace(/\s+/g, '-');
    const epNumber = (eIdx + 1).toString();
    window.history.replaceState(
      { page: 'series', serieName: currentSerie.name, episodeIndex: eIdx, seasonIndex: sIdx },
      '',
      `#${serieSlug}-${epNumber}`
    );

    const chosen = primaryUrlOf(ep);
    const progress = {
      serieName: currentSerie.name,
      seasonName: season.name || `Temporada_${sIdx + 1}`,
      episodeTitle: ep.title,
      episodeIndex: eIdx,
      seasonIndex: sIdx,
      thumb: ep.thumb || season.thumb_season,
      activeUrl: chosen,
      url: chosen, // compat
      movies: season.movies,
      activeEpisodeIndex: eIdx
    };
    saveContinueProgress(progress);
    renderContinueWatchingSection();
    logEpisodeClick(ep, sIdx, eIdx);
    return;
  }

  // ===== MODO "TEMPORADA ESPECÍFICA" =====
  const curSeason = currentSerie.season[currentSeasonIndex];
  const count = curSeason?.episodes?.length || 0;

  if (direction === 'prev') {
    if (currentEpisodeIndex > 0) {
      currentEpisodeIndex--;
    } else {
      const prevIdx = findPrevNonMovieSeason(currentSeasonIndex);
      if (prevIdx === -1) return;
      currentSeasonIndex = prevIdx;
      currentEpisodeIndex = currentSerie.season[prevIdx].episodes.length - 1;

      const sd = document.getElementById('season-dropdown');
      if (sd && sd.value !== 'all') {
        sd.value = `season-${prevIdx}`;
        sd.dispatchEvent(new Event('change'));
      }
    }
  } else if (direction === 'next') {
    if (currentEpisodeIndex < count - 1) {
      currentEpisodeIndex++;
    } else {
      const nextIdx = findNextNonMovieSeason(currentSeasonIndex);
      if (nextIdx === -1) return;
      currentSeasonIndex = nextIdx;
      currentEpisodeIndex = 0;

      const sd = document.getElementById('season-dropdown');
      if (sd && sd.value !== 'all') {
        sd.value = `season-${nextIdx}`;
        sd.dispatchEvent(new Event('change'));
      }
    }
  } else {
    return;
  }

  const episode = currentSerie.season[currentSeasonIndex].episodes[currentEpisodeIndex];
  const seasonObj = currentSerie.season[currentSeasonIndex];

  openVideoOverlay(appendAutoplay(primaryUrlOf(episode)), currentSeasonIndex, currentEpisodeIndex);

  document.querySelectorAll('#episode-button').forEach(btn => btn.classList.remove('active'));
  const curBtn = document.querySelector(
    `#episode-button[data-season-index="${currentSeasonIndex}"][data-url="${primaryUrlOf(episode)}"]`
  );
  if (curBtn) curBtn.classList.add('active');

  renderToggleButtons(curBtn || document.createElement('div'));
  updateButtonVisibility();

  const serieSlug = currentSerie.name.trim().replace(/\s+/g, '-');
  const epNumber = (currentEpisodeIndex + 1).toString();
  window.history.replaceState(
    { page: 'series', serieName: currentSerie.name, episodeIndex: currentEpisodeIndex, seasonIndex: currentSeasonIndex },
    '',
    `#${serieSlug}-${epNumber}`
  );

  const chosen = primaryUrlOf(episode);
  const progress = {
    serieName: currentSerie.name,
    seasonName: seasonObj.name || `Temporada_${currentSeasonIndex + 1}`,
    episodeTitle: episode.title,
    episodeIndex: currentEpisodeIndex,
    seasonIndex: currentSeasonIndex,
    thumb: episode.thumb || seasonObj.thumb_season,
    activeUrl: chosen,
    url: chosen, // compat
    movies: seasonObj.movies,
    activeEpisodeIndex: currentEpisodeIndex
  };
  saveContinueProgress(progress);
  renderContinueWatchingSection();
  logEpisodeClick(episode, currentSeasonIndex, currentEpisodeIndex);
}

function updateButtonVisibility() {
  const prevButton = document.getElementById('prev-video-button') || document.getElementById('prev-video-button-season');
  const nextButton = document.getElementById('next-video-button') || document.getElementById('next-video-button-season');
  const seasonDropdown = document.getElementById('season-dropdown');
  if (!prevButton || !nextButton || !currentSerie) return;

  const setTooltip = (btn, text, seasonal) => {
    [...btn.querySelectorAll('.tooltip-text, .tooltip-text-season')].forEach(n => n.remove());
    const span = document.createElement('span');

    if (seasonal) {
      // temporada → usa classes pedidas
      span.textContent = text;
      span.className = 'tooltip-text-season tooltip-right'; // [CHANGED]
    } else {
      span.textContent = text;
      span.className = 'tooltip-text tooltip-top';
    }
    btn.appendChild(span);
  };
  const setPrevDefault = () => {
    if (prevButton.id !== 'prev-video-button') prevButton.id = 'prev-video-button';
    setTooltip(prevButton, 'Anterior', false);
  };
  const setNextDefault = () => {
    if (nextButton.id !== 'next-video-button') nextButton.id = 'next-video-button';
    setTooltip(nextButton, 'Próximo', false);
  };
  const seasonOrdinalNonMovie = (targetIdx) => {
    let ord = 0;
    for (let i = 0; i <= targetIdx; i++) {
      const s = currentSerie.season[i];
      if (s && !s.movies) ord++;
    }
    return ord;
  };
  const findPrevNonMovieSeason = (fromIdx) => {
    for (let i = fromIdx - 1; i >= 0; i--) {
      const s = currentSerie.season[i];
      if (s && !s.movies && s.episodes && s.episodes.length) return i;
    }
    return -1;
  };
  const findNextNonMovieSeason = (fromIdx) => {
    for (let i = fromIdx + 1; i < currentSerie.season.length; i++) {
      const s = currentSerie.season[i];
      if (s && !s.movies && s.episodes && s.episodes.length) return i;
    }
    return -1;
  };

  // modo ALL
  if (seasonDropdown && seasonDropdown.value === 'all') {
    setPrevDefault(); setNextDefault();
    const map = [];
    currentSerie.season.forEach((s, sIdx) => (s.episodes || []).forEach((_, eIdx) => map.push({ sIdx, eIdx })));
    const gIdx = map.findIndex(m => m.sIdx === currentSeasonIndex && m.eIdx === currentEpisodeIndex);

    prevButton.style.display = (gIdx <= 0 || gIdx === -1) ? 'none' : 'block';
    nextButton.style.display = (gIdx === -1 || gIdx >= map.length - 1) ? 'none' : 'block';
    return;
  }

  // temporada específica
  const season = currentSerie.season[currentSeasonIndex];
  const total = season?.episodes?.length || 0;

  // prev
  if (currentEpisodeIndex === 0) {
    const prevSeasonIdx = findPrevNonMovieSeason(currentSeasonIndex);
    if (prevSeasonIdx !== -1) {
      if (prevButton.id !== 'prev-video-button-season') prevButton.id = 'prev-video-button-season';
      setTooltip(prevButton, `Temporada Anterior: ${seasonOrdinalNonMovie(prevSeasonIdx)}`, true);
      prevButton.style.display = 'block';
    } else {
      setPrevDefault(); prevButton.style.display = 'none';
    }
  } else {
    setPrevDefault(); prevButton.style.display = 'block';
  }

  // next
  if (currentEpisodeIndex < total - 1) {
    setNextDefault(); nextButton.style.display = 'block';
  } else {
    const nextSeasonIdx = findNextNonMovieSeason(currentSeasonIndex);
    if (nextSeasonIdx !== -1) {
      if (nextButton.id !== 'next-video-button-season') nextButton.id = 'next-video-button-season';
      setTooltip(nextButton, `Próxima Temporada: ${seasonOrdinalNonMovie(nextSeasonIdx)}`, true);
      nextButton.style.display = 'block';
    } else {
      setNextDefault(); nextButton.style.display = 'none';
    }
  }
}

//=======================================================================
//CARROSSEL
//=======================================================================
function wireCarouselCTA() {
  document.querySelectorAll('.slide .btn.primary').forEach(btn => {
    btn.onclick = function () {
      const serie = JSON.parse(this.getAttribute('data-serie') || '{}');
      if (!serie || !serie.name || !serie.enabled) return;

      window.history.pushState({ page: 'series', serieName: serie.name }, serie.name, `#${serie.name.replace(/\s+/g, '-')}`);
      document.getElementById('home').classList.replace('show','hidden');
      document.getElementById('series').classList.replace('hidden','show');
      document.getElementById('series-title').classList.replace('show','hidden');
      document.getElementById('logo').classList.replace('show','hidden');
      document.getElementById('series-name').classList.replace('hidden','show');
      document.getElementById('series-logs').classList.replace('show','hidden');
      document.getElementById('back-button').classList.replace('hidden','show');
      renderCurrentSeries(serie);
    };
  });

  // FAVORITO centralizado
  document.querySelectorAll('.slide .favorite-checkbox').forEach(cb => {
    cb.onchange = function () {
      const serie = JSON.parse(this.getAttribute('data-serie') || '{}');
      setFavoriteState(serie, this.checked);
    };
  });
}

function renderCarousel() {
  const wrapper = document.querySelector('.wrapper');
  const slider = document.querySelector('.slider');
  const slidesContainer = document.getElementById('slides');
  const dotsContainer = document.getElementById('dots');
  const progressBar = document.getElementById('progressBar');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressbar = document.querySelector('.progress-bar-container');

  // limpar estado anterior
  slider.querySelectorAll(':scope > input[type="radio"]').forEach(n => n.remove());
  if (slidesContainer) slidesContainer.innerHTML = '';
  if (dotsContainer) dotsContainer.innerHTML = '';

  // nada pra mostrar
  if (!seriesData[0]?.group || seriesData[0].group.length === 0) {
    removeControlsBottom(slider);
    if (dotsContainer) dotsContainer.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (wrapper) wrapper.style.display = "none";
    if (progressbar) progressbar.style.display = "none";
    return;
  }

  const enabledSeries = seriesData[0].group.filter(item => item.carrousel && item.carrousel.enabled !== false);
  if (enabledSeries.length === 0) {
    removeControlsBottom(slider);
    if (dotsContainer) dotsContainer.style.display = 'none';
    if (progressBar) progressBar.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (wrapper) wrapper.style.display = "none";
    if (progressbar) progressbar.style.display = "none";
    return;
  }

  const totalSlides = enabledSeries.length;

  // ========== APENAS 1 SLIDE ==========
  if (totalSlides === 1) {
    const carrousel = enabledSeries[0].carrousel;
    const serie = enabledSeries[0];

    const numSeasons  = serie.season.filter(s => !s.movies).length;
    const numEpisodes = serie.season.filter(s => !s.movies).reduce((t, s) => t + s.episodes.length, 0);
    const numMovies   = serie.season.filter(s =>  s.movies).reduce((t, s) => t + s.episodes.length, 0);

    const carrouselThumb = (randomImagesCarrousel && carrousel.thumb?.length > 0)
      ? carrousel.thumb[Math.floor(Math.random() * carrousel.thumb.length)]
      : carrousel.thumb?.[0] || '';

    // Verifica o formato do logo
    let logoContent = '';
    let logoStyle = '';
    if (carrousel.logo && typeof carrousel.logo === 'object' && carrousel.logo.url && carrousel.logo.enabled !== false) {
      logoStyle = carrousel.logo.minimalist ? 'filter: brightness(0) invert(1);' : '';
      logoContent = `<img src="${carrousel.logo.url}" alt="${carrousel.title}" class="brand-logo" style="${logoStyle}">`;
    } else if (typeof carrousel.logo === 'string' && carrousel.logo.trim() !== '') {
      logoContent = `<img src="${carrousel.logo}" alt="${carrousel.title}" class="brand-logo">`; // Suporte ao formato antigo
    }

    const titleContent = `
      ${logoContent}
      <h1 class="brand-title">${carrousel.title}</h1>
    `;

    const isFavorite = (JSON.parse(localStorage.getItem('favorites')) || []).some(f => f.name === serie.name);
    const badgeChip  = serie.badge ? `<span class="chip badgen">${serie.badge}</span>` : '';
    const newChip    = carrousel.text ? `<span class="chip new">${carrousel.text}</span>` : '';

    const favMarkup = `
      <label class="favorite-button-carrousel">
        <input type="checkbox" ${isFavorite ? 'checked=""' : ''} class="favorite-checkbox" data-serie='${JSON.stringify(serie)}' />
        <div class="favorite-button-star">
          <div class="favorite-text">${isFavorite ? 'FAVORITO' : 'FAVORITAR'}</div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="favorite-icon-carrousel">
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" stroke-linejoin="round" stroke-linecap="round"></path>
          </svg>
        </div>
      </label>`;

    slidesContainer.innerHTML = `
      <section class="slide" style="--bg: url('${carrouselThumb}')">
        <div class="content">
          ${titleContent}
          <div class="chips">
            ${badgeChip}
            ${newChip}
            ${numMovies   > 0 ? `<span class="chip movies">Filmes: ${numMovies}</span>` : ''}
            ${numSeasons  > 0 ? `<span class="chip seasons">Temporadas: ${numSeasons}</span>` : ''}
            ${numEpisodes > 0 ? `<span class="chip episodes">Episódios: ${numEpisodes}</span>` : ''}
          </div>
          <p class="desc">${(carrousel.description || '').trim()}</p>
          <div class="actions">
            <button class="btn primary" data-serie='${JSON.stringify(serie)}'>ASSISTIR</button>
            ${favMarkup}
          </div>
        </div>
      </section>`;

    removeControlsBottom(slider);
    if (dotsContainer) { dotsContainer.innerHTML = ''; dotsContainer.style.display = 'none'; }
    if (progressBar) progressBar.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (progressbar) progressbar.style.display = 'none';

    const slidesElement = document.querySelector('.slides');
    if (slidesElement) slidesElement.style.width = '100%';
    document.querySelectorAll('.slide').forEach(s => s.style.width = '100%');

    getOrCreateStyleTag('carousel-dynamic-rules').textContent = '';

    wireCarouselCTA();
    return;
  }

  // ========== MÚLTIPLOS SLIDES ==========
  if (dotsContainer) dotsContainer.style.display = '';
  if (progressBar) { progressBar.style.display = ''; progressBar.style.width = '0%'; }
  if (prevBtn) prevBtn.style.display = '';
  if (nextBtn) nextBtn.style.display = '';

  const pauseCheckbox = injectPlayPause(slider);

  const slidesHTML = [];
  const radios     = [];
  const dotsHTML   = [];

  enabledSeries.forEach((item, index) => {
    const carrousel = item.carrousel;
    const radioId   = `s${index + 1}`;
    const isFirst   = index === 0;

    const numSeasons  = item.season.filter(s => !s.movies).length;
    const numEpisodes = item.season.filter(s => !s.movies).reduce((t, s) => t + s.episodes.length, 0);
    const numMovies   = item.season.filter(s =>  s.movies).reduce((t, s) => t + s.episodes.length, 0);

    const carrouselThumb = (randomImagesCarrousel && carrousel.thumb?.length > 0)
      ? carrousel.thumb[Math.floor(Math.random() * carrousel.thumb.length)]
      : carrousel.thumb?.[0] || '';

    radios.push(`<input ${isFirst ? 'checked' : ''} type="radio" name="slider" id="${radioId}">`);

    // Verifica o formato do logo
    let logoContent = '';
    let logoStyle = '';
    if (carrousel.logo && typeof carrousel.logo === 'object' && carrousel.logo.url && carrousel.logo.enabled !== false) {
      logoStyle = carrousel.logo.minimalist ? 'filter: brightness(0) invert(1);' : '';
      logoContent = `<img src="${carrousel.logo.url}" alt="${carrousel.title}" class="brand-logo" style="${logoStyle}">`;
    } else if (typeof carrousel.logo === 'string' && carrousel.logo.trim() !== '') {
      logoContent = `<img src="${carrousel.logo}" alt="${carrousel.title}" class="brand-logo">`; // Suporte ao formato antigo
    }

    const titleContent = `
      ${logoContent}
      <h1 class="brand-title">${carrousel.title}</h1>
    `;

    const isFavorite = (JSON.parse(localStorage.getItem('favorites')) || []).some(f => f.name === item.name);
    const badgeChip  = item.badge ? `<span class="chip badgen">${item.badge}</span>` : '';
    const newChip    = carrousel.text ? `<span class="chip new">${carrousel.text}</span>` : '';

    const favMarkup = `
      <label class="favorite-button-carrousel">
        <input type="checkbox" ${isFavorite ? 'checked=""' : ''} class="favorite-checkbox" data-serie='${JSON.stringify(item)}' />
        <div class="favorite-button-star">
          <div class="favorite-text">${isFavorite ? 'FAVORITO' : 'FAVORITAR'}</div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="favorite-icon-carrousel">
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" stroke-linejoin="round" stroke-linecap="round"></path>
          </svg>
        </div>
      </label>`;

    slidesHTML.push(`
      <section class="slide" style="--bg: url('${carrouselThumb}')">
        <div class="content">
          ${titleContent}
          <div class="chips">
            ${badgeChip}
            ${newChip}
            ${numMovies   > 0 ? `<span class="chip movies">Filmes: ${numMovies}</span>` : ''}
            ${numSeasons  > 0 ? `<span class="chip seasons">Temporadas: ${numSeasons}</span>` : ''}
            ${numEpisodes > 0 ? `<span class="chip episodes">Episódios: ${numEpisodes}</span>` : ''}
          </div>
          <p class="desc">${(carrousel.description || '').trim()}</p>
          <div class="actions">
            <button class="btn primary" data-serie='${JSON.stringify(item)}'>ASSISTIR</button>
            ${favMarkup}
          </div>
        </div>
      </section>`);
    dotsHTML.push(`<label for="${radioId}"></label>`);
  });

  // clone do primeiro para loop
  const firstEnabledItem = enabledSeries[0];
  const firstNumSeasons  = firstEnabledItem.season.filter(s => !s.movies).length;
  const firstNumEpisodes = firstEnabledItem.season.filter(s => !s.movies).reduce((t, s) => t + s.episodes.length, 0);
  const firstNumMovies   = firstEnabledItem.season.filter(s =>  s.movies).reduce((t, s) => t + s.episodes.length, 0);

  const firstCarrouselThumb = (randomImagesCarrousel && firstEnabledItem.carrousel.thumb?.length > 0)
    ? firstEnabledItem.carrousel.thumb[Math.floor(Math.random() * firstEnabledItem.carrousel.thumb.length)]
    : firstEnabledItem.carrousel.thumb?.[0] || '';

  // Verifica o formato do logo para o clone
  let firstLogoContent = '';
  let firstLogoStyle = '';
  if (firstEnabledItem.carrousel.logo && typeof firstEnabledItem.carrousel.logo === 'object' && firstEnabledItem.carrousel.logo.url && firstEnabledItem.carrousel.logo.enabled !== false) {
    firstLogoStyle = firstEnabledItem.carrousel.logo.minimalist ? 'filter: brightness(0) invert(1);' : '';
    firstLogoContent = `<img src="${firstEnabledItem.carrousel.logo.url}" alt="${firstEnabledItem.carrousel.title}" class="brand-logo" style="${firstLogoStyle}">`;
  } else if (typeof firstEnabledItem.carrousel.logo === 'string' && firstEnabledItem.carrousel.logo.trim() !== '') {
    firstLogoContent = `<img src="${firstEnabledItem.carrousel.logo}" alt="${firstEnabledItem.carrousel.title}" class="brand-logo">`; // Suporte ao formato antigo
  }

  const cloneTitleContent = `
    ${firstLogoContent}
    <h1 class="brand-title">${firstEnabledItem.carrousel.title}</h1>
  `;

  const isFavClone = (JSON.parse(localStorage.getItem('favorites')) || []).some(f => f.name === firstEnabledItem.name);
  const badgeChipClone = firstEnabledItem.badge ? `<span class="chip badgen">${firstEnabledItem.badge}</span>` : '';
  const newChipClone   = firstEnabledItem.carrousel.text ? `<span class="chip new">${firstEnabledItem.carrousel.text}</span>` : '';

  const favMarkupClone = `
    <label class="favorite-button-carrousel">
      <input type="checkbox" ${isFavClone ? 'checked=""' : ''} class="favorite-checkbox" data-serie='${JSON.stringify(firstEnabledItem)}' />
      <div class="favorite-button-star">
        <div class="favorite-text">${isFavClone ? 'FAVORITO' : 'FAVORITAR'}</div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="favorite-icon-carrousel">
            <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" stroke-linejoin="round" stroke-linecap="round"></path>
        </svg>
      </div>
    </label>`;

  slidesHTML.push(`
    <section class="slide clone" style="--bg: url('${firstCarrouselThumb}')">
      <div class="content">
        ${cloneTitleContent}
        <div class="chips">
          ${badgeChipClone}
          ${newChipClone}
          ${firstNumMovies   > 0 ? `<span class="chip movies">Filmes: ${firstNumMovies}</span>` : ''}
          ${firstNumSeasons  > 0 ? `<span class="chip seasons">Temporadas: ${firstNumSeasons}</span>` : ''}
          ${firstNumEpisodes > 0 ? `<span class="chip episodes">Episódios: ${firstNumEpisodes}</span>` : ''}
        </div>
        <p class="desc">${(firstEnabledItem.carrousel.description || '').trim()}</p>
        <div class="actions">
          <button class="btn primary" data-serie='${JSON.stringify(firstEnabledItem)}'>ASSISTIR</button>
          ${favMarkupClone}
        </div>
      </div>
    </section>`);

  // injeta DOM (sem redeclarar radios!)
  slider.insertAdjacentHTML(
    'afterbegin',
    radios.join('') + `<input type="radio" name="slider" id="s${totalSlides + 1}">`
  );
  slidesContainer.innerHTML = slidesHTML.join('');
  dotsContainer.innerHTML   = dotsHTML.join('');

  // liga CTAs do carrossel (ASSISTIR + favorito)
  wireCarouselCTA();

  // dimensões
  const slidesEl = document.querySelector('.slides');
  slidesEl.style.width = `${100 * (totalSlides + 1)}%`;
  document.querySelectorAll('.slide').forEach(slide => {
    slide.style.width = `${100 / (totalSlides + 1)}%`;
  });

  // ===== Motor de autoplay/drag =====
  const slides = document.querySelector('.slider .slides');
  const radioInputs = [...document.querySelectorAll('.slider input[type="radio"]')];
  const s1 = document.getElementById('s1');

  const flingVelocityThreshold = 0.65;
  const rubberbandFactor = 0.35;
  let startTime, rafId;
  let paused = false;
  let isManuallyPaused = false;
  let elapsedBeforePause = 0;
  let isTransitioning = false;
  let isDragging = false;
  let startX = 0;
  let dragDistance = 0;
  let baseOffset = 0;
  let slideWidth = 0;
  let lastX = 0, lastT = 0, velocity = 0;

  const getIndex = () => radioInputs.findIndex(r => r.checked);
  const clearInlineTransform = () => { slides.style.transform = ''; };

  function measureSlideWidthAndGap() {
    const first = slides.firstElementChild;
    if (!first) return slider.clientWidth;
    const rect = first.getBoundingClientRect();
    const mr = parseFloat(getComputedStyle(first).marginRight) || 0;
    return rect.width + mr;
  }

  function toggleManualPause(isChecked) {
    if (isChecked) {
      isManuallyPaused = false;
      if (progressBar) progressBar.style.opacity = '1';
      if (!slider.matches(':hover') && !isDragging) resumeTimer();
    } else {
      isManuallyPaused = true;
      pauseTimer();
      if (progressBar) progressBar.style.opacity = '0';
    }
  }

  function onTransitionEnd() {
    slides.removeEventListener('transitionend', onTransitionEnd);
    isTransitioning = false;
    if (!paused) restartTimer();
  }

  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    const i = getIndex();
    const lastRealIndex = radioInputs.length - 2;
    if (i === lastRealIndex) {
      radioInputs[i + 1].checked = true;
      const onEnd = () => {
        slides.removeEventListener('transitionend', onEnd);
        slides.classList.add('no-anim');
        s1 && (s1.checked = true);
        void slides.offsetWidth;
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
    const lastRealIndex = radioInputs.length - 2;
    const firstRealIndex = 0;
    if (i === firstRealIndex) {
      slides.classList.add('no-anim');
      radioInputs[radioInputs.length - 1].checked = true;
      void slides.offsetWidth;
      slides.classList.remove('no-anim');
      radioInputs[lastRealIndex].checked = true;
    } else {
      radioInputs[i - 1].checked = true;
    }
    slides.addEventListener('transitionend', onTransitionEnd);
  }

  function updateProgressBar() {
    if (paused) return;
    const elapsed = Date.now() - startTime;
    const percent = Math.min((elapsed / (animationSpeedCarrouselBar * 1000)) * 100, 100);
    if (progressBar) progressBar.style.width = percent + '%';
    if (percent >= 100) nextSlide();
    else rafId = requestAnimationFrame(updateProgressBar);
  }

  function restartTimer() {
    cancelAnimationFrame(rafId);
    startTime = Date.now();
    if (progressBar) progressBar.style.width = '0%';
    if (!paused) rafId = requestAnimationFrame(updateProgressBar);
    else elapsedBeforePause = 0;
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
    const now = performance.now();
    velocity = (pageX - lastX) / Math.max(1, (now - lastT));
    lastX = pageX;
    lastT = now;
    dragDistance = pageX - startX;
    let desired = baseOffset + dragDistance;
    const maxOffset = -((radioInputs.length - 1) * slideWidth);
    if (desired > 0) desired = desired * rubberbandFactor;
    else if (desired < maxOffset) desired = maxOffset + (desired - maxOffset) * rubberbandFactor;
    slides.style.transform = `translateX(${desired}px)`;
    if (e.cancelable) e.preventDefault();
  }

  function endDragging() {
    if (!isDragging) return;
    isDragging = false;
    slides.style.cursor = 'grab';
    slides.style.willChange = '';
    slides.classList.remove('no-anim');
    const moved = Math.abs(dragDistance);
    const movedFraction = moved / Math.max(1, slideWidth);
    const fastSwipe = Math.abs(velocity) > flingVelocityThreshold;
    if (moved < 2) {
      clearInlineTransform();
      dragDistance = 0; velocity = 0;
      if (!isManuallyPaused && !slider.matches(':hover')) resumeTimer();
      return;
    }
    if (movedFraction >= animationSpeedCarrouselDrag || fastSwipe) {
      clearInlineTransform();
      if (dragDistance < 0) nextSlide();
      else prevSlide();
    } else {
      slides.style.transform = `translateX(${baseOffset}px)`;
      const onBack = () => {
        slides.removeEventListener('transitionend', onBack);
        clearInlineTransform();
        if (!isManuallyPaused && !slider.matches(':hover')) resumeTimer();
      };
      slides.addEventListener('transitionend', onBack, { once: true });
      requestAnimationFrame(() => {
        if (slides.style.transform) {
          requestAnimationFrame(() => { if (slides.style.transform) clearInlineTransform(); });
        }
      });
    }
  }

  slider.addEventListener('mouseenter', () => { if (!isManuallyPaused) pauseTimer(); });
  slider.addEventListener('mouseleave', () => { if (!isManuallyPaused && !isDragging) resumeTimer(); });

  slides.addEventListener('mousedown', startDragging);
  slides.addEventListener('mousemove', drag);
  slides.addEventListener('mouseup', endDragging);
  slides.addEventListener('mouseleave', endDragging);

  slides.addEventListener('touchstart', startDragging, { passive: false });
  slides.addEventListener('touchmove', drag, { passive: false });
  slides.addEventListener('touchend', endDragging);

  slides.addEventListener('click', (e) => { if (Math.abs(dragDistance) > 3) e.preventDefault(); }, true);

  if (pauseCheckbox) pauseCheckbox.addEventListener('change', (e) => toggleManualPause(e.target.checked));

  radioInputs.forEach(radio => radio.addEventListener('change', () => {
    clearInlineTransform();
    if (!paused) restartTimer();
    slides.addEventListener('transitionend', onTransitionEnd, { once: true });
  }));

  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); clearInlineTransform(); nextSlide(); });
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); clearInlineTransform(); prevSlide(); });

  // CSS dinâmico para a transição via radios
  const style = getOrCreateStyleTag('carousel-dynamic-rules');
  const cssRules = radioInputs.map((_, index) =>
    `#s${index + 1}:checked ~ .slides { transform: translateX(-${index * 100 / (totalSlides + 1)}%); }`
  ).join('\n');
  const dotRules = enabledSeries.map((_, index) =>
    `#s${index + 1}:checked ~ .dots label[for="s${index + 1}"] { background: #fff; width: 40px; }`
  ).join('\n');
  const cloneDotRule = `#s${totalSlides + 1}:checked ~ .dots label[for="s1"] { background: #fff; width: 40px; }`;
  style.textContent = `${cssRules}\n${dotRules}\n${cloneDotRule}`;

  const initialPlay = pauseCheckbox ? pauseCheckbox.checked : true;
  toggleManualPause(initialPlay);
  restartTimer();
}

//=======================================================================
//BUTTONS DE SÉRIES & FAVORITOS
//=======================================================================
function ensureRowScrollerStyles() {
  if (document.getElementById('row-scroller-styles')) return;
  const s = document.createElement('style');
  s.id = 'row-scroller-styles';
  s.textContent = `
  .group-series-rail{ position:relative; }
  .group-series-rail .row-scroll{
    display:flex; gap:16px; overflow-x:auto; overflow-y:hidden;
    scroll-behavior:smooth; padding: 0 46px;  /* respiro p/ as setas */
  }
  .group-series-rail .row-scroll.dragging{ cursor:grabbing; scroll-behavior:auto; }
  .group-series-rail .row-scroll::-webkit-scrollbar{ display:none; }

  .group-series-rail .row-nav{
    position:absolute; top:50%; transform:translateY(-50%);
    width:38px; height:38px; border:0; border-radius:50%;
    background:rgba(0,0,0,.45); color:#fff; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    backdrop-filter:saturate(1.2) blur(2px);
    box-shadow:0 2px 6px rgba(0,0,0,.35);
    z-index: 2;
  }
  .group-series-rail .row-nav.left{  left:4px;  }
  .group-series-rail .row-nav.right{ right:4px; }
  .group-series-rail .row-nav[hidden]{ display:none !important; }
  `;
  document.head.appendChild(s);
}

function makeRowScrollable(railEl){
  const scroller = railEl.querySelector('.row-scroll');
  const left  = railEl.querySelector('.row-nav.left');
  const right = railEl.querySelector('.row-nav.right');

  const by  = () => Math.round(scroller.clientWidth * 0.9);
  const max = () => scroller.scrollWidth - scroller.clientWidth;

  function update(){
    const atStart = scroller.scrollLeft <= 0;
    const atEnd   = scroller.scrollLeft >= max() - 1;
    left.hidden  = atStart;
    right.hidden = atEnd;
  }

  left.onclick  = () => scroller.scrollBy({left: -by(), behavior:'smooth'});
  right.onclick = () => scroller.scrollBy({left:  by(), behavior:'smooth'});
  scroller.addEventListener('scroll', update, {passive:true});
  update();

  // Drag (mouse/touch)
  let down = false, startX = 0, startLeft = 0, moved = 0;
  const getX = e => e.touches ? e.touches[0].pageX : e.pageX;

  const onDown = e => {
    down = true; moved = 0;
    startX = getX(e); startLeft = scroller.scrollLeft;
    scroller.classList.add('dragging');
  };
  const onMove = e => {
    if (!down) return;
    const x = getX(e);
    const dx = x - startX;
    moved += Math.abs(dx);
    scroller.scrollLeft = startLeft - dx;
  };
  const onUp = () => { down = false; scroller.classList.remove('dragging'); };

  scroller.addEventListener('mousedown', onDown);
  scroller.addEventListener('mousemove', onMove);
  scroller.addEventListener('mouseleave', onUp);
  scroller.addEventListener('mouseup', onUp);

  scroller.addEventListener('touchstart', onDown, {passive:true});
  scroller.addEventListener('touchmove', onMove, {passive:true});
  scroller.addEventListener('touchend', onUp);

  // Evita clique acidental depois de arrastar
  scroller.addEventListener('click', (e) => {
    if (moved > 6) e.preventDefault();
    moved = 0;
  }, true);
}

function isVisibleSeriesButtons(item) {
  return item && item.visible !== false;
}

function isVisibleSeriesGroup(group) {
  return group && group.visible !== false;
}

function renderSeriesButtons(filteredGroups, mode = 'normal') {
  const isSkeleton = mode === 'skeleton';

  const groupHome = document.getElementById('group-home');
  groupHome.innerHTML = '';

  favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  const sourceGroups = filteredGroups || seriesData;
  const groups = sourceGroups
    .filter(isVisibleSeriesGroup)
    .map(g => ({ ...g, group: (g.group || []).filter(isVisibleSeriesButtons) }))
    .filter(g => g.group.length > 0);

  groups.forEach((group, groupIndex) => {
    const sortedGroup = [...group.group].sort((a, b) => {
      // Prioridade 1: Baseado em enabled e na config disableButtonFirst
      const aDisabled = !a.enabled;  // true se desativado
      const bDisabled = !b.enabled;
      let aPriority = aDisabled ? 0 : 1;  // Por padrão, desativado (0) antes de ativado (1)
      let bPriority = bDisabled ? 0 : 1;
      if (!disableButtonFirst) {
        // Inverte: desativado (1) depois de ativado (0)
        aPriority = aDisabled ? 1 : 0;
        bPriority = bDisabled ? 1 : 0;
      }
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Prioridade 2: Presença de badge (com badge primeiro)
      const aHasBadge = a.badge && a.badge !== "";
      const bHasBadge = b.badge && b.badge !== "";
      if (aHasBadge !== bHasBadge) return bHasBadge - aHasBadge;

      // Prioridade 3: Valor do badge (alfabético)
      if (aHasBadge && bHasBadge) {
        const cmp = a.badge.localeCompare(b.badge);
        if (cmp !== 0) return cmp;
      }

      // Prioridade 4: Nome (alfabético)
      return a.name.localeCompare(b.name);
    });

    if (sortedGroup.length === 0) return;

    const cardsHTML = sortedGroup.map(serie => {
      const isFavorite = (favorites || []).some(fav => favName(fav) === serie.name);
      const disabledClass = serie.enabled ? '' : 'disabled';

      const thumbList = Array.isArray(serie.thumb_buttons)
        ? serie.thumb_buttons
        : (serie.thumb_buttons && Array.isArray(serie.thumb_buttons.url) ? serie.thumb_buttons.url : []);

      if (!selectedThumbs[serie.name]) {
        const thumbIndex = (randomImagesCards && thumbList.length > 0)
          ? Math.floor(Math.random() * thumbList.length)
          : 0;
        selectedThumbs[serie.name] = thumbList[thumbIndex] || '';
      }
      const selectedThumb = selectedThumbs[serie.name];

      const rawBadge = (typeof serie.badge === 'string' ? serie.badge : '');
      const normalizedBadge = rawBadge ? rawBadge.trim() : '';
      const badgeText = (!serie.enabled && !normalizedBadge) ? 'EM BREVE' : normalizedBadge;
      const badgeHTML = badgeText ? `<span class="badge">${badgeText}</span>` : '';

      // ------ SKELETON ------
      if (isSkeleton) {
        const showBadge = hasBadgeText(serie);
        return `
          <div id="group-series-button" class="${disabledClass} loading" style="--bg-image:none;" data-selected-thumb="${selectedThumb}">
            <span class="card-media skeleton"></span>
            ${showBadge ? `<span class="badge skeleton-pill"></span>` : ``}
            <div class="info">
              <h1 class="skeleton-block skel-w-70"></h1>
              <p class="skeleton-block skel-w-40 skel-gap"></p>
              <p class="skeleton-block skel-w-50 skel-gap"></p>
              <div class="skeleton-btn skel-gap"></div>
            </div>
            <button class="favorite-button skeleton-icon" disabled>
              ★<span class="tooltip-text black tooltip-top">Carregando…</span>
            </button>
          </div>`;
      }

      // ------ NORMAL ------
      const shouldFadeFromSkeleton = (mode === 'normal' && swapInFlight === true);
      const backgroundStyleNormal = shouldFadeFromSkeleton
        ? `--bg-image:none;`                       // começa sem imagem para dar fade-in
        : `--bg-image: url(${selectedThumb});`;
      const fadeClass = shouldFadeFromSkeleton ? 'img-will-fade' : '';

      return `
        <div id="group-series-button"
             class="${disabledClass} ${fadeClass}"
             style="${backgroundStyleNormal}"
             data-selected-thumb="${selectedThumb}">
          <span class="card-media"></span>
          ${badgeHTML}
          <div class="info">
            <h1>${serie.name}</h1>
            ${serie.enabled ? (
             serie.season.length > 0 ? (
                  serie.canais ? `<p>Canais disponíveis: ${serie.season.reduce((total, season) => total + season.episodes.length, 0)}</p>`
                  : serie.stream ? `<p>Stream disponíveis: ${serie.season.reduce((total, season) => total + season.episodes.length, 0)}</p>`
                    : `
                      ${serie.season.filter(s => !s.movies).length > 1 ? `<p>Temporadas: ${serie.season.filter(s => !s.movies).length}</p>` : ``}
                      ${serie.season.some(s => s.movies) ? `<p>Filmes: ${serie.season.filter(s => s.movies).reduce((t, s) => t + s.episodes.length, 0)}</p>` : ``}
                      ${serie.season.filter(s => !s.movies).reduce((t,s)=>t + (s.episodes?.length||0), 0) > 0
                      ? `<p>Episódios disponíveis: ${serie.season.filter(s => !s.movies).reduce((t,s)=>t + (s.episodes?.length||0), 0)}</p>`
                      : ``}
                    `
              )
              : `<p>Nenhum conteúdo disponível</p>`
            ) : ``}
            ${serie.enabled ? `<button class="watch-button">ASSISTIR</button>` : `<button class="watch-button">${serie.title || 'INDISPONÍVEL'}</button>`}
          </div>
          <button class="favorite-button ${isFavorite ? 'active' : ''}" data-serie='${JSON.stringify(serie)}'>
            ${isFavorite ? '★' : '☆'}
            <span class="tooltip-text black tooltip-top">${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</span>
          </button>
        </div>`;
    }).join('');

    // wrapper (com/sem setas)
    const wrapperClass = justReplacedSkeleton ? 'group-series' : 'group-series group-series-enter';
    const delayAttr    = justReplacedSkeleton ? '' : ` style="animation-delay: ${groupIndex * 0.2}s;"`;

    const groupSeriesHTML = `
      <div id="group-series" data-group="${group.group_name}" class="${wrapperClass}"${delayAttr}>
        <div id="group-series-header"><h2>${group.group_name}</h2></div>
        ${
          enableArrowButtons
          ? `
            <div class="group-series-rail">
              <button class="row-nav left" aria-label="Anterior">‹</button>
              <div id="group-series-cards" class="row-scroll">
                ${cardsHTML}
              </div>
              <button class="row-nav right" aria-label="Próximo">›</button>
            </div>`
          : `
            <div id="group-series-cards">
              ${cardsHTML}
            </div>`
        }
      </div>`;
    groupHome.innerHTML += groupSeriesHTML;
  });

  if (enableArrowButtons) {
    ensureRowScrollerStyles();
    document.querySelectorAll('.group-series-rail').forEach(makeRowScrollable);
  }

  // animação de entrada dos cards
  const cards = document.querySelectorAll('#group-series-button');
  if (isSkeleton) {
    // SKELETON: desliza da esquerda→direita
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(-24px)';
      card.style.transition = `opacity ${animationSpeedButtons*8}ms ease, transform ${animationSpeedButtons*8}ms ease`;
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }, index * animationSpeedButtons);
    });
  } else {
    // NORMAL: mantém sua lógica
    if (!justReplacedSkeleton) {
      cards.forEach((button, index) => {
        button.style.opacity = '0';
        setTimeout(() => { button.classList.add('fade-in-up'); }, index * animationSpeedButtons);
      });
    } else {
      cards.forEach(btn => {
        btn.classList.remove('fade-in-up');
        btn.style.opacity = '1';
      });
    }
  }

  // fade-in da imagem somente na transição skeleton -> normal
  if (mode === 'normal' && swapInFlight) {
    fadeInCardImages(document);
  }

  // binds só no modo normal
  if (!isSkeleton) {
    document.querySelectorAll('.favorite-button').forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });
    document.querySelectorAll('.favorite-button').forEach(button => {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        const serie = JSON.parse(this.getAttribute('data-serie') || '{}');
        const willFav = !this.classList.contains('active');
        setFavoriteState(serie, willFav);
      });
    });

    document.querySelectorAll('#group-series-button').forEach(button => {
      button.addEventListener('click', function () {
        requestTop();
        const serieName = this.querySelector('h1')?.innerText;
        const serie = seriesData
          .filter(isVisibleSeriesGroup)
          .flatMap(group => (group.group || []))
          .filter(isVisibleSeriesButtons)
          .find(serie => serie.name === serieName);
        if (!serie || !serie.enabled) return;
        window.history.pushState({ page: 'series', serieName }, serieName, '#' + serieName.replace(/\s+/g, '-'));
        document.getElementById('home').classList.replace('show','hidden');
        document.getElementById('series').classList.replace('hidden','show');
        document.getElementById('series-title').classList.replace('show','hidden');
        document.getElementById('logo').classList.replace('show','hidden');
        document.getElementById('series-name').classList.replace('hidden','show');
        document.getElementById('series-logs').classList.replace('show','hidden');
        document.getElementById('back-button').classList.replace('hidden','show');
        renderCurrentSeries(serie);
      });
    });
  }
}

//=======================================================================
//CARREGAMENTO DE PÁGINA: BOTOES ANIMADOS
//=======================================================================
let justReplacedSkeleton = false;
let swapInFlight = false;

function hasBadgeText(serie){
  const raw = typeof serie.badge === 'string' ? serie.badge.trim() : '';
  return !!raw || (!serie.enabled);
}

function renderGroupsInlineSkeleton(filteredGroups = null, delayMs = 800){
  if (swapInFlight) return;
  swapInFlight = true;

  // Fase 1: skeleton anima
  justReplacedSkeleton = false;
  renderSeriesButtons(filteredGroups, 'skeleton');
  updateFavorites('skeleton');

  setTimeout(() => {
    // Fase 2: conteúdo real SEM animar os cards (só a imagem com fade)
    justReplacedSkeleton = true;
    renderSeriesButtons(filteredGroups, 'normal');
    updateFavorites('normal');

    requestAnimationFrame(() => {
      justReplacedSkeleton = false; // libera futuras animações
      swapInFlight = false;         // encerra a janela de transição
    });
  }, delayMs);
}

function fadeInCardImages(root = document){
  const cards = root.querySelectorAll('#group-series-button.img-will-fade');
  cards.forEach(card => {
    const src = card.getAttribute('data-selected-thumb');
    if (!src || card.__imgFaded) return;

    const img = new Image();
    img.onload = () => {
      card.style.setProperty('--bg-image', `url('${src}')`);
      card.classList.add('img-fade-in'); // dispara o fade
      card.__imgFaded = true;
    };
    img.onerror = () => {
      card.style.setProperty('--bg-image', `url('${src}')`);
      card.classList.add('img-fade-in');
      card.__imgFaded = true;
    };
    img.src = src;
  });
}

//=======================================================================
//LISTA DE FAVORITOS
//=======================================================================
function syncFavoriteUI(serieName) {
  const favs  = JSON.parse(localStorage.getItem('favorites')) || [];
  const isFav = favs.some(f => f.name === serieName);

  // Carrossel (inclui slide clone)
  document.querySelectorAll('.favorite-button-carrousel .favorite-checkbox').forEach(inp => {
    try {
      const data = JSON.parse(inp.getAttribute('data-serie') || '{}');
      if (data.name === serieName) {
        inp.checked = isFav;
        const txt = inp.closest('.favorite-button-carrousel')?.querySelector('.favorite-text');
        if (txt) txt.textContent = isFav ? 'FAVORITO' : 'FAVORITAR';
      }
    } catch {}
  });

  // Cards (home + favoritos)
  document.querySelectorAll('#group-home .favorite-button, #group-favorites .favorite-button').forEach(btn => {
    try {
      const data = JSON.parse(btn.getAttribute('data-serie') || '{}');
      if (data.name === serieName) {
        if (isFav) {
          btn.classList.add('active');
          btn.innerHTML = '★ <span class="tooltip-text black tooltip-top">Remover dos favoritos</span>';
        } else {
          btn.classList.remove('active');
          btn.innerHTML = '☆ <span class="tooltip-text black tooltip-top">Adicionar aos favoritos</span>';
        }
      }
    } catch {}
  });

  // Botão da descrição (página da série)
  const s2 = document.querySelector('.favorite-button-s2');
  if (s2) {
    try {
      const data = JSON.parse(s2.getAttribute('data-serie') || '{}');
      if (data.name === serieName) {
        s2.classList.toggle('active', isFav);
        s2.setAttribute('aria-label', isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      }
    } catch {}
  }
}

function setFavoriteState(serie, isFav) {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  const name = serie.name;
  const exists = favs.some(f => favName(f) === name);

  if (isFav && !exists) favs.push({ name });
  if (!isFav && exists) favs = favs.filter(f => favName(f) !== name);

  localStorage.setItem('favorites', JSON.stringify(favs));
  favorites = favs;

  updateFavorites();
  filterSeries();
  syncFavoriteUI(name);
}

function favName(entry) { 
  return (entry && typeof entry === 'object') ? entry.name : String(entry); 
}

function getCanonicalSerieByName(name){
  for (const g of seriesData) {
    if (!g || !g.group) continue;
    const found = g.group.find(s => s && s.name === name);
    if (found) return found;
  }
  return null;
}

function updateFavorites(mode = 'normal') {
  const isSkeleton = mode === 'skeleton';
  const groupFavorites = document.getElementById('group-favorites');
  groupFavorites.innerHTML = '';

  favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.length === 0) return;

  const hydrated = favorites.map(f => getCanonicalSerieByName(favName(f)) || f);

  const sorted = [...hydrated].sort((a, b) => {
    // Prioridade 1: Baseado em enabled e na config disableButtonFirst
    const aDisabled = !a.enabled;  // true se desativado
    const bDisabled = !b.enabled;
    let aPriority = aDisabled ? 0 : 1;  // Por padrão, desativado (0) antes de ativado (1)
    let bPriority = bDisabled ? 0 : 1;
    if (!disableButtonFirst) {
      // Inverte: desativado (1) depois de ativado (0)
      aPriority = aDisabled ? 1 : 0;
      bPriority = bDisabled ? 1 : 0;
    }
    if (aPriority !== bPriority) return aPriority - bPriority;

    // Prioridade 2: Presença de badge (com badge primeiro)
    const ah = a.badge && a.badge !== "";
    const bh = b.badge && b.badge !== "";
    if (ah !== bh) return bh - ah;

    // Prioridade 3: Valor do badge (alfabético)
    if (ah && bh) {
      const cmp = a.badge.localeCompare(b.badge);
      if (cmp) return cmp;
    }

    // Prioridade 4: Nome (alfabético)
    return a.name.localeCompare(b.name);
  });

  const html = `
    <div id="group-series" class="${justReplacedSkeleton ? 'group-series' : 'group-series group-series-enter'}">
      <div id="group-series-header"><h3>FAVORITOS ★☆</h3></div>
      <div id="group-series-cards">
        ${sorted.map(serie => {
          const disabledClass = serie.enabled ? '' : 'disabled';
          const thumbList = Array.isArray(serie.thumb_buttons)
            ? serie.thumb_buttons
            : (serie.thumb_buttons && Array.isArray(serie.thumb_buttons.url) ? serie.thumb_buttons.url : []);
          const selectedThumb = selectedThumbs[serie.name] || thumbList[0] || '';

          const seasons = Array.isArray(serie.season) ? serie.season : [];
          const epSeasons    = seasons.filter(s => !s.movies);
          const movieSeasons = seasons.filter(s =>  s.movies);

          const showBadge = hasBadgeText(serie);
          const rawBadge = (typeof serie.badge === 'string' ? serie.badge : '');
          const normalizedBadge = rawBadge ? rawBadge.trim() : '';
          const badgeText = (!serie.enabled && !normalizedBadge) ? 'EM BREVE' : normalizedBadge;

          if (isSkeleton) {
            // --- SKELETON ---
            return `
              <div id="group-series-button" class="${disabledClass} loading"
                   style="--bg-image:none;" data-selected-thumb="${selectedThumb}">
                <span class="card-media skeleton"></span>
                ${showBadge ? `<span class="badge skeleton-pill"></span>` : ''}
                <div class="info">
                  <h1 class="skeleton-block skel-w-70"></h1>
                  ${epSeasons.length > 1 ? `<p class="skeleton-block skel-w-40 skel-gap"></p>` : ``}
                  ${movieSeasons.length ? `<p class="skeleton-block skel-w-35 skel-gap"></p>` : ``}
                  ${epSeasons.length ? `<p class="skeleton-block skel-w-50 skel-gap"></p>` : ``}
                  <div class="skeleton-btn skel-gap"></div>
                </div>
                <button class="favorite-button skeleton-icon" disabled>
                  ★<span class="tooltip-text black tooltip-top">Carregando…</span>
                </button>
              </div>`;
          }

          // --- NORMAL (com fade na troca skeleton -> normal) ---
          const shouldFadeFromSkeleton = (mode === 'normal' && swapInFlight === true);
          const backgroundStyle = shouldFadeFromSkeleton
            ? `--bg-image:none;`
            : `--bg-image: url(${selectedThumb});`;
          const fadeClass = shouldFadeFromSkeleton ? 'img-will-fade' : '';

          return `
            <div id="group-series-button" class="${disabledClass} ${fadeClass}"
                 style="${backgroundStyle}" data-selected-thumb="${selectedThumb}">
              <span class="card-media"></span>
              ${badgeText ? `<span class="badge">${badgeText}</span>` : ``}
              <div class="info">
                <h1>${serie.name}</h1>
                ${
                  serie.enabled ? (
                      seasons.length > 0
                        ? (serie.canais ? `<p>Canais disponíveis: ${seasons.reduce((t, s) => t + (s.episodes?.length || 0), 0)}</p>`
                        : serie.stream ? `<p>Streams disponíveis: ${seasons.reduce((t, s) => t + (s.episodes?.length || 0), 0)}</p>`
                          : `
                            ${epSeasons.length  > 1 ? `<p>Temporadas: ${epSeasons.length}</p>` : ``}
                            ${movieSeasons.length   ? `<p>Filmes: ${movieSeasons.reduce((t, s) => t + (s.episodes?.length || 0), 0)}</p>` : ``}
                            ${serie.season.filter(s => !s.movies).reduce((t,s)=>t + (s.episodes?.length||0), 0) > 0
                            ? `<p>Episódios disponíveis: ${serie.season.filter(s => !s.movies).reduce((t,s)=>t + (s.episodes?.length||0), 0)}</p>`
                            : ``}
                          `)
                        : `<p>Nenhum conteúdo disponível</p>`
                  ) : ``
                }
                ${serie.enabled ? `<button class="watch-button">ASSISTIR</button>`
                : `<button class="watch-button">${serie.title || 'INDISPONÍVEL'}</button>`}
              </div>
              <button class="favorite-button active" data-serie='${JSON.stringify(serie)}'>
                ★
                <span class="tooltip-text black tooltip-top">Remover dos favoritos</span>
              </button>
            </div>`;
        }).join('')}
      </div>
    </div>`;

  groupFavorites.innerHTML = html;

  // (opcional) animação do skeleton da esquerda → direita nos favoritos também
  if (isSkeleton) {
    const cards = groupFavorites.querySelectorAll('#group-series-button');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(-24px)';
      card.style.transition = `opacity ${animationSpeedButtons*8}ms ease, transform ${animationSpeedButtons*8}ms ease`;
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }, index * animationSpeedButtons);
    });
  }

  // FADE DA IMAGEM na transição skeleton -> normal (favoritos)
  if (mode === 'normal' && swapInFlight) {
    fadeInCardImages(groupFavorites); // usa o container de favoritos
  }

  // animação de entrada (modo normal) — mantém tua lógica
  document.querySelectorAll('#group-favorites #group-series-button').forEach((button, index) => {
    if (justReplacedSkeleton) { button.style.opacity = '1'; return; }
    button.style.opacity = '0';
    setTimeout(() => { button.classList.add('fade-in-up'); }, index * 100);
  });

  // binds só no modo normal
  if (!isSkeleton) {
    document.querySelectorAll('#group-favorites .favorite-button').forEach(button => {
      const nb = button.cloneNode(true);
      button.parentNode.replaceChild(nb, button);
    });
    document.querySelectorAll('#group-favorites .favorite-button').forEach(button => {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        const serie = JSON.parse(this.getAttribute('data-serie') || '{}');
        setFavoriteState(serie, false);
      });
    });
    document.querySelectorAll('#group-favorites #group-series-button').forEach(button => {
      button.addEventListener('click', function () {
        const serieName = this.querySelector('.info h1')?.innerText;
        const serie = seriesData.flatMap(group => group.group).find(serie => serie.name === serieName);
        if (!serie?.enabled) return;
        history.pushState({ page: 'series', serieName }, serieName, `#${serieName.replace(/\s+/g, '-')}`);
        document.getElementById('home').classList.replace('show','hidden');
        document.getElementById('series').classList.replace('hidden','show');
        document.getElementById('series-title').classList.replace('show','hidden');
        document.getElementById('logo').classList.replace('show','hidden');
        document.getElementById('series-name').classList.replace('hidden','show');
        document.getElementById('series-logs').classList.replace('show','hidden');
        document.getElementById('back-button').classList.replace('hidden','show');
        renderCurrentSeries(serie);
      });
    });
  }
}

function removeFavorite(serie){ setFavoriteState(serie, false); }

//=======================================================================
//BUSCA / FILTROS
//=======================================================================
let searchInput;
function filterSeries() {
  const query = searchInput.value.trim();
  const favoritesButton = document.querySelector('#keys button:nth-child(2)');
  const isFavoritesChecked = favoritesButton && favoritesButton.innerText === '★';
  const groupHome = document.getElementById('group-home');
  const groupFavorites = document.getElementById('group-favorites');
  const groupContinues = document.getElementById('group-continues');
  const checkedButton = document.querySelector('#keys button.checked');

  if (query.length > 0) {
    const filteredGroups = seriesData.map(group => {
      const filteredGroup = group.group.filter(serie => serie.name.toUpperCase().includes(query.toUpperCase()));
      return { ...group, group: filteredGroup };
    }).filter(group => group.group.length > 0);
    groupHome.style.display = 'block';
    groupFavorites.style.display = 'none';
    groupContinues.style.display = 'none';
    currentFilter = { type: 'search', value: query };
    renderSeriesButtons(filteredGroups);
  } else if (isFavoritesChecked) {
    groupHome.style.display = 'none';
    groupFavorites.style.display = 'block';
    groupContinues.style.display = 'none';
    currentFilter = { type: 'favorites' };
  } else if (checkedButton) {
    const letter = checkedButton.innerText;
    if (letter === 'TODAS') {
      groupHome.style.display = 'block';
      groupFavorites.style.display = 'block';
      groupContinues.style.display = 'block';
      currentFilter = null;
      renderSeriesButtons();
    } else if (letter !== '☆' && letter !== '★') {
      const filteredGroups = seriesData.map(group => {
        const filteredGroup = group.group.filter(serie => serie.name.toUpperCase().startsWith(letter));
        return { ...group, group: filteredGroup };
      }).filter(group => group.group.length > 0);
      groupHome.style.display = 'block';
      groupFavorites.style.display = 'none';
      groupContinues.style.display = 'none';
      currentFilter = { type: 'letter', value: letter };
      renderSeriesButtons(filteredGroups);
    }
  } else {
    groupHome.style.display = 'block';
    groupFavorites.style.display = 'block';
    groupContinues.style.display = 'block';
    currentFilter = null;
    renderSeriesButtons();
  }
}

function handleHashChange() {
    const rawHash = location.hash.slice(1);
    const decodedHash = decodeURIComponent(rawHash || '');

    if (history.state && history.state.page === 'home' && !decodedHash) {
        return;
    }

    if (!decodedHash) {
        window.history.replaceState({ page: 'home' }, '', window.location.pathname);
        document.getElementById('home').classList.replace('hidden', 'show');
        document.getElementById('series').classList.replace('show', 'hidden');
        document.getElementById('series-title').classList.replace('hidden', 'show');
        document.getElementById('series-name').classList.replace('show', 'hidden');
        document.getElementById('series-logs').classList.replace('show', 'hidden');
        document.getElementById('logo').classList.replace('hidden', 'show');
        document.getElementById('back-button').classList.replace('show', 'hidden');
        document.getElementById('logs-section').classList.add('hidden');

        const keyButtons = document.querySelectorAll('#keys button');
        keyButtons.forEach(btn => btn.classList.remove('checked'));
        keyButtons[0].classList.add('checked');
        keyButtons[1].innerText = '☆';
        searchInput.value = '';
        currentFilter = null;
        renderSeriesButtons();
        updateFavorites();
        // MenuSidebar?.setActiveFonte('home');
        // MenuSidebar?.setActiveGroup(null);
        return;
    }

    if (decodedHash === 'logs') {
        window.history.replaceState({ page: 'logs' }, '', '#logs');
        createLogsSection();
        document.getElementById('home').classList.replace('show', 'hidden');
        document.getElementById('series').classList.replace('show', 'hidden');
        document.getElementById('logo').classList.replace('show', 'hidden');
        document.getElementById('series-title').classList.replace('show', 'hidden');
        document.getElementById('series-name').classList.replace('show', 'hidden');
        document.getElementById('series-logs').classList.replace('hidden', 'show');
        document.getElementById('back-button').classList.replace('hidden', 'show');
        // MenuSidebar?.setActiveFonte('logs');
        // MenuSidebar?.setActiveGroup(null);
        return;
    }

    const match = decodedHash.match(/^(.*?)(?:-(\d+))?$/);
    if (!match) {
        console.warn(`Hash inválido: ${decodedHash}`);
        window.history.replaceState({ page: 'home' }, '', window.location.pathname);
        window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'home' } }));
        return;
    }

    const serieSlug = match[1];
    const epNumber = match[2] ? parseInt(match[2], 10) : null;

    const allSeries = seriesData.flatMap(g => g.group);
    const serie = allSeries.find(s => s.name.trim().replace(/\s+/g, '-') === serieSlug);

    if (!serie) {
        console.warn(`Série com slug ${serieSlug} não encontrada`);
        window.history.replaceState({ page: 'home' }, '', window.location.pathname);
        window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'home' } }));
        return;
    }

    window.history.replaceState({ page: 'series', serieName: serie.name }, '', `#${serieSlug}`);
    document.getElementById('home').classList.replace('show', 'hidden');
    document.getElementById('series').classList.replace('hidden', 'show');
    document.getElementById('series-title').classList.replace('show', 'hidden');
    document.getElementById('series-name').classList.replace('hidden', 'show');
    document.getElementById('series-logs').classList.replace('show', 'hidden');
    document.getElementById('logo').classList.replace('show', 'hidden');
    document.getElementById('back-button').classList.replace('hidden', 'show');
    document.getElementById('logs-section').classList.add('hidden');

    renderCurrentSeries(serie);

    if (epNumber !== null) {
        setTimeout(() => {
            const idx = epNumber - 1;
            const buttons = document.querySelectorAll('#episode-button');
            if (buttons[idx]) {
                buttons[idx].click();
            } else {
                console.warn(`Episódio ${epNumber} não encontrado para a série ${serie.name}`);
            }
        }, 0);
    }

    // MenuSidebar?.setActiveFonte(null);
}

//=======================================================================
//LOGS
//=======================================================================
function createLogsSection() {
    dedupeLogsCache();
    let logsSection = document.getElementById('logs-section');
    if (!logsSection) {
        logsSection = document.createElement('div');
        logsSection.id = 'logs-section';
        document.getElementById('main').appendChild(logsSection);
    }

    let logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs = logs.reverse();

    // Agrupar logs por serieName
    const logsBySerie = logs.reduce((acc, log, index) => {
        if (!acc[log.serieName]) {
            acc[log.serieName] = [];
        }
        acc[log.serieName].push({ ...log, originalIndex: index });
        return acc;
    }, {});

    if (Object.keys(logsBySerie).length === 0) {
        logsSection.innerHTML = `
            <div id="logs-header">
                <h3>Histórico</h3>
            </div>
            <div id="logs-content">
                <p id="no-logs-message">Nenhum histórico para exibir.</p>
            </div>
        `;
    } else {
        const logsHTML = `
            <div id="logs-header">
                <div id="logs-header-top">
                    <h3>Históricos disponíveis:</h3>
                    <button id="clear-all-logs-button">Remover todos 🗑️</button>
                </div>
                <div id="search">
                    <div class="container-input">
                        <input type="text" placeholder="Procurar" name="text" class="input" autocomplete="off">
                        <svg fill="#000000" width="20px" height="20px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                            <path d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z" fill-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div id="logs-content">
                ${Object.keys(logsBySerie).sort().map((serieName, serieIdx) => {
                    const serieLogs = logsBySerie[serieName];
                    const isExpanded = seasonExpandedState[`log-${serieName}`] !== undefined ? seasonExpandedState[`log-${serieName}`] : true;
                    return `
                        <div class="logs-section">
                            <div class="logs-header" data-log-index="log-${serieName}">
                                <button class="toggle-button-cards ${isExpanded ? 'expanded' : ''}" data-log-index="log-${serieName}"></button>
                                <p>${serieName}: ${serieLogs.length} históricos</p>
                            </div>
                            <div class="log-list" data-log-index="log-${serieName}" class="${isExpanded ? 'vertical-layout' : 'horizontal-layout'}" style="${!isExpanded ? 'display: none;' : 'display: block;'}">
                                ${serieLogs.map(log => `
                                    <li class="log-entry" data-index="${log.originalIndex}">
                                        <img src="${log.thumb}" alt="" class="log-thumb">
                                        <div class="log-details">
                                            <div class="log-title">${log.serieName}</div>
                                            <div class="log-meta">
                                                <span class="log-episodes">Temporada ${log.seasonIndex + 1} – ${log.episodeTitle.padStart(3, '0')}</span>
                                                <span class="log-date">Data: ${log.date} – ${log.time}</span>
                                            </div>
                                        </div>
                                        <button class="remove-log-button" data-index="${log.originalIndex}"><span>✕</span></button>
                                    </li>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        logsSection.innerHTML = logsHTML;

        // Animação "vir de cima" para cada seção
        const sections = logsSection.querySelectorAll('.logs-section');
        sections.forEach((section, i) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                section.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
                setTimeout(() => {
                    section.style.transition = '';
                    section.style.transform = '';
                }, 300 + i * animationSpeedLogs);
            }, i * animationSpeedLogs);
        });
    }

    // Exibe a seção e ajusta header/back-button
    logsSection.classList.remove('hidden');
    logsSection.classList.add('show');
    document.getElementById('logo').classList.replace('show', 'hidden');
    document.getElementById('back-button').classList.add('show');

    // Filtro de busca
    const searchInput = logsSection.querySelector('#logs-header input.input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const termo = searchInput.value.trim().toLowerCase();
            const sections = logsSection.querySelectorAll('.logs-section');

            sections.forEach(section => {
                const serieName = section.querySelector('.logs-header p').textContent.split(':')[0].toLowerCase();
                const entries = section.querySelectorAll('.log-entry');
                let hasVisibleEntries = false;

                entries.forEach(entry => {
                    const title = entry.querySelector('.log-title').textContent.toLowerCase();
                    const meta = entry.querySelector('.log-meta').textContent.toLowerCase();
                    const texto = title + ' ' + meta;

                    const isVisible = texto.includes(termo);
                    entry.style.display = isVisible ? '' : 'none';
                    if (isVisible) hasVisibleEntries = true;
                });

                section.style.display = hasVisibleEntries || serieName.includes(termo) ? '' : 'none';
            });
        });
    }

    // Botão "Limpar logs"
    const clearAllButton = document.getElementById('clear-all-logs-button');
    if (clearAllButton) {
        clearAllButton.addEventListener('click', () => {
            localStorage.removeItem('logs');
            createLogsSection();
        });
    }

    // Botões de remover individual
    document.querySelectorAll('.remove-log-button').forEach(button => {
        button.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'), 10);
            const currentLogs = JSON.parse(localStorage.getItem('logs')) || [];
            const removeIndex = currentLogs.length - 1 - idx;
            currentLogs.splice(removeIndex, 1);
            localStorage.setItem('logs', JSON.stringify(currentLogs));
            createLogsSection();
        });
    });
}

function logEpisodeClick(episode, seasonIndex, episodeIndex) {
    const now  = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const serieName = currentSerie.name;
    const thumb = episode.thumb || currentSerie.season[seasonIndex].thumb_season;

    const logEntry = {
        serieName: serieName,
        episodeTitle: episode.title,
        seasonIndex: seasonIndex,
        thumb: thumb,
        date: date,
        time: time
    };

    // ===== Carrega e DEDUPLICA o cache inteiro (mantendo a ocorrência mais recente de cada ep) =====
    let logs = JSON.parse(localStorage.getItem('logs')) || [];

    // percorre de trás pra frente para manter a última ocorrência
    const seen = new Set();
    const deduped = [];
    for (let i = logs.length - 1; i >= 0; i--) {
        const l = logs[i];
        const key = `${l.serieName}::${l.seasonIndex}::${l.episodeTitle}`;
        if (!seen.has(key)) {
            seen.add(key);
            // unshift para reconstruir na ordem original das últimas ocorrências
            deduped.unshift(l);
        }
    }
    logs = deduped;

    // ===== Remove qualquer ocorrência antiga do MESMO episódio =====
    const currentKey = `${serieName}::${seasonIndex}::${episode.title}`;
    logs = logs.filter(l => `${l.serieName}::${l.seasonIndex}::${l.episodeTitle}` !== currentKey);

    // ===== Insere a nova entrada no FINAL (na UI você inverte com reverse, logo ela sobe pro topo) =====
    logs.push(logEntry);

    localStorage.setItem('logs', JSON.stringify(logs));

    // Atualiza a seção de logs (se visível)
    const logsSection = document.getElementById('logs-section');
    if (logsSection && logsSection.classList.contains('show')) {
        createLogsSection();
    }
}

function dedupeLogsCache() {
    let logs = JSON.parse(localStorage.getItem('logs')) || [];
    if (!Array.isArray(logs) || logs.length === 0) return;

    // varre de trás pra frente (mais recente → mais antiga) e mantém só a primeira vez que vê a chave
    const seen = new Set();
    const deduped = [];
    for (let i = logs.length - 1; i >= 0; i--) {
        const l = logs[i];
        const key = `${l.serieName}::${l.seasonIndex}::${l.episodeTitle}`;
        if (!seen.has(key)) {
            seen.add(key);
            // reconstruímos na ordem original (mais antiga → mais recente)
            deduped.unshift(l);
        }
    }

    // salva de volta já limpo
    localStorage.setItem('logs', JSON.stringify(deduped));
}

//=======================================================================
//MENU LATERAL
//=======================================================================
const MenuSidebar = (() => {
  let els = {};
  let opts = { filterMode: 'dom', triggerSelector: 'label.menu', seriesData: [] };
  const state = { groups: [], initialized:false };

  // ---------------- utils ----------------
  const slugify = s => String(s||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().trim();

  const esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function disableAnchor(a, on){
    a.classList.toggle('active', on);
    a.setAttribute('aria-current', on ? 'true' : 'false');
    a.setAttribute('aria-disabled', on ? 'true' : 'false');
    a.style.pointerEvents = on ? 'none' : '';
    a.style.opacity = on ? '.75' : '';
  }

  // marca/garante data-group-slug nas seções renderizadas da Home
  function tagGroupSections(){
    document.querySelectorAll('#group-home > section, #group-home > #group-series').forEach(sec=>{
      const nameAttr = sec.getAttribute('data-group') || sec.dataset.group;
      const heading  = sec.querySelector('#group-series-header h2, h2');
      const name = nameAttr || (heading ? heading.textContent : '');
      sec.setAttribute('data-group-slug', slugify(name));
    });
  }

  // ---------------- init ----------------
  function init(userOpts = {}){
    opts = { ...opts, ...userOpts };

    els.sidebar   = document.getElementById('menu-lateral');
    els.scrim     = document.getElementById('menu-scrim');
    els.closeBtn  = document.getElementById('menu-close');
    els.groupsUl  = document.getElementById('menu-grupos');
    els.brandSlot = document.getElementById('sidebar-logo');
    els.trigger   = document.querySelector(opts.triggerSelector);
    els.main      = document.getElementById('main');
    if (!els.sidebar) return;

    if (!state.initialized){
      const src = (opts.seriesData && opts.seriesData.length ? opts.seriesData : (window.seriesData||[]));
      state.groups = [...new Set(
        (src||[]).filter(g=>g && g.group_name).map(g=>String(g.group_name).trim())
      )].sort((a,b)=>a.localeCompare(b));
      state.initialized = true;
    }

    cloneHeaderLogo();
    buildGroups();          // sem "Todas" (só Favoritos + grupos reais)
    bindNavigation();
    bindGroups();
    bindOpenClose();

    // estado inicial: Início ativo e tudo visível
    setActiveFonte('home');
    showAllInDOM();
  }

  // ---------------- header logo clone ----------------
  function cloneHeaderLogo(){
    if (!els.brandSlot) return;
    const src = document.getElementById('logo'); if (!src) return;
    const c = src.cloneNode(true); c.removeAttribute('id');
    c.style.width='28px'; c.style.height='28px';
    els.brandSlot.innerHTML=''; els.brandSlot.appendChild(c);
  }

  // ---------------- menu grupos ----------------
  function buildGroups(){
    if (!els.groupsUl) return;
    // Só "Favoritos" + grupos (removida a opção "Todas")
    const items = [{ slug:'__favs', label:'Favoritos' }]
      .concat(state.groups.map(g=>({ slug: slugify(g), label:g })));

    els.groupsUl.innerHTML = items.map(it =>
      `<li><a href="#" data-group="${esc(it.label)}" data-group-slug="${esc(it.slug)}">${esc(it.label)}</a></li>`
    ).join('');
  }

  // ---------------- marcação exclusiva ----------------
  function setActiveFonte(nav){ // 'home' | 'logs'
    // limpa grupos
    els.groupsUl?.querySelectorAll('a[data-group-slug]').forEach(a=>{
      disableAnchor(a, false);
    });
    // marca a fonte escolhida (e desabilita clique)
    els.sidebar.querySelectorAll('.menu-lista a[data-nav]').forEach(a=>{
      disableAnchor(a, a.dataset.nav === nav);
    });
  }

  function setActiveGroup(slug){ // '__favs' ou slug do grupo
    // limpa fontes
    els.sidebar.querySelectorAll('.menu-lista a[data-nav]').forEach(a=>{
      disableAnchor(a, false);
    });
    // marca somente o grupo escolhido (e desabilita clique nele)
    els.groupsUl?.querySelectorAll('a[data-group-slug]').forEach(a=>{
      disableAnchor(a, a.dataset.groupSlug === slug);
    });
  }

  // ---------------- navegação (Início/Histórico) ----------------
  function bindNavigation(){
    els.sidebar.querySelectorAll('.menu-lista a[data-nav]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const nav = a.dataset.nav;

        if (nav === 'home'){
          goHome();
          showAllInDOM();
          setActiveFonte('home');               // só Início ativo
        } else if (nav === 'logs'){
          goLogs();
          setActiveFonte('logs');               // só Histórico ativo
        }
        close();
      });
    });
  }

  // ---------------- clique nos grupos ----------------
  function bindGroups(){
    if (!els.groupsUl) return;
    els.groupsUl.addEventListener('click', (e)=>{
      const a = e.target.closest('a[data-group-slug]');
      if (!a) return;
      e.preventDefault();

      const slug = a.dataset.groupSlug;

      goHome(); // sempre vai pra Home
      if (opts.filterMode === 'dom'){
        if (slug === '__favs') {
          showFavoritesInDOM();
        } else {
          filterGroupInDOM(slug);
        }
      } else {
        window.dispatchEvent(new CustomEvent('filter:group', {
          detail: { favorites: slug === '__favs', groupSlug: slug }
        }));
      }

      setActiveGroup(slug);   // desmarca tudo e trava só o clicado
      close();
    });
  }

  // ---------------- filtros DOM ----------------
  function showAllInDOM(){
    const home = document.getElementById('group-home');
    const favs = document.getElementById('group-favorites');
    if (home) home.style.display = 'block';
    if (favs) favs.style.display = 'block';
    tagGroupSections();
    document.querySelectorAll('#group-home > section[data-group-slug], #group-home > #group-series[data-group-slug]')
      .forEach(sec => sec.style.display = '');
  }

  function showFavoritesInDOM(){
    const home = document.getElementById('group-home');
    const favs = document.getElementById('group-favorites');
    if (home) home.style.display = 'none';
    if (favs) favs.style.display = 'block';
  }

  function filterGroupInDOM(slug){
    const home = document.getElementById('group-home');
    const favs = document.getElementById('group-favorites');
    if (home) home.style.display = 'block';
    if (favs) favs.style.display = 'none';

    tagGroupSections();
    document.querySelectorAll('#group-home > section[data-group-slug], #group-home > #group-series[data-group-slug]')
      .forEach(sec => {
        const secSlug = sec.getAttribute('data-group-slug');
        sec.style.display = (secSlug === slug) ? '' : 'none';
      });
  }

  // ---------------- abrir/fechar ----------------
  function toggle(state){
    els.sidebar.classList.toggle('open', state);
    if (els.scrim) els.scrim.hidden = !state;
    document.documentElement.classList.toggle('no-scroll', state);
    document.body.classList.toggle('no-scroll', state);
    els.main?.classList.toggle('lock-scroll', state);
  }
  function open(){ toggle(true); }
  function close(){ toggle(false); }
  function bindOpenClose(){
    els.trigger?.addEventListener('click', (e)=>{
      const cb = els.trigger.querySelector('.inp'); if (cb) cb.checked = false;
      open(); e.stopPropagation();
    });
    els.scrim?.addEventListener('click', close);
    els.closeBtn?.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // ---------------- navegação real ----------------
  function goHome(){
    history.replaceState({ page:'home' }, '', location.pathname);
    window.dispatchEvent(new PopStateEvent('popstate', { state:{ page:'home' } }));
  }
  function goLogs(){
    history.pushState({ page:'logs' }, '', '#logs');
    window.dispatchEvent(new PopStateEvent('popstate', { state:{ page:'logs' } }));
  }

  return { init, open, close, setActiveFonte, setActiveGroup };
})();


function menuSide() {
  const menuTrigger = document.querySelector('label.menu');         // seu botão
  const menuCheckbox = menuTrigger?.querySelector('.inp');          // só p/ animar as barras
  const sidebar     = document.getElementById('menu-lateral');
  const scrim       = document.getElementById('menu-scrim');
  const closeBtn    = document.getElementById('menu-close');

  if (!menuTrigger || !sidebar || !scrim) return;

  const isOpen = () => sidebar.classList.contains('open');

  function openMenu() {
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    scrim.hidden = false;
    if (typeof lockPageScroll === 'function') lockPageScroll(true);
    if (menuCheckbox) menuCheckbox.checked = true; // anima o hambúrguer em "X"
  }

  function closeMenu() {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    scrim.hidden = true;
    if (typeof lockPageScroll === 'function') lockPageScroll(false);
    if (menuCheckbox) menuCheckbox.checked = false; // volta o hambúrguer
  }

  // clique no botão do header (impede o checkbox de abrir o antigo dropdown)
  menuTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  // fechar por scrim, botão X e Esc
  scrim.addEventListener('click', closeMenu);
  closeBtn?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) closeMenu();
  });

  // navegação "Início" / "Histórico" dentro do painel
  function toggleView(which){
    const home  = document.getElementById('home');
    const series= document.getElementById('series');
    const logs  = document.getElementById('logs-section');

    const show = (el, on) => { if(!el) return; el.classList.toggle('hidden', !on); el.classList.toggle('show', on); };

    show(home,  which === 'home');
    show(series,false);
    show(logs,  which === 'logs');

    // títulos do header
    const tSeries   = document.getElementById('series-title');
    const tName     = document.getElementById('series-name');
    const tLogs     = document.getElementById('series-logs');
    if (tSeries && tLogs && tName){
      if (which === 'home'){
        tSeries.classList.add('show');  tSeries.classList.remove('hidden');
        tLogs.classList.add('hidden');  tLogs.classList.remove('show');
        tName.classList.add('hidden');  tName.classList.remove('show');
      } else if (which === 'logs'){
        tLogs.classList.add('show');    tLogs.classList.remove('hidden');
        tSeries.classList.add('hidden');tSeries.classList.remove('show');
        tName.classList.add('hidden');  tName.classList.remove('show');
      }
    }
  }

  document.querySelectorAll('#menu-lateral [data-nav]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const dest = a.getAttribute('data-nav');
      if (dest === 'home') toggleView('home');
      if (dest === 'logs') toggleView('logs');
      closeMenu();
    });
  });
};

//=======================================================================
//CARREGAMENTO INICIAL + ATALHOS DO TECLADO
//=======================================================================
function loadingEffect() {
  const MIN_SHOW_MS = 400;

    const loader = document.getElementById('page-loader');
    if (!loader) return;

    // Bloqueia rolagem enquanto o loader está ativo (opcional)
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    const shownAt = Date.now();

    function hideLoader() {
      const elapsed = Date.now() - shownAt;
      const wait = Math.max(0, MIN_SHOW_MS - elapsed);

      setTimeout(() => {
        loader.classList.add('is-hiding'); // dispara o fade
        loader.addEventListener('transitionend', () => {
          loader.remove(); // remove do DOM após o fade
        }, { once: true });

        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
      }, wait);
    }

    // Quando tudo terminou de carregar (imagens, CSS, etc.)
    window.addEventListener('load', hideLoader);

    // Se a página veio do cache de navegação (bfcache), garanta que some também
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) hideLoader();
    });
};

document.addEventListener('DOMContentLoaded', function() {
    loadingEffect();
    requestTop();
    window.addEventListener('load', function() {
        requestTop();
    });

    MenuSidebar.init({ filterMode: 'dom', seriesData });

    searchInput = document.querySelector('#search .input');
    seasonExpandedState = {};
    renderCarousel();
    // updateFavorites();
    renderGroupsInlineSkeleton(null, 1200);
    dedupeLogsCache();

    document.querySelectorAll('#menu-lateral .menu-lista a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const nav = a.dataset.nav;

        if (nav === 'home') {
          history.replaceState({ page: 'home' }, '', location.pathname);
          window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'home' } }));
        } else if (nav === 'logs') {
          history.pushState({ page: 'logs' }, '', '#logs');
          window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'logs' } }));
        }
      });
    });

    document.getElementById('prev-video-button').addEventListener('click', function() {
        navigateDirection('prev');
    });
    
    document.getElementById('next-video-button').addEventListener('click', function() {
        navigateDirection('next');
    });

    document.getElementById('close-overlay-button').addEventListener('click', function() {
        const videoOverlay = document.getElementById('video-overlay');
        const videoIframe = document.getElementById('video-iframe');

        blockOverlayScrollEvents(videoOverlay, false);
        lockPageScroll(false);
        
        videoOverlay.classList.replace('show', 'hidden');
        videoIframe.src = '';
        document.getElementById('overlay-season-dropdown')?.remove();
        document.getElementById('overlay-episodes-dropdown')?.remove();

        const logsSection = document.getElementById('logs-section');
        if (logsSection) {
            logsSection.classList.replace('show', 'hidden');
        }

        requestAnimationFrame(() => {
          window.scrollTo(0, savedScrollPosition);
          document.documentElement.scrollTop = savedScrollPosition;
          document.body.scrollTop = savedScrollPosition;
          const main = document.getElementById('main');
          if (main) {
              main.scrollTop = savedScrollPosition;
              if (typeof main.scrollTo === 'function') main.scrollTo(0, savedScrollPosition);
          }
      });

        if (currentSerie) {
            const serieSlug = currentSerie.name.trim().replace(/\s+/g, '-');
            window.history.replaceState(
                { page: 'series', serieName: currentSerie.name, seasonIndex: currentSeasonIndex },
                currentSerie.name,
                `#${serieSlug}`
            );
            // Re-renderizar mantendo currentSeasonDropdownValue e seasonExpandedState
            renderCurrentSeries(currentSerie, currentSeasonDropdownValue);
        } else {
            window.history.replaceState({ page: 'home' }, '', window.location.pathname);
        }

        window.dispatchEvent(new PopStateEvent('popstate', { 
            state: currentSerie 
                ? { page: 'series', serieName: currentSerie.name, seasonIndex: currentSeasonIndex } 
                : { page: 'home' }
        }));
    });

    document.getElementById('back-button').addEventListener('click', () => {
      requestTop();

      // volta SEM hash
      history.replaceState({ page: 'home' }, '', location.pathname);
      window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'home' } }));

      // sincroniza o menu após a troca de tela
      requestAnimationFrame(() => {
        if (window.MenuSidebar?.setActiveFonte) {
          MenuSidebar.setActiveFonte('home');  // marca Início
          MenuSidebar.setActiveGroup(null);    // limpa qualquer grupo ativo
        } else {
          // fallback se não tiver o módulo
          const sidebar = document.getElementById('menu-lateral');
          sidebar?.querySelectorAll('.menu-lista a[data-nav]').forEach(a => {
            const active = a.dataset.nav === 'home';
            a.classList.toggle('active', active);
            a.style.pointerEvents = active ? 'none' : '';
          });
          sidebar?.querySelectorAll('#menu-grupos a').forEach(a => {
            a.classList.remove('active');
            a.style.pointerEvents = '';
          });
        }
      });
    });

    document.addEventListener('click', function(e) {
        const seasonHeader = e.target.closest('.season-header');
        const logsHeader = e.target.closest('.logs-header');
        const toggleButton = e.target.closest('.toggle-button-cards');
        
        if (seasonHeader || logsHeader || toggleButton) {
            const targetElement = seasonHeader || logsHeader || toggleButton;
            const indexAttr = seasonHeader ? 'data-season-index' : 'data-log-index';
            const index = targetElement.getAttribute(indexAttr);
            const button = targetElement.querySelector('.toggle-button-cards') || toggleButton;
            const isExpanded = button.classList.contains('expanded');

            const newExpanded = !isExpanded;
            button.classList.toggle('expanded', newExpanded);

            const listSelector = seasonHeader ? `.episode-list[data-season-index="${index}"]` : `.log-list[data-log-index="${index}"]`;
            const list = document.querySelector(listSelector);
            if (list) {
                list.classList.remove('horizontal-layout', 'vertical-layout');
                list.classList.add(newExpanded ? 'vertical-layout' : 'horizontal-layout');
                // Ajustar display com base no tipo de cabeçalho
                list.style.display = newExpanded ? (seasonHeader ? 'flex' : 'block') : 'none';
                seasonExpandedState[index] = newExpanded;
            }
        }
    });

    searchInput.addEventListener('input', filterSeries);

    const buttons = document.querySelectorAll('#keys button');
    buttons.forEach((button, index) => {
        const delay = animationSpeedSearchsKeys / 100;
        button.style.animationDelay = `${index * delay}s`;
        button.classList.add('slide-in-right');
        button.style.animationFillMode = 'backwards';
    });
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('checked')) {
                this.classList.add('shake', 'shake-left');
                setTimeout(() => {
                    this.classList.remove('shake-left');
                    this.classList.add('shake-right');
                }, 100);
                setTimeout(() => {
                    this.classList.remove('shake-right', 'shake');
                }, 200);
                return;
            }

            const isFavoritesButton = this.innerText === '☆' || this.innerText === '★';
            const favoritesButton = document.querySelector('#keys button:nth-child(2)');
    
            buttons.forEach(btn => btn.classList.remove('checked'));
            this.classList.add('checked');
    
            if (isFavoritesButton) {
                this.innerText = this.innerText === '☆' ? '★' : '☆';
            } else {
                if (favoritesButton && favoritesButton.innerText === '★') {
                    favoritesButton.innerText = '☆';
                }
            }
    
            filterSeries();
        });
    });

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    window.addEventListener('popstate', function(event) {
        const state = event.state || { page: 'home' };
        const home = document.getElementById('home');
        const series = document.getElementById('series');
        const title = document.getElementById('series-title');
        const name = document.getElementById('series-name');
        const namelog = document.getElementById('series-logs');
        const logo = document.getElementById('logo');
        const backBtn = document.getElementById('back-button');
        const logsSection = document.getElementById('logs-section');
        const videoOverlay = document.getElementById('video-overlay');

        if (videoOverlay.classList.contains('show')) {
            videoOverlay.classList.replace('show', 'hidden');
            document.getElementById('video-iframe').src = '';
            document.getElementById('overlay-season-dropdown')?.remove();
            document.getElementById('overlay-episodes-dropdown')?.remove();
        }

        if (state.page === 'home') {
            home.classList.replace('hidden', 'show');
            series.classList.replace('show', 'hidden');
            title.classList.replace('hidden', 'show');
            logo.classList.replace('hidden', 'show');
            name.classList.replace('show', 'hidden');
            namelog.classList.replace('show', 'hidden');
            backBtn.classList.replace('show', 'hidden');
            logsSection.classList.replace('show', 'hidden');
        } else if (state.page === 'series') {
            const serieName = state.serieName;
            const serie = seriesData.flatMap(g => g.group).find(s => s.name === serieName);
            if (!serie) {
                window.history.replaceState({ page: 'home' }, '', window.location.pathname);
                window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'home' } }));
                return;
            }
            home.classList.replace('show', 'hidden');
            series.classList.replace('hidden', 'show');
            title.classList.replace('show', 'hidden');
            logo.classList.replace('show', 'hidden');
            name.classList.replace('hidden', 'show');
            namelog.classList.replace('show', 'hidden');
            backBtn.classList.replace('hidden', 'show');
            logsSection.classList.replace('show', 'hidden');
            renderCurrentSeries(serie);
        } else if (state.page === 'logs') {
            createLogsSection();
            home.classList.replace('show', 'hidden');
            series.classList.replace('show', 'hidden');
            title.classList.replace('show', 'hidden');
            name.classList.replace('show', 'hidden');
            logo.classList.replace('show', 'hidden');
            namelog.classList.replace('hidden', 'show');
            backBtn.classList.replace('hidden', 'show');
            logsSection.classList.replace('hidden', 'show');
        }
    });

    window.addEventListener('scroll', () => {
      const header = document.querySelector('header');
      if (document.getElementById('video-overlay')?.classList.contains('show')) return;
      header.classList.toggle('scrolled', window.scrollY > 50);
    });

    window.addEventListener('keydown', (event) => {
    const videoOverlay = document.querySelector('#video-overlay');
    const seriesContainer = document.querySelector('#series');

    switch (event.key) {
        case 'Escape':
            if (videoOverlay.classList.contains('show')) {
                document.querySelector('#close-overlay-button').click();
            } else {
                document.querySelector('#back-button').click();
            }
        break;
        case 'ArrowLeft':
            navigateDirection('prev');
        break;
        case 'ArrowRight':
            navigateDirection('next');
        break;  
    }
    });
    
    const defaultButton = document.querySelector('#keys button:first-child');
    defaultButton.classList.add('checked');
    defaultButton.click();

    
});