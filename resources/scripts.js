const seriesData = [
    {
        group_name: "SÉRIES BIBLÍCAS",
        group: [
            {
                name: "A TERRA PROMETIDA",
                thumb_page: "https://i.imgur.com/zXnAXED.png",
                thumb_buttons: "https://i.imgur.com/qvvefLV.png",
                page: "https://ok.ru/profile/565366943319/video",
                season: [
                    {
                        name: "Temporada 1",
                        thumb_season: "https://i.imgur.com/NbtbzDU.jpeg",
                        movies: false,
                        episodes: [
                            { title: "001", thumb: "", url: "https://ok.ru/videoembed/3999010458199", alternative: [ "https://novelasflix.vip/storage7/ATP/ATP-001.mp4", "https://ok.ru/videoembed/3999010458199"] },
                            { title: "002", thumb: "", url: "https://ok.ru/videoembed/4002059586135", alternative: []},
                            { title: "003", thumb: "", url: "https://ok.ru/videoembed/4002103364183", alternative: []},
                        ]
                    },
                    {
                        name: "Temporada 2",
                        thumb_season: "https://i.imgur.com/FWhYOfF.jpeg",
                        movies: false,
                        episodes: [
                            {  title: "001", thumb: "", url: "https://ok.ru/videoembed/1396816284247", alternative: ["https://ok.ru/videoembed/4002103364183"]},
                            {  title: "002", thumb: "", url: "https://ok.ru/videoembed/3999010458199", alternative: []},
                        ]
                    },
                    {
                        name: "Filmes",
                        thumb_season: "",
                        movies: true,
                        episodes: [
                            {  title: "OS DEZ MANDAMENTOS", thumb: "https://i.imgur.com/m21M7qL.png", url: "https://ok.ru/videoembed/3680592988759", alternative: ["https://cdn-novflix.com/storage3/ODM/ODMzJ8ZbkUekz24eeeVxdBUi001.mp4"]},
                            {  title: "OS DEZ MANDAMENTOS", thumb: "https://i.imgur.com/m21M7qL.png", url: "https://ok.ru/videoembed/3680592988759", alternative: ["https://cdn-novflix.com/storage3/ODM/ODMzJ8ZbkUekz24eeeVxdBUi001.mp4"]},
                            {  title: "OS DEZ MANDAMENTOS", thumb: "https://i.imgur.com/m21M7qL.png", url: "https://ok.ru/videoembed/3680592988759", alternative: ["https://cdn-novflix.com/storage3/ODM/ODMzJ8ZbkUekz24eeeVxdBUi001.mp4"]},
                            {  title: "OS DEZ MANDAMENTOS", thumb: "https://i.imgur.com/m21M7qL.png", url: "https://ok.ru/videoembed/3680592988759", alternative: ["https://cdn-novflix.com/storage3/ODM/ODMzJ8ZbkUekz24eeeVxdBUi001.mp4"]},
                        ]
                    },
                ],
            },
        ]
    },

    {
        group_name: "SÉRIES 2",
        group: [
            {
                name: "A RAINHA DA PÉRSIA",
                thumb_page: "https://i.imgur.com/xYtBPqJ.png",
                thumb_buttons: "https://i.imgur.com/tKjng2c.png",
                season: [
                    {
                        name: "",
                        thumb_season: "https://i.imgur.com/QtZwWWJ.jpeg",
                        movies: false,
                        episodes: [
                            { title: "", thumb: "", url: "https://ok.ru/videoembed/3999010458199", alternative: [ "https://novelasflix.vip/storage7/ATP/ATP-001.mp4", "https://ok.ru/videoembed/3999010458199", "https://backup2.com/video/ATP-001.mp4"] },
                            { title: "", thumb: "", url: "https://ok.ru/videoembed/4002059586135", alternative: []},
                        ]
                    }
                ],
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

    const hasSeasons = serie.season.length > 0;
    const showDropdown = hasSeasons && (serie.season.length > 1);

    const currentSeriesHTML = `
        <div id="current-series">
            <div id="current-series-header">
                <p id="available-text">${serie.season[0].movies ? 'Filmes disponíveis' : 'Episódios disponíveis'}: ${serie.season[0].episodes.length}</p>
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
            currentEpisodeIndex = 0;

            document.getElementById('available-text').innerText = selectedSeason.movies ? 'Filmes disponíveis' : 'Episódios disponíveis';
            document.getElementById('available-text').innerText += `: ${selectedSeason.episodes.length}`;
            document.getElementById('current-series-episodes').innerHTML = renderEpisodes(selectedSeason);

            addEpisodeButtonListeners();
            updateButtonVisibility();
            renderContinueWatchingSection();

            // Aplica .active ao episódio salvo da temporada selecionada
            const serieKey = serie.name.replace(/\s+/g, '_');
            const seasonKey = selectedSeason.name || `Temporada_${currentSeasonIndex + 1}`;
            const seasonProgress = continues[serieKey] && continues[serieKey][seasonKey];
            if (seasonProgress && seasonProgress.activeEpisodeIndex !== undefined) {
                const episodeButtons = document.querySelectorAll('#episode-button');
                if (episodeButtons[seasonProgress.activeEpisodeIndex]) {
                    episodeButtons[seasonProgress.activeEpisodeIndex].classList.add('active');
                }
            }
        });
    }

    addEpisodeButtonListeners();
    updateButtonVisibility();

    // Aplica .active ao episódio salvo da temporada inicial
    const serieKey = serie.name.replace(/\s+/g, '_');
    const seasonKey = serie.season[currentSeasonIndex].name || `Temporada_${currentSeasonIndex + 1}`;
    const seasonProgress = continues[serieKey] && continues[serieKey][seasonKey];
    if (seasonProgress && seasonProgress.activeEpisodeIndex !== undefined) {
        const episodeButtons = document.querySelectorAll('#episode-button');
        if (episodeButtons[seasonProgress.activeEpisodeIndex]) {
            episodeButtons[seasonProgress.activeEpisodeIndex].classList.add('active');
        }
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
                activeEpisodeIndex: index // Já está sendo salvo
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

    videoIframe.src = videoUrl;
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
            overlayEpisodesDropdown.value = episodeIndex;
            videoOverlayDropdown.appendChild(overlayEpisodesDropdown);

            overlaySeasonDropdown.addEventListener('change', function() {
                const newSeasonIndex = parseInt(this.value, 10);
                updateEpisodesDropdown(newSeasonIndex, overlayEpisodesDropdown);
                currentEpisodeIndex = 0;

                const selectedSeason = currentSerie.season[newSeasonIndex];
                const firstItem = selectedSeason.episodes[currentEpisodeIndex];
                videoIframe.src = firstItem.url;

                // Só atualiza .active se a temporada no overlay for a mesma do #season-dropdown
                if (newSeasonIndex === currentSeasonIndex) {
                    document.querySelectorAll('#episode-button').forEach(btn => {
                        btn.classList.remove('active');
                    });

                    const currentEpisodeButton = document.querySelector(`#episode-button[data-url="${firstItem.url}"]`);
                    if (currentEpisodeButton) {
                        currentEpisodeButton.classList.add('active');
                    }

                    renderToggleButtons(currentEpisodeButton || document.createElement('div'));
                    updateButtonVisibility();
                }

                const progress = {
                    serieName: currentSerie.name,
                    seasonName: selectedSeason.name,
                    episodeTitle: firstItem.title,
                    episodeIndex: currentEpisodeIndex,
                    seasonIndex: newSeasonIndex,
                    thumb: firstItem.thumb || selectedSeason.thumb_season,
                    url: firstItem.url,
                    movies: selectedSeason.movies,
                    activeEpisodeIndex: currentEpisodeIndex
                };

                saveContinueProgress(progress);
                renderContinueWatchingSection();
            });

            overlayEpisodesDropdown.addEventListener('change', function() {
                currentEpisodeIndex = parseInt(this.value, 10);
                const selectedSeason = currentSerie.season[seasonIndex];
                const selectedItem = selectedSeason.episodes[currentEpisodeIndex];

                videoIframe.src = selectedItem.url;
                overlayEpisodesDropdown.value = currentEpisodeIndex;

                // Só atualiza .active se a temporada no overlay for a mesma do #season-dropdown
                if (seasonIndex === currentSeasonIndex) {
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
                    seasonIndex: seasonIndex,
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

    if ((!mainUrl || mainUrl.trim() === "") && alternatives.length > 0) {
        mainUrl = alternatives.shift();
    }

    const updateActiveButton = (activeUrl) => {
        document.querySelectorAll('.toggle-button').forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-url') === activeUrl);
        });
    };

    let mainButton = null;
    if (mainUrl) {
        mainButton = document.createElement('button');
        mainButton.innerText = 'PRINCIPAL';
        mainButton.classList.add('toggle-button', 'active');
        mainButton.setAttribute('data-url', mainUrl);
        mainButton.addEventListener('click', () => {
            updateActiveButton(mainUrl);
            openVideoOverlay(mainUrl);
        });
        toggleButtonsContainer.appendChild(mainButton);
        mainButton.click();
    }

    alternatives.forEach((altUrl, index) => {
        const altButton = document.createElement('button');
        altButton.innerText = `OPÇÃO ${index + 2}`;
        altButton.setAttribute('data-url', altUrl);
        altButton.classList.add('toggle-button');
        altButton.addEventListener('click', () => {
            updateActiveButton(altUrl);
            openVideoOverlay(altUrl);
        });
        toggleButtonsContainer.appendChild(altButton);
    });

    if (mainButton && alternatives.length === 0) {
        mainButton.style.display = 'none';
    }

    updateActiveButton(mainUrl || alternatives[0]);
}

function navigateDirection(direction) {
    const currentSeason = currentSerie.season[currentSeasonIndex];
    const totalItems = currentSeason.episodes.length;

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
                    return `
                    <div id="group-series-button" style="background-image: url(${serie.thumb_buttons});">
                        <div class="info">
                            <h1>${serie.name}</h1>
                            ${serie.season.some(season => season.movies) ? `
                                <p>Filmes: ${serie.season.filter(season => season.movies).reduce((total, season) => total + season.episodes.length, 0)}</p>
                                <p>Temporadas: ${serie.season.filter(season => !season.movies).length}</p>
                            ` : `
                                <p>Temporadas: ${serie.season.length}</p>
                            `}
                            <p>Episódios disponíveis: ${serie.season.filter(season => !season.movies).reduce((total, season) => total + season.episodes.length, 0)}</p>
                            <button>ASSISTIR</button>
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
    
            document.getElementById('home').classList.remove('show');
            document.getElementById('home').classList.add('hidden');
            document.getElementById('series').classList.add('show');
            document.getElementById('series').classList.remove('hidden');
            document.getElementById('series-title').classList.remove('show');
            document.getElementById('series-title').classList.add('hidden');
            document.getElementById('series-title').classList.remove('show');
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
                    const totalEpisodes = serie.season.reduce((total, season) => total + season.episodes.length, 0);
                    return `
                    <div id="group-series-button" style="background-image: url(${serie.thumb_buttons});">
                        <div class="info">
                            <h1>${serie.name}</h1>
                            ${serie.season.some(season => season.movies) ? `
                                <p>Filmes: ${serie.season.filter(season => season.movies).reduce((total, season) => total + season.episodes.length, 0)}</p>
                                <p>Temporadas: ${serie.season.filter(season => !season.movies).length}</p>
                            ` : `
                                <p>Temporadas: ${serie.season.length}</p>
                            `}
                            <p>Episódios disponíveis: ${serie.season.filter(season => !season.movies).reduce((total, season) => total + season.episodes.length, 0)}</p>
                            <button>ASSISTIR</button>
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
    }

    document.querySelectorAll('#group-series-button').forEach(button => {
        button.addEventListener('click', function() {
            const serieName = this.querySelector('h1').innerText;
            const serie = seriesData.flatMap(group => group.group).find(serie => serie.name === serieName);
    
            document.getElementById('home').classList.remove('show');
            document.getElementById('home').classList.add('hidden');
            document.getElementById('series').classList.add('show');
            document.getElementById('series').classList.remove('hidden');
            document.getElementById('series-title').classList.remove('show');
            document.getElementById('series-title').classList.add('hidden');
            document.getElementById('series-title').classList.remove('show');
            document.getElementById('series-name').classList.remove('hidden');
            document.getElementById('series-name').classList.add('show');
            document.getElementById('back-button').classList.remove('hidden');
            document.getElementById('back-button').classList.add('show');

            renderCurrentSeries(serie);
        });
    });
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