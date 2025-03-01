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
const continues = JSON.parse(localStorage.getItem('continues')) || {};
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
    let continueSeriesHTML = '';

    const continues = JSON.parse(localStorage.getItem('continues'));
    if (continues && continues.serieName === serie.name) {
        let episodeText = '';

        if (continues.movies) {
            episodeText = `Filme: ${continues.episodeTitle}`;
        } else {
            const seasonNumber = continues.seasonIndex + 1;
            const episodeNumber = continues.episodeIndex + 1;
            episodeText = `T${seasonNumber} - Episódio ${episodeNumber}`;
        }

        continueSeriesHTML = `
            <div id="continue-series">
                <div id="continue-series-header">
                    <p id="available-text">Continuar assistindo</p>
                </div>

                <div id="continue-series-episodes">
                    <div id="continue-episode-button" style="background-image: url('${continues.thumb}');" onclick="openVideoOverlay('${continues.url}')">
                        <p>${episodeText}</p>
                        <div class="remove-button" onclick="event.stopPropagation(); removeContinueSeries()">✕</div>
                    </div>
                </div>
            </div>
        `;
    }

    const currentSeriesHTML = `
        <div id="current-series">
            ${continueSeriesHTML}
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
        });
    }

    addEpisodeButtonListeners();
    updateButtonVisibility();
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

            const continues = {
                serieName,
                seasonName,
                episodeTitle,
                episodeIndex: currentEpisodeIndex,
                seasonIndex: currentSeasonIndex,
                thumb: currentSerie.season[currentSeasonIndex].episodes[currentEpisodeIndex].thumb || currentSerie.season[currentSeasonIndex].thumb_season,
                url: currentSerie.season[currentSeasonIndex].episodes[currentEpisodeIndex].url,
                movies: currentSerie.season[currentSeasonIndex].movies
            };

            localStorage.setItem('continues', JSON.stringify(continues));
        });
    });
}

function openVideoOverlay(videoUrl) {
    const videoOverlay = document.getElementById('video-overlay');
    const videoIframe = document.getElementById('video-iframe');
    const videoOverlayDropdown = document.getElementById('video-overlay-dropdown');

    videoIframe.src = videoUrl;
    videoOverlay.classList.remove('hidden');
    videoOverlay.classList.add('show');

    const oldSeasonDropdown = document.getElementById('overlay-season-dropdown');
    const oldEpisodesDropdown = document.getElementById('overlay-episodes-dropdown');
    if (oldSeasonDropdown) oldSeasonDropdown.remove();
    if (oldEpisodesDropdown) oldEpisodesDropdown.remove();

    const overlaySeasonDropdown = document.createElement('select');
    overlaySeasonDropdown.id = 'overlay-season-dropdown';

    const overlayEpisodesDropdown = document.createElement('select');
    overlayEpisodesDropdown.id = 'overlay-episodes-dropdown';

    if (currentSerie && currentSerie.season.length > 1) {
        currentSerie.season.forEach((season, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = season.name ? season.name : `Temporada ${index + 1}`;
            overlaySeasonDropdown.appendChild(option);
        });

        overlaySeasonDropdown.value = currentSeasonIndex;
        videoOverlayDropdown.appendChild(overlaySeasonDropdown);

        updateEpisodesDropdown(currentSeasonIndex, overlayEpisodesDropdown);
        videoOverlayDropdown.appendChild(overlayEpisodesDropdown);

        overlaySeasonDropdown.addEventListener('change', function() {
            currentSeasonIndex = parseInt(this.value, 10);
            updateEpisodesDropdown(currentSeasonIndex, overlayEpisodesDropdown);
            currentEpisodeIndex = 0;

            const selectedSeason = currentSerie.season[currentSeasonIndex];
            const firstItem = selectedSeason.episodes[currentEpisodeIndex];
            openVideoOverlay(firstItem.url);

            document.querySelectorAll('#episode-button').forEach(btn => {
                btn.classList.remove('active');
            });

            const currentEpisodeButton = document.querySelector(`#episode-button[data-url="${firstItem.url}"]`);
            if (currentEpisodeButton) {
                currentEpisodeButton.classList.add('active');
            }

            renderToggleButtons(currentEpisodeButton || document.createElement('div'));
            updateButtonVisibility();
        });

        overlayEpisodesDropdown.addEventListener('change', function() {
            currentEpisodeIndex = parseInt(this.value, 10);
            const selectedSeason = currentSerie.season[currentSeasonIndex];
            const selectedItem = selectedSeason.episodes[currentEpisodeIndex];

            openVideoOverlay(selectedItem.url);

            document.querySelectorAll('#episode-button').forEach(btn => {
                btn.classList.remove('active');
            });

            const currentEpisodeButton = document.querySelector(`#episode-button[data-url="${selectedItem.url}"]`);
            if (currentEpisodeButton) {
                currentEpisodeButton.classList.add('active');
            }

            renderToggleButtons(currentEpisodeButton || document.createElement('div'));
            updateButtonVisibility();
        });
    }
}

function updateEpisodesDropdown(seasonIndex, episodesDropdown) {
    episodesDropdown.innerHTML = '';

    const selectedSeason = currentSerie.season[seasonIndex];
    selectedSeason.episodes.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.title ? item.title : `Item ${index + 1}`;
        episodesDropdown.appendChild(option);
    });

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

    const continues = {
        serieName,
        seasonName,
        episodeTitle,
        episodeIndex: currentEpisodeIndex,
        seasonIndex: currentSeasonIndex,
        thumb: episode.thumb || currentSerie.season[currentSeasonIndex].thumb_season,
        url: episode.url
    };

    localStorage.setItem('continues', JSON.stringify(continues));
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

function removeContinueSeries() {
    localStorage.removeItem('continues');
    const continueSeriesElement = document.getElementById('continue-series');
    if (continueSeriesElement) {
        continueSeriesElement.remove();
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