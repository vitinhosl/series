const seriesData = [
    {
        group_name: "SÉRIES BIBLÍCAS",
        group: [
            {
                name: "A TERRA PROMETIDA",
                thumb_page: "https://i.imgur.com/zXnAXED.png",
                thumb_buttons: ["https://i.imgur.com/qvvefLV.png"],
                badge: "",
                enabled: true,
                season: [
                    {
                        name: "",
                        thumb_season: "https://i.imgur.com/NbtbzDU.jpeg",
                        movies: false,
                        episodes: [
                            { title: "001", thumb: "", url: "https://ok.ru/videoembed/3999010458199", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-001.mp4"] },
                            { title: "002", thumb: "", url: "https://ok.ru/videoembed/4002059586135", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-002.mp4"] },
                            { title: "003", thumb: "", url: "https://ok.ru/videoembed/4002103364183", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-003.mp4"] },
                            { title: "004", thumb: "", url: "https://ok.ru/videoembed/4002428291671", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-004.mp4"] },
                            { title: "005", thumb: "", url: "https://ok.ru/videoembed/4005645257303", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-005.mp4"] },
                            { title: "006", thumb: "", url: "https://ok.ru/videoembed/4005870111319", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-006.mp4"] },
                            { title: "007", thumb: "", url: "https://ok.ru/videoembed/4010298575447", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-007.mp4"] },
                            { title: "008", thumb: "", url: "https://ok.ru/videoembed/4010324462167", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-008.mp4"] },
                            { title: "009", thumb: "", url: "https://ok.ru/videoembed/4010347989591", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-009.mp4"] },
                            { title: "010", thumb: "", url: "https://ok.ru/videoembed/4010407037527", alternative: ["https://cdn-novflix.com/storage7/ATP/ATP-010.mp4"] },
                        ]
                    },
                ],
            },

            {
                name: "JEZABEL",
                thumb_page: "https://i.imgur.com/fjZzqlg.pn",
                thumb_buttons: ["https://i.imgur.com/Z3WUXd9.jpeg"],
                badge: "",
                enabled: true,
                season: [
                    {
                        name: "",
                        thumb_season: "https://i.imgur.com/FWhYOfF.jpeg",
                        movies: false,
                        episodes: [
                            { title: "001", thumb: "", url: "https://ok.ru/videoembed/1396816284247", alternative: ["https://cdn-novflix.com/storage7/JEZA/JEZA-001.mp4"] },
                            { title: "002", thumb: "", url: "https://ok.ru/videoembed/1395261246039", alternative: ["https://cdn-novflix.com/storage7/JEZA/JEZA-002.mp4"] },
                            { title: "003", thumb: "", url: "https://ok.ru/videoembed/1395991382615", alternative: ["https://cdn-novflix.com/storage7/JEZA/JEZA-003.mp4"] },
                            { title: "004", thumb: "", url: "https://ok.ru/videoembed/1400989289047", alternative: ["https://cdn-novflix.com/storage7/JEZA/JEZA-004.mp4"] },
                            { title: "005", thumb: "", url: "https://ok.ru/videoembed/1400989289047", alternative: ["https://cdn-novflix.com/storage7/JEZA/JEZA-005.mp4"] },
                            { title: "006", thumb: "", url: "https://ok.ru/videoembed/1405562128983", alternative: ["https://cdn-novflix.com/storage7/JEZA/JEZA-006.mp4"] },

                        ]
                    },
                ],
                
            },

             //O APÓSTOLO PAULO
            {
                name: "O APÓSTOLO PAULO",
                thumb_page: "",
                thumb_buttons: ["https://image.tmdb.org/t/p/w600_and_h900_bestv2/nlzyqHl1qBQxIwVi4pLUOAoAwhp.jpg", "https://pp-vod-img-aws.akamaized.net/0256021/0256021_200.jpg"],
                badge: "EM BREVE",
                enabled: false,
                title: "INDISPONÍVEL",

                season: [
                    {
                        name: "",
                        thumb_season: "https://upload.wikimedia.org/wikipedia/pt/e/ed/Lia_miniss%C3%A9rie.jpeg",
                        movies: false,
                        episodes: [
                            // { title: "", thumb: "", url: "", alternative: [""] },
                        ]
                    }
                ]
            },
        ]
    },
];

// localStorage.clear();

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let continues = JSON.parse(localStorage.getItem('continues')) || {};
let currentEpisodeIndex = 0;
let currentSeasonIndex = 0;
let currentSerie = null;

//SERIE ATUAL
function renderCurrentSeries(serie) {
    const seriesContainer = document.getElementById('series');
    const seriesNameContainer = document.getElementById('series-name');

    seriesContainer.innerHTML = '';
    seriesNameContainer.innerHTML = '';

    seriesNameContainer.innerHTML = `<h1>${serie.name}</h1>`;
    if (serie.season.length === 0 && (!serie.movies || serie.movies.length === 0)) {
        seriesContainer.innerHTML = `
        <div id="current-series">
            <div id="current-series-header">
                <p>Nenhum episódio ou filme disponível.</p>
            </div>
        </div>
        `;
        return;
    }

    currentSerie = serie;
    currentSeasonIndex = 0;

    // Restaura o currentEpisodeIndex com base no progresso salvo
    const serieKey = serie.name.replace(/\s+/g, '_');
    const seasonKey = serie.season[currentSeasonIndex].name || `Temporada_${currentSeasonIndex + 1}`;
    const seasonProgress = continues[serieKey] && continues[serieKey][seasonKey];
    if (seasonProgress && seasonProgress.episodeIndex !== undefined) {
        currentEpisodeIndex = seasonProgress.episodeIndex;
    } else {
        currentEpisodeIndex = 0;
    }

    const hasSeasons = serie.season.length > 0;
    const showDropdown = hasSeasons && (serie.season.length > 1);

    // Ajuste no texto do available-text para incluir o número da temporada
    let availableText = serie.season[0].movies ? 'Filmes disponíveis' : 'Episódios disponíveis';
    if (showDropdown) {
        availableText = `T${currentSeasonIndex + 1} - ${availableText}`;
    }
    availableText += `: ${serie.season[0].episodes.length}`;

    const currentSeriesHTML = `
        <div id="current-series">
            <div id="current-series-header">
                <p id="available-text">${availableText}</p>
                ${showDropdown ? `
                    <select id="season-dropdown">
                        ${hasSeasons ? serie.season.map((season, index) => `
                            ${serie.season[index].name ? `
                                <option value="season-${index}">${serie.season[index].name}</option>` 
                            : `
                                <option value="season-${index}">Temporada ${index + 1}</option>`
                            }
                        `).join('') : ''}
                    </select>
                ` : ''}
            </div>
            <div id="current-series-episodes">
                ${renderEpisodes(serie.season[0])}
            </div>
        </div>
    `;

    seriesContainer.innerHTML = currentSeriesHTML;

    renderContinueWatchingSection();

    if (showDropdown) {
        const seasonDropdown = document.getElementById('season-dropdown');
        seasonDropdown.addEventListener('change', function() {
            currentSeasonIndex = parseInt(this.value.split('-')[1], 10);
            const selectedSeason = serie.season[currentSeasonIndex];

            // Atualiza o currentEpisodeIndex com base no progresso salvo da temporada selecionada
            const seasonKey = selectedSeason.name || `Temporada_${currentSeasonIndex + 1}`;
            const seasonProgress = continues[serieKey] && continues[serieKey][seasonKey];
            if (seasonProgress && seasonProgress.episodeIndex !== undefined) {
                currentEpisodeIndex = seasonProgress.episodeIndex;
            } else {
                currentEpisodeIndex = 0;
            }

            // Ajuste no texto do available-text ao mudar de temporada
            let updatedAvailableText = selectedSeason.movies ? 'Filmes disponíveis' : 'Episódios disponíveis';
            updatedAvailableText = `T${currentSeasonIndex + 1} - ${updatedAvailableText}`;
            updatedAvailableText += `: ${selectedSeason.episodes.length}`;
            document.getElementById('available-text').innerText = updatedAvailableText;

            document.getElementById('current-series-episodes').innerHTML = renderEpisodes(selectedSeason);

            addEpisodeButtonListeners();
            updateButtonVisibility();
            renderContinueWatchingSection();

            // Aplica .active ao episódio salvo da temporada selecionada
            const episodeButtons = document.querySelectorAll('#episode-button');
            if (seasonProgress && seasonProgress.activeEpisodeIndex !== undefined) {
                if (episodeButtons[seasonProgress.activeEpisodeIndex]) {
                    episodeButtons[seasonProgress.activeEpisodeIndex].classList.add('active');
                }
            } else if (episodeButtons[currentEpisodeIndex]) {
                episodeButtons[currentEpisodeIndex].classList.add('active');
            }
        });
    }

    addEpisodeButtonListeners();
    updateButtonVisibility();

    // Aplica .active ao episódio salvo da temporada inicial
    const episodeButtons = document.querySelectorAll('#episode-button');
    if (seasonProgress && seasonProgress.activeEpisodeIndex !== undefined) {
        if (episodeButtons[seasonProgress.activeEpisodeIndex]) {
            episodeButtons[seasonProgress.activeEpisodeIndex].classList.add('active');
        }
    } else if (episodeButtons[currentEpisodeIndex]) {
        episodeButtons[currentEpisodeIndex].classList.add('active');
    }
}

function renderEpisodes(season) {
    const episodesHTML = season.episodes.map((episode, index) => `
        <div id="episode-button" data-url="${episode.url}" data-alternative='${JSON.stringify(episode.alternative || [])}'
            style="background-image: url('${episode.thumb ? episode.thumb : season.thumb_season}');">
            ${!episode.title ? `
                <p>Episódio ${index + 1}</p>` 
            : /^\d{1,3}$/.test(episode.title.trim()) ? `
                <p>Episódio ${parseInt(episode.title, 10)}</p>` 
            : `
                <p>${episode.title}</p>`
            }
        </div>
    `).join('');

    return episodesHTML;
}

function addEpisodeButtonListeners() {
    document.querySelectorAll('#episode-button').forEach((button, index) => {
        button.addEventListener('click', function() {
            document.querySelectorAll('#episode-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            currentEpisodeIndex = index;

            // Verifica se há progresso salvo para esta série e temporada
            const serieKey = currentSerie.name.replace(/\s+/g, '_');
            const seasonKey = currentSerie.season[currentSeasonIndex].name || `Temporada_${currentSeasonIndex + 1}`;
            const seasonProgress = continues[serieKey] && continues[serieKey][seasonKey];

            // Se houver progresso salvo e for o mesmo episódio clicado, usa o índice salvo
            if (seasonProgress && seasonProgress.episodeIndex === index) {
                currentEpisodeIndex = seasonProgress.episodeIndex;
            }

            openVideoOverlay(this.getAttribute('data-url'));
            renderToggleButtons(this);
            updateButtonVisibility();

            const serieName = currentSerie.name;
            const seasonName = currentSerie.season[currentSeasonIndex].name;
            const episodeTitle = currentSerie.season[currentSeasonIndex].episodes[currentEpisodeIndex].title;

            const progress = {
                serieName: serieName,
                seasonName: seasonName,
                episodeTitle: episodeTitle,
                episodeIndex: currentEpisodeIndex,
                seasonIndex: currentSeasonIndex,
                thumb: currentSerie.season[currentSeasonIndex].episodes[currentEpisodeIndex].thumb || currentSerie.season[currentSeasonIndex].thumb_season,
                url: currentSerie.season[currentSeasonIndex].episodes[currentEpisodeIndex].url,
                movies: currentSerie.season[currentSeasonIndex].movies,
                activeEpisodeIndex: index
            };

            saveContinueProgress(progress);
            renderContinueWatchingSection();
        });
    });
}

function renderContinueWatchingSection() {
    const seriesContainer = document.getElementById('current-series');
    let continueSeriesElement = document.getElementById('continue-series');

    if (!continueSeriesElement) {
        continueSeriesElement = document.createElement('div');
        continueSeriesElement.id = 'continue-series';
        seriesContainer.insertBefore(continueSeriesElement, seriesContainer.firstChild);
    }

    const serieKey = currentSerie.name.replace(/\s+/g, '_');
    const savedProgress = continues[serieKey] || {};

    let episodesHTML = '';
    Object.keys(savedProgress).forEach(seasonKey => {
        const seasonProgress = savedProgress[seasonKey];
        let episodeText = '';

        if (seasonProgress.movies) {
            episodeText = `Filme: ${seasonProgress.episodeTitle}`;
        } else {
            const seasonNumber = seasonProgress.seasonIndex + 1;
            episodeText = `T${seasonNumber} - Episódio ${seasonProgress.episodeTitle}`;
        }

        episodesHTML += `
            <div id="continue-episode-button" 
                 style="background-image: url('${seasonProgress.thumb}');" 
                 data-season-index="${seasonProgress.seasonIndex}" 
                 data-episode-index="${seasonProgress.episodeIndex}" 
                 onclick="openVideoOverlay('${seasonProgress.url}', ${seasonProgress.seasonIndex}, ${seasonProgress.episodeIndex})">
                <p>${episodeText}</p>
                <div class="remove-button" onclick="event.stopPropagation(); removeContinueSeriesSeason('${seasonKey}')">✕</div>
            </div>
        `;
    });

    if (!episodesHTML) {
        continueSeriesElement.remove();
        return;
    }

    continueSeriesElement.innerHTML = `
        <div id="continue-series-header">
            <p id="available-text">Continuar assistindo</p>
        </div>
        <div id="continue-series-episodes">
            ${episodesHTML}
        </div>
    `;
}

function openVideoOverlay(videoUrl, seasonIndex = currentSeasonIndex, episodeIndex = currentEpisodeIndex) {
    const videoOverlay = document.getElementById('video-overlay');
    const videoIframe = document.getElementById('video-iframe');
    const videoOverlayDropdown = document.getElementById('video-overlay-dropdown');

    // Verifica o localStorage para a temporada inicial
    const serieKey = currentSerie.name.replace(/\s+/g, '_');
    const seasonKey = `continue_${serieKey}_season_${seasonIndex}`;
    const savedProgress = JSON.parse(localStorage.getItem(seasonKey));
    let initialEpisodeIndex = episodeIndex;

    if (savedProgress && savedProgress.episodeIndex !== undefined) {
        initialEpisodeIndex = savedProgress.episodeIndex; // Usa o episódio salvo, se existir
    }

    const initialSeason = currentSerie.season[seasonIndex];
    const initialItem = initialSeason.episodes[initialEpisodeIndex];
    videoIframe.src = initialItem.url; // Carrega o vídeo inicial com base no progresso salvo
    videoOverlay.classList.remove('hidden');
    videoOverlay.classList.add('show');

    let overlaySeasonDropdown = document.getElementById('overlay-season-dropdown');
    let overlayEpisodesDropdown = document.getElementById('overlay-episodes-dropdown');

    // Cria os dropdowns apenas se ainda não existirem
    if (!overlaySeasonDropdown || !overlayEpisodesDropdown) {
        overlaySeasonDropdown = document.createElement('select');
        overlaySeasonDropdown.id = 'overlay-season-dropdown';

        overlayEpisodesDropdown = document.createElement('select');
        overlayEpisodesDropdown.id = 'overlay-episodes-dropdown';

        if (currentSerie && currentSerie.season.length > 1) {
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

            overlaySeasonDropdown.addEventListener('change', function() {
                const newSeasonIndex = parseInt(this.value, 10);
                const serieKey = currentSerie.name.replace(/\s+/g, '_');
                // Usa o nome da temporada salvo ou cria um nome padrão
                const seasonKey = currentSerie.season[newSeasonIndex].name || `Temporada_${newSeasonIndex + 1}`;
                // Busca o progresso salvo usando o objeto continues
                const newSavedProgress = continues[serieKey] && continues[serieKey][seasonKey];
                
                if (newSavedProgress && newSavedProgress.episodeIndex !== undefined) {
                    currentEpisodeIndex = newSavedProgress.episodeIndex; // Usa o episódio salvo
                } else {
                    currentEpisodeIndex = 0; // Se não houver progresso, inicia no primeiro episódio
                }

                // Atualiza o dropdown de episódios com o episódio salvo
                updateEpisodesDropdown(newSeasonIndex, overlayEpisodesDropdown);
                overlayEpisodesDropdown.value = currentEpisodeIndex;
                
                const selectedSeason = currentSerie.season[newSeasonIndex];
                const selectedItem = selectedSeason.episodes[currentEpisodeIndex];
                videoIframe.src = selectedItem.url;

                // Só atualiza .active se a temporada no overlay for a mesma do #season-dropdown
                if (newSeasonIndex === currentSeasonIndex) {
                    document.querySelectorAll('#episode-button').forEach(btn => {
                        btn.classList.remove('active');
                    });

                    const currentEpisodeButton = document.querySelector(`#episode-button[data-url="${selectedItem.url}"]`);
                    if (currentEpisodeButton) {
                        currentEpisodeButton.classList.add('active');
                    }

                    renderToggleButtons(currentEpisodeButton || document.createElement('div'));
                    updateButtonVisibility();
                }

                const progress = {
                    serieName: currentSerie.name,
                    seasonName: selectedSeason.name,
                    episodeTitle: selectedItem.title,
                    episodeIndex: currentEpisodeIndex,
                    seasonIndex: newSeasonIndex,
                    thumb: selectedItem.thumb || selectedSeason.thumb_season,
                    url: selectedItem.url,
                    movies: selectedSeason.movies,
                    activeEpisodeIndex: currentEpisodeIndex
                };

                saveContinueProgress(progress);
                renderContinueWatchingSection();
            });

            overlayEpisodesDropdown.addEventListener('change', function() {
                currentEpisodeIndex = parseInt(this.value, 10);
                const currentOverlaySeasonIndex = parseInt(overlaySeasonDropdown.value, 10);
                const selectedSeason = currentSerie.season[currentOverlaySeasonIndex];
                const selectedItem = selectedSeason.episodes[currentEpisodeIndex];

                videoIframe.src = selectedItem.url;
                overlayEpisodesDropdown.value = currentEpisodeIndex;

                // Só atualiza .active se a temporada no overlay for a mesma do #season-dropdown
                if (currentOverlaySeasonIndex === currentSeasonIndex) {
                    document.querySelectorAll('#episode-button').forEach(btn => {
                        btn.classList.remove('active');
                    });

                    const currentEpisodeButton = document.querySelector(`#episode-button[data-url="${selectedItem.url}"]`);
                    if (currentEpisodeButton) {
                        currentEpisodeButton.classList.add('active');
                    }

                    renderToggleButtons(currentEpisodeButton || document.createElement('div'));
                    updateButtonVisibility();
                }

                const progress = {
                    serieName: currentSerie.name,
                    seasonName: selectedSeason.name,
                    episodeTitle: selectedItem.title,
                    episodeIndex: currentEpisodeIndex,
                    seasonIndex: currentOverlaySeasonIndex,
                    thumb: selectedItem.thumb || selectedSeason.thumb_season,
                    url: selectedItem.url,
                    movies: selectedSeason.movies,
                    activeEpisodeIndex: currentEpisodeIndex
                };

                saveContinueProgress(progress);
                renderContinueWatchingSection();
            });
        }
    } else {
        // Se os dropdowns já existem, apenas atualiza os valores iniciais
        overlaySeasonDropdown.value = seasonIndex;
        updateEpisodesDropdown(seasonIndex, overlayEpisodesDropdown);
        // Não redefine overlayEpisodesDropdown.value aqui, deixa o evento change controlar
    }
}

function updateEpisodesDropdown(seasonIndex, episodesDropdown) {
    episodesDropdown.innerHTML = '';

    const selectedSeason = currentSerie.season[seasonIndex];
    selectedSeason.episodes.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.title || `Episódio ${index + 1}`;
        episodesDropdown.appendChild(option);
    });

    // Define o valor do dropdown com base no currentEpisodeIndex
    episodesDropdown.value = currentEpisodeIndex;
}

function renderToggleButtons(button) {
    const toggleButtonsContainer = document.getElementById('toggle-buttons-container');
    toggleButtonsContainer.innerHTML = '';

    let mainUrl = button.getAttribute('data-url');
    let alternatives = JSON.parse(button.getAttribute('data-alternative'));

    // Se o mainUrl estiver vazio e houver alternativas, usa a primeira alternativa como principal
    if ((!mainUrl || mainUrl.trim() === "") && alternatives.length > 0) {
        mainUrl = alternatives.shift();
    }

    // Função para atualizar o botão ativo e o overlay
    const updateActiveButton = (activeUrl) => {
        document.querySelectorAll('.toggle-button').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-url') === activeUrl);
        });
        const videoIframe = document.getElementById('video-iframe');
        videoIframe.src = activeUrl; // Atualiza o overlay com o URL ativo
    };

    // Botão principal
    let mainButton = null;
    if (mainUrl) {
        mainButton = document.createElement('button');
        mainButton.innerText = 'PRINCIPAL';
        mainButton.classList.add('toggle-button', 'active');
        mainButton.setAttribute('data-url', mainUrl);
        mainButton.addEventListener('click', () => {
            updateActiveButton(mainUrl);
        });
        toggleButtonsContainer.appendChild(mainButton);
    }

    // Botões alternativos
    alternatives.forEach((altUrl, index) => {
        const altButton = document.createElement('button');
        altButton.innerText = `OPÇÃO ${index + 2}`;
        altButton.setAttribute('data-url', altUrl);
        altButton.classList.add('toggle-button');
        altButton.addEventListener('click', () => {
            updateActiveButton(altUrl);
        });
        toggleButtonsContainer.appendChild(altButton);
    });

    // Se houver apenas o botão principal sem alternativas, oculta-o
    if (mainButton && alternatives.length === 0) {
        mainButton.style.display = 'none';
    }

    // Inicializa o overlay com o URL principal (ou o primeiro disponível)
    const initialUrl = mainUrl || (alternatives.length > 0 ? alternatives[0] : '');
    if (initialUrl) {
        updateActiveButton(initialUrl);
    }
}

function navigateDirection(direction) {
    const currentSeason = currentSerie.season[currentSeasonIndex];
    const totalItems = currentSeason.episodes.length;

    // Antes de navegar, verifica o progresso salvo para garantir que currentEpisodeIndex está correto
    const serieKey = currentSerie.name.replace(/\s+/g, '_');
    const seasonKey = currentSerie.season[currentSeasonIndex].name || `Temporada_${currentSeasonIndex + 1}`;
    const seasonProgress = continues[serieKey] && continues[serieKey][seasonKey];
    if (seasonProgress && seasonProgress.episodeIndex !== undefined) {
        currentEpisodeIndex = seasonProgress.episodeIndex; // Restaura o índice salvo
    }

    if (direction === 'prev' && currentEpisodeIndex > 0) {
        currentEpisodeIndex--;
    } else if (direction === 'next' && currentEpisodeIndex < totalItems - 1) {
        currentEpisodeIndex++;
    } else {
        return;
    }

    const episodesDropdown = document.getElementById('overlay-episodes-dropdown');
    if (episodesDropdown) {
        episodesDropdown.value = currentEpisodeIndex;
    }

    const episode = currentSeason.episodes[currentEpisodeIndex];
    openVideoOverlay(episode.url);

    const serieName = currentSerie.name;
    const seasonName = currentSerie.season[currentSeasonIndex].name;
    const episodeTitle = episode.title;

    const progress = {
        serieName,
        seasonName,
        episodeTitle,
        episodeIndex: currentEpisodeIndex,
        seasonIndex: currentSeasonIndex,
        thumb: episode.thumb || currentSerie.season[currentSeasonIndex].thumb_season,
        url: episode.url,
        movies: currentSeason.movies,
        activeEpisodeIndex: currentEpisodeIndex
    };

    saveContinueProgress(progress);
    renderContinueWatchingSection();

    document.querySelectorAll('#episode-button').forEach(btn => {
        btn.classList.remove('active');
    });

    const currentEpisodeButton = document.querySelector(`#episode-button[data-url="${episode.url}"]`);
    if (currentEpisodeButton) {
        currentEpisodeButton.classList.add('active');
    }

    renderToggleButtons(currentEpisodeButton || document.querySelector(`#episode-button[data-url="${episode.url}"]`));
    updateButtonVisibility();
}

function updateButtonVisibility() {
    const prevButton = document.getElementById('prev-video-button');
    const nextButton = document.getElementById('next-video-button');
    const currentSeason = currentSerie.season[currentSeasonIndex];
    const totalItems = currentSeason.episodes.length;

    prevButton.style.display = currentEpisodeIndex === 0 ? 'none' : 'block';
    nextButton.style.display = currentEpisodeIndex === totalItems - 1 ? 'none' : 'block';
}

function saveContinueProgress(progress) {
    let currentContinues = JSON.parse(localStorage.getItem('continues')) || {};
    const serieKey = progress.serieName.replace(/\s+/g, '_');
    const seasonKey = progress.seasonName || `Temporada_${progress.seasonIndex + 1}`;

    if (!currentContinues[serieKey]) {
        currentContinues[serieKey] = {};
    }

    currentContinues[serieKey][seasonKey] = {
        serieName: progress.serieName,
        seasonName: progress.seasonName,
        episodeTitle: progress.episodeTitle,
        episodeIndex: progress.episodeIndex,
        seasonIndex: progress.seasonIndex,
        thumb: progress.thumb,
        url: progress.url,
        movies: progress.movies,
        activeEpisodeIndex: progress.activeEpisodeIndex
    };

    continues = currentContinues; // Atualiza a variável global
    localStorage.setItem('continues', JSON.stringify(continues));
    console.log('Progresso salvo:', continues); // Para depuração
}

function removeContinueSeriesSeason(seasonKey) {
    if (currentSerie) {
        const serieKey = currentSerie.name.replace(/\s+/g, '_');
        if (continues[serieKey] && continues[serieKey][seasonKey]) {
            delete continues[serieKey][seasonKey];
            if (Object.keys(continues[serieKey]).length === 0) {
                delete continues[serieKey];
            }
            localStorage.setItem('continues', JSON.stringify(continues));
            renderContinueWatchingSection(); // Re-renderiza a seção após a remoção
        }
    }
}

//INICIO
function renderSeriesButtons() {
    const groupHome = document.getElementById('group-home');
    groupHome.innerHTML = '';

    seriesData.forEach(group => {
        const groupSeriesHTML = `
        <div id="group-series">
            <div id="group-series-header">
                <h2>${group.group_name}</h2>
            </div>
            <div id="group-series-cards">
                ${group.group.map(serie => {
                    const isFavorite = favorites.some(fav => fav.name === serie.name);
                    const disabledClass = serie.enabled ? '' : 'disabled';
                    const backgroundStyle = `--bg-image: url(${serie.thumb_buttons});`;
                    return `
                    <div id="group-series-button" class="${disabledClass}" style="${backgroundStyle}">
                        ${serie.badge ? `
                            <span class="badge">${serie.badge}</span>
                        ` : ''}
                        <div class="info">
                            <h1>${serie.name}</h1>
                            ${serie.enabled ? (
                                serie.season.length > 0 ? `
                                    ${serie.season.some(season => season.movies) ? `
                                        <p>Filmes: ${serie.season.filter(season => season.movies).reduce((total, season) => total + season.episodes.length, 0)}</p>
                                        <p>Temporadas: ${serie.season.filter(season => !season.movies).length}</p>
                                    ` : `
                                        <p>Temporadas: ${serie.season.length}</p>
                                    `}
                                    <p>Episódios disponíveis: ${serie.season.filter(season => !season.movies).reduce((total, season) => total + season.episodes.length, 0)}</p>
                                ` : `
                                    <p>Nenhum conteúdo disponível</p>
                                `
                            ) : ``}
                            ${serie.enabled ? `
                                <button class="watch-button">ASSISTIR</button>
                            ` : `
                                <button class="watch-button">${serie.title || 'EM BREVE'}</button>
                            `}
                        </div>
                        <button class="favorite-button ${isFavorite ? 'active' : ''}" data-serie='${JSON.stringify(serie)}'>
                            ${isFavorite ? '★' : '☆'}
                            <span class="tooltip-text black tooltip-top">${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</span>
                        </button>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>`;
        groupHome.innerHTML += groupSeriesHTML;
    });

    document.querySelectorAll('.favorite-button').forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const serie = JSON.parse(this.getAttribute('data-serie'));
            const isFavorite = this.classList.contains('active');

            if (isFavorite) {
                removeFavorite(serie);
            } else {
                saveFavorite(serie);
            }

            this.classList.toggle('active');
            this.innerHTML = this.classList.contains('active') ? '★ <span class="tooltip-text black tooltip-top">Remover dos favoritos</span>' : '☆ <span class="tooltip-text black tooltip-top">Adicionar aos favoritos</span>';
            updateFavorites();
        });
    });

    document.querySelectorAll('#group-series-button').forEach(button => {
        button.addEventListener('click', function() {
            const serieName = this.querySelector('h1').innerText;
            const serie = seriesData.flatMap(group => group.group).find(serie => serie.name === serieName);
            
            // Verifica se enabled é false e retorna imediatamente
            if (!serie.enabled) {
                return;
            }

            document.getElementById('home').classList.remove('show');
            document.getElementById('home').classList.add('hidden');
            document.getElementById('series').classList.add('show');
            document.getElementById('series').classList.remove('hidden');
            document.getElementById('series-title').classList.remove('show');
            document.getElementById('series-title').classList.add('hidden');
            document.getElementById('series-name').classList.remove('hidden');
            document.getElementById('series-name').classList.add('show');
            document.getElementById('back-button').classList.remove('hidden');
            document.getElementById('back-button').classList.add('show');

            renderCurrentSeries(serie);
        });
    });
}

function updateFavorites() {
    const groupFavorites = document.getElementById('group-favorites');
    groupFavorites.innerHTML = '';

    if (favorites.length > 0) {
        const favoritesHTML = `
        <div id="group-series">
            <div id="group-series-header">
                <h3>FAVORITOS ★☆</h3>
            </div>
            <div id="group-series-cards">
                ${favorites.map(serie => {
                    const disabledClass = serie.enabled ? '' : 'disabled';
                    const backgroundStyle = `--bg-image: url(${serie.thumb_buttons});`;
                    return `
                    <div id="group-series-button" class="${disabledClass}" style="${backgroundStyle}">
                        ${serie.badge ? `
                            <span class="badge">${serie.badge}</span>
                        ` : ''}
                        <div class="info">
                            <h1>${serie.name}</h1>
                            ${serie.enabled ? (
                                serie.season.length > 0 ? `
                                    ${serie.season.some(season => season.movies) ? `
                                        <p>Filmes: ${serie.season.filter(season => season.movies).reduce((total, season) => total + season.episodes.length, 0)}</p>
                                        <p>Temporadas: ${serie.season.filter(season => !season.movies).length}</p>
                                    ` : `
                                        <p>Temporadas: ${serie.season.length}</p>
                                    `}
                                    <p>Episódios disponíveis: ${serie.season.filter(season => !season.movies).reduce((total, season) => total + season.episodes.length, 0)}</p>
                                ` : `
                                    <p>Nenhum conteúdo disponível</p>
                                `
                            ) : ``}
                            ${serie.enabled ? `
                                <button class="watch-button">ASSISTIR</button>
                            ` : `
                                <button class="watch-button">${serie.title || 'EM BREVE'}</button>
                            `}
                        </div>
                        <button class="favorite-button active" data-serie='${JSON.stringify(serie)}'>
                            ★
                            <span class="tooltip-text black tooltip-top">Remover dos favoritos</span>
                        </button>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>`;
        groupFavorites.innerHTML = favoritesHTML;

        document.querySelectorAll('#group-favorites .favorite-button').forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                const serie = JSON.parse(this.getAttribute('data-serie'));
                removeFavorite(serie);
                updateFavorites();
                renderSeriesButtons();
            });
        });

        document.querySelectorAll('#group-series-button').forEach(button => {
            button.addEventListener('click', function() {
                const serieName = this.querySelector('h1').innerText;
                const serie = seriesData.flatMap(group => group.group).find(serie => serie.name === serieName);
                
                // Verifica se enabled é false e retorna imediatamente
                if (!serie.enabled) {
                    return;
                }

                document.getElementById('home').classList.remove('show');
                document.getElementById('home').classList.add('hidden');
                document.getElementById('series').classList.add('show');
                document.getElementById('series').classList.remove('hidden');
                document.getElementById('series-title').classList.remove('show');
                document.getElementById('series-title').classList.add('hidden');
                document.getElementById('series-name').classList.remove('hidden');
                document.getElementById('series-name').classList.add('show');
                document.getElementById('back-button').classList.remove('hidden');
                document.getElementById('back-button').classList.add('show');

                renderCurrentSeries(serie);
            });
        });
    }
}

function saveFavorite(serie) {
    if (!favorites.some(fav => fav.name === serie.name)) {
        favorites.push(serie);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

function removeFavorite(serie) {
    favorites = favorites.filter(fav => fav.name !== serie.name);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

document.addEventListener('DOMContentLoaded', function() {
    renderSeriesButtons();
    updateFavorites();

    document.getElementById('prev-video-button').addEventListener('click', function() {
        navigateDirection('prev');
    });
    
    document.getElementById('next-video-button').addEventListener('click', function() {
        navigateDirection('next');
    });

    document.getElementById('close-overlay-button').addEventListener('click', function() {
        const videoOverlay = document.getElementById('video-overlay');
        const videoIframe = document.getElementById('video-iframe');
        videoOverlay.classList.remove('show');
        videoOverlay.classList.add('hidden');
        videoIframe.src = '';
        // Remove os dropdowns para que sejam recriados na próxima abertura
        const overlaySeasonDropdown = document.getElementById('overlay-season-dropdown');
        const overlayEpisodesDropdown = document.getElementById('overlay-episodes-dropdown');
        if (overlaySeasonDropdown) overlaySeasonDropdown.remove();
        if (overlayEpisodesDropdown) overlayEpisodesDropdown.remove();
    });

    document.querySelectorAll('#back-button').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('home').classList.remove('hidden');
            document.getElementById('home').classList.add('show');
            document.getElementById('series').classList.add('hidden');
            document.getElementById('series').classList.remove('show');
            document.getElementById('series-title').classList.remove('hidden');
            document.getElementById('series-title').classList.add('show');
            document.getElementById('series-title').classList.remove('hidden');
            document.getElementById('series-name').classList.remove('show');
            document.getElementById('series-name').classList.add('hidden');
            document.getElementById('back-button').classList.remove('show');
            document.getElementById('back-button').classList.add('hidden');
        });
    });
});