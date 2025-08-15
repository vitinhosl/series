//F12 - CONSOLE (PEGAR EMBEDS) - FIXADO JÁ
//https://ok.ru/profile/565366943319/video
//https://ok.ru/profile/576088845785/video
//https://ok.ru/profile/589793268027/video VITORIA MIRANDA 
//https://ok.ru/profile/576088845785/video ESTUDIOS 421

//DIGITAR ALLOW/{PH1} PARA PODER COPIAR

//#region OK.RU
(function() {
    // Variável para controlar a ordem da lista
    let reverse = true;

    // Detecta modo claro/escuro
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Cria container flutuante
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: '9999',
        background: isDarkMode ? '#1f1f1f' : 'white',
        color: isDarkMode ? 'white' : 'black',
        padding: '10px',
        border: '1px solid ' + (isDarkMode ? '#444' : '#ccc'),
        borderRadius: '5px',
        maxWidth: '350px',
        fontFamily: 'sans-serif',
        fontSize: '14px'
    });

    // Botão principal
    const button = document.createElement('button');
    button.textContent = 'Gerar e Copiar Lista de Vídeos';
    Object.assign(button.style, {
        padding: '5px 10px',
        marginBottom: '10px',
        cursor: 'pointer'
    });

    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    Object.assign(closeButton.style, {
        position: 'absolute',
        top: '5px',
        right: '5px',
        padding: '2px 6px',
        cursor: 'pointer'
    });
    closeButton.addEventListener('click', () => container.remove());

    // Textarea de fallback
    const textarea = document.createElement('textarea');
    Object.assign(textarea.style, {
        width: '100%',
        height: '200px',
        display: 'none',
        marginTop: '5px',
        background: isDarkMode ? '#333' : 'white',
        color: isDarkMode ? 'white' : 'black'
    });

    container.appendChild(closeButton);
    container.appendChild(button);
    container.appendChild(textarea);
    document.body.appendChild(container);

    // Função para rolar até o final da página
    async function scrollToBottom() {
        let lastHeight = document.body.scrollHeight;
        while (true) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newHeight = document.body.scrollHeight;
            if (newHeight === lastHeight) break;
            lastHeight = newHeight;
        }
    }

    // Evento de clique no botão
    button.addEventListener('click', async () => {
        await scrollToBottom();
        const videos = [...document.querySelectorAll('a[href*="/video/"]')];
        const idsAndTitles = new Map();

        videos.forEach(v => {
            const id = v.href.match(/\/video\/(\d+)/)?.[1];
            if (!id) return;

            let title = v.textContent.trim() || v.getAttribute('title') || "Sem título";
            let thumb = "";
            let duration = "";
            const parent = v.closest('.video-card');
            const img = parent?.querySelector('.video-card_img');
            if (img && img.src) {
                thumb = img.src;
            }
            const durationElement = parent?.querySelector('.video-card_duration');
            if (durationElement) {
                duration = durationElement.textContent.trim();
            }

            if (idsAndTitles.has(id)) {
                const existing = idsAndTitles.get(id);
                if (existing.title === "Sem título" && title !== "Sem título") {
                    idsAndTitles.set(id, { title, thumb, duration });
                }
            } else {
                idsAndTitles.set(id, { title, thumb, duration });
            }
        });

        let idsAndTitlesArray = Array.from(idsAndTitles.entries());
        if (reverse) {
            idsAndTitlesArray = idsAndTitlesArray.reverse();
        }

        let output = "";
        idsAndTitlesArray.forEach(([id, { title, thumb, duration }], index) => {
            const number = String(index + 1).padStart(3, '0');
            output += `[EPISÓDIO: "${title}"] - { title: "${number}", duration: "${duration || 'Duração não encontrada'}", thumb: "${thumb || 'Thumbnail não encontrada'}", url: "https://ok.ru/videoembed/${id}", alternative: []},\n`;
        });

        navigator.clipboard.writeText(output).then(() => {
            button.textContent = 'Copiado!';
            setTimeout(() => button.textContent = 'Gerar e Copiar Lista de Vídeos', 2000);
            textarea.style.display = 'block';
            textarea.value = output;
        }).catch(err => {
            console.error("Erro ao copiar:", err);
            textarea.style.display = 'block';
            textarea.value = output;
            textarea.select();
            alert('Erro ao copiar. A lista foi exibida na área de texto. Pressione Ctrl+C para copiar.');
        });
    });
})();
//#endregion

//#region ANIMESBR.TV
(function() {
    // Variável para controlar a ordem da lista
    let reverse = true;

    // Detecta modo claro/escuro
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Cria container flutuante
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: '9999',
        background: isDarkMode ? '#1f1f1f' : 'white',
        color: isDarkMode ? 'white' : 'black',
        padding: '10px',
        border: '1px solid ' + (isDarkMode ? '#444' : '#ccc'),
        borderRadius: '5px',
        maxWidth: '350px',
        fontFamily: 'sans-serif',
        fontSize: '14px'
    });

    // Botão principal
    const button = document.createElement('button');
    button.textContent = 'Gerar e Copiar Lista de Episódios';
    Object.assign(button.style, {
        padding: '5px 10px',
        marginBottom: '10px',
        cursor: 'pointer'
    });

    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    Object.assign(closeButton.style, {
        position: 'absolute',
        top: '5px',
        right: '5px',
        padding: '2px 6px',
        cursor: 'pointer'
    });
    closeButton.addEventListener('click', () => container.remove());

    // Textarea de fallback
    const textarea = document.createElement('textarea');
    Object.assign(textarea.style, {
        width: '100%',
        height: '200px',
        display: 'none',
        marginTop: '5px',
        background: isDarkMode ? '#333' : 'white',
        color: isDarkMode ? 'white' : 'black'
    });

    container.appendChild(closeButton);
    container.appendChild(button);
    container.appendChild(textarea);
    document.body.appendChild(container);

    // Função para rolar até o final da página
    async function scrollToBottom() {
        let lastHeight = document.body.scrollHeight;
        while (true) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newHeight = document.body.scrollHeight;
            if (newHeight === lastHeight) break;
            lastHeight = newHeight;
        }
    }

    // Evento de clique no botão
    button.addEventListener('click', async () => {
        await scrollToBottom();

        // Seleciona os episódios da lista (.episodios li)
        const episodeElements = document.querySelectorAll(".episodios li");
        const episodes = [];

        episodeElements.forEach((li, index) => {
            // Obtém o link e título do episódio
            const titleAnchor = li.querySelector(".episodiotitle a");
            const titleText = titleAnchor?.innerText.trim() || `Episódio ${index + 1}`;
            const url = titleAnchor?.href || "";

            // Obtém a thumbnail do episódio
            const img = li.querySelector("img");
            const thumb = img?.src || "";

            // Duração não disponível, mantém padrão
            const duration = "Duração não encontrada";

            // Formata o título para o padrão "Episódio 001"
            const formattedTitle = `Episódio ${String(index + 1).padStart(3, '0')}`;

            episodes.push({
                title: formattedTitle,
                duration: duration,
                thumb: thumb,
                url: url,
                alternative: []
            });
        });

        // Aplica ordenação reversa se necessário
        if (reverse) {
            episodes.reverse();
        }

        // Gera a saída no formato dos outros scripts
        const output = episodes.map((episode, index) => {
            const number = String(index + 1).padStart(3, '0');
            return `[EPISÓDIO: "${episode.title}"] - { title: "${number}", duration: "${episode.duration}", thumb: "${episode.thumb}", url: "${episode.url}", alternative: []},`;
        }).join('\n');

        // Copia para clipboard
        navigator.clipboard.writeText(output).then(() => {
            button.textContent = 'Copiado!';
            setTimeout(() => button.textContent = 'Gerar e Copiar Lista de Episódios', 2000);
            textarea.style.display = 'block';
            textarea.value = output;
        }).catch(err => {
            console.error("Erro ao copiar:", err);
            textarea.style.display = 'block';
            textarea.value = output;
            textarea.select();
            alert('Erro ao copiar. A lista foi exibida na área de texto. Pressione Ctrl+C para copiar.');
        });
    });
})();
//#endregion  

//#region YOUTUBE PLAYLIST
(function() {
    // Variável para controlar a ordem da lista
    let reverse = true;

    // Detecta modo claro/escuro
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Cria container flutuante
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: '9999',
        background: isDarkMode ? '#1f1f1f' : 'white',
        color: isDarkMode ? 'white' : 'black',
        padding: '10px',
        border: '1px solid ' + (isDarkMode ? '#444' : '#ccc'),
        borderRadius: '5px',
        maxWidth: '350px',
        fontFamily: 'sans-serif',
        fontSize: '14px'
    });

    // Botão principal
    const button = document.createElement('button');
    button.textContent = 'Gerar e Copiar Lista de Vídeos';
    Object.assign(button.style, {
        padding: '5px 10px',
        marginBottom: '10px',
        cursor: 'pointer'
    });

    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    Object.assign(closeButton.style, {
        position: 'absolute',
        top: '5px',
        right: '5px',
        padding: '2px 6px',
        cursor: 'pointer'
    });
    closeButton.addEventListener('click', () => container.remove());

    // Textarea de fallback
    const textarea = document.createElement('textarea');
    Object.assign(textarea.style, {
        width: '100%',
        height: '200px',
        display: 'none',
        marginTop: '5px',
        background: isDarkMode ? '#333' : 'white',
        color: isDarkMode ? 'white' : 'black'
    });

    container.appendChild(closeButton);
    container.appendChild(button);
    container.appendChild(textarea);
    document.body.appendChild(container);

    // Função para rolar até o final da página
    async function scrollToBottom() {
        let lastHeight = document.body.scrollHeight;
        while (true) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newHeight = document.body.scrollHeight;
            if (newHeight === lastHeight) break;
            lastHeight = newHeight;
        }
    }

    // Evento de clique no botão
    button.addEventListener('click', async () => {
        await scrollToBottom();
        const items = Array.from(document.querySelectorAll('ytd-playlist-video-renderer'));

        const list = items.map((item, idx) => {
            // Título e URL
            const a = item.querySelector('#video-title');
            const title = (a?.textContent || 'Sem título').trim();
            const href = a?.href || '';
            const videoId = new URL(href).searchParams.get('v') || '';

            // Thumbnail
            const img = item.querySelector('ytd-thumbnail img');
            const thumb = img?.src || img?.getAttribute('data-thumb') || '';

            // Duração
            const durationEl = item.querySelector('span.ytd-thumbnail-overlay-time-status-renderer');
            const duration = durationEl?.textContent.trim() || '';

            // Monta objeto
            const number = String(idx + 1).padStart(3, '0');
            return `[EPISÓDIO: "${title}"] - { title: "${number}", duration: "${duration}", thumb: "${thumb}", url: "${href}", alternative: []},`;
        });

        // Aplica ordenação reversa se necessário
        if (reverse) {
            list.reverse();
        }

        const output = list.join('\n');

        // Copia para clipboard
        navigator.clipboard.writeText(output).then(() => {
            button.textContent = 'Copiado!';
            setTimeout(() => button.textContent = 'Gerar e Copiar Lista de Vídeos', 2000);
            textarea.style.display = 'block';
            textarea.value = output;
        }).catch(() => {
            textarea.style.display = 'block';
            textarea.value = output;
            textarea.select();
            alert('Erro ao copiar. A lista foi exibida na área de texto. Pressione Ctrl+C para copiar.');
        });
    });
})();
//#endregion

//#region GLOBOPLAY
(function() {
    // Variável para controlar a ordem da lista
    let reverse = true;

    // Detecta modo claro/escuro
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Cria container flutuante
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: '9999',
        background: isDarkMode ? '#1f1f1f' : 'white',
        color: isDarkMode ? 'white' : 'black',
        padding: '10px',
        border: '1px solid ' + (isDarkMode ? '#444' : '#ccc'),
        borderRadius: '5px',
        maxWidth: '350px',
        fontFamily: 'sans-serif',
        fontSize: '14px'
    });

    // Botão principal
    const button = document.createElement('button');
    button.textContent = 'Gerar e Copiar Lista de Episódios';
    Object.assign(button.style, {
        padding: '5px 10px',
        marginBottom: '10px',
        cursor: 'pointer'
    });

    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    Object.assign(closeButton.style, {
        position: 'absolute',
        top: '5px',
        right: '5px',
        padding: '2px 6px',
        cursor: 'pointer'
    });
    closeButton.addEventListener('click', () => container.remove());

    // Textarea de fallback
    const textarea = document.createElement('textarea');
    Object.assign(textarea.style, {
        width: '100%',
        height: '200px',
        display: 'none',
        marginTop: '5px',
        background: isDarkMode ? '#333' : 'white',
        color: isDarkMode ? 'white' : 'black'
    });

    container.appendChild(closeButton);
    container.appendChild(button);
    container.appendChild(textarea);
    document.body.appendChild(container);

    // Função para rolar até o final da página
    async function scrollToBottom() {
        let lastHeight = document.body.scrollHeight;
        while (true) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newHeight = document.body.scrollHeight;
            if (newHeight === lastHeight) break;
            lastHeight = newHeight;
        }
    }

    // Evento de clique no botão
    button.addEventListener('click', async () => {
        await scrollToBottom();
        const items = Array.from(document.querySelectorAll('.title-episode'));

        const list = items.map((item, idx) => {
            // Título
            const titleEl = item.querySelector('.title-episode__title');
            const title = titleEl ? titleEl.textContent.trim() : 'Sem título';

            // URL
            const a = item.querySelector('.video-widget a');
            const href = a ? a.href : '';
            const videoId = href ? new URL(href).pathname.split('/v/')[1]?.split('/')[0] || '' : '';

            // Thumbnail
            const img = item.querySelector('.thumb');
            const thumb = img ? img.src : '';

            // Duração
            const durationEl = item.querySelector('.video-widget__duration');
            const duration = durationEl ? durationEl.textContent.trim() : '';

            // Monta objeto
            const number = String(idx + 1).padStart(3, '0');
            return {
                title: title,
                number: number,
                duration: duration,
                thumb: thumb,
                url: href,
                alternative: []
            };
        });

        // Aplica ordenação reversa se necessário
        if (reverse) {
            list.reverse();
        }

        // Formata a saída
        const output = list.map((item, idx) => {
            const number = String(idx + 1).padStart(3, '0');
            return `[EPISÓDIO: "${item.title}"] - { title: "${number}", duration: "${item.duration}", thumb: "${item.thumb}", url: "${item.url}", alternative: []},`;
        }).join('\n');

        // Copia para clipboard
        navigator.clipboard.writeText(output).then(() => {
            button.textContent = 'Copiado!';
            setTimeout(() => button.textContent = 'Gerar e Copiar Lista de Episódios', 2000);
            textarea.style.display = 'block';
            textarea.value = output;
        }).catch(() => {
            textarea.style.display = 'block';
            textarea.value = output;
            textarea.select();
            alert('Erro ao copiar. A lista foi exibida na área de texto. Pressione Ctrl+C para copiar.');
        });
    });
})();
//#endregion

//#region PLAYPLUS
(function() {
    // Variável para controlar a ordem da lista
    let reverse = false;

    // Detecta modo claro/escuro
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Cria container flutuante
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'fixed',
        top: '10px',
        right: '10px Evil',
        zIndex: '9999',
        background: isDarkMode ? '#1f1f1f' : 'white',
        color: isDarkMode ? 'white' : 'black',
        padding: '10px',
        border: '1px solid ' + (isDarkMode ? '#444' : '#ccc'),
        borderRadius: '5px',
        maxWidth: '350px',
        fontFamily: 'sans-serif',
        fontSize: '14px'
    });

    // Botão principal
    const button = document.createElement('button');
    button.textContent = 'Gerar e Copiar Lista de Episódios';
    Object.assign(button.style, {
        padding: '5px 10px',
        marginBottom: '10px',
        cursor: 'pointer'
    });

    // Botão de fechar
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    Object.assign(closeButton.style, {
        position: 'absolute',
        top: '5px',
        right: '5px',
        padding: '2px 6px',
        cursor: 'pointer'
    });
    closeButton.addEventListener('click', () => container.remove());

    // Textarea de fallback
    const textarea = document.createElement('textarea');
    Object.assign(textarea.style, {
        width: '100%',
        height: '200px',
        display: 'none',
        marginTop: '5px',
        background: isDarkMode ? '#333' : 'white',
        color: isDarkMode ? 'white' : 'black'
    });

    container.appendChild(closeButton);
    container.appendChild(button);
    container.appendChild(textarea);
    document.body.appendChild(container);

    // Função para rolar até o final da página
    async function scrollToBottom() {
        let lastHeight = document.body.scrollHeight;
        while (true) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newHeight = document.body.scrollHeight;
            if (newHeight === lastHeight) break;
            lastHeight = newHeight;
        }
    }

    // Evento de clique no botão
    button.addEventListener('click', async () => {
        await scrollToBottom();
        const items = Array.from(document.querySelectorAll('.chapter-item.item-landscape.slide'));

        const list = items.map((item, idx) => {
            // Título
            const img = item.querySelector('.movieItemLandscape img');
            const title = img?.getAttribute('data-title') || item.querySelector('.titleFallBack')?.textContent.trim() || 'Sem título';

            // URL (derivado do ID no onclick)
            const figure = item.querySelector('.movieItemLandscape');
            let videoId = img?.getAttribute('data-id') || '';
            if (figure && figure.getAttribute('onclick')) {
                const match = figure.getAttribute('onclick').match(/Helpers\.startSVODAuthorize\((\d+)\)/);
                videoId = match ? match[1] : videoId;
            }
            const url = videoId ? `https://www.playplus.tv/watch/${videoId}` : '';

            // Thumbnail
            const thumb = img?.src || '';

            // Duração
            const durationEl = item.querySelector('.chapter-duration') || item.querySelector('.mediaProgressNumber');
            const duration = durationEl?.textContent.trim() || 'Duração não encontrada';

            // Monta objeto
            const number = String(idx + 1).padStart(3, '0');
            return {
                title: title,
                number: number,
                duration: duration,
                thumb: thumb,
                url: url,
                alternative: []
            };
        });

        // Aplica ordenação reversa se necessário
        if (reverse) {
            list.reverse();
        }

        // Formata a saída
        const output = list.map((item, idx) => {
            const number = String(idx + 1).padStart(3, '0');
            return `[EPISÓDIO: "${item.title}"] - { title: "${number}", duration: "${item.duration}", thumb: "${item.thumb}", url: "${item.url}", alternative: []},`;
        }).join('\n');

        // Copia para clipboard
        navigator.clipboard.writeText(output).then(() => {
            button.textContent = 'Copiado!';
            setTimeout(() => button.textContent = 'Gerar e Copiar Lista de Episódios', 2000);
            textarea.style.display = 'block';
            textarea.value = output;
        }).catch(() => {
            textarea.style.display = 'block';
            textarea.value = output;
            textarea.select();
            alert('Erro ao copiar. A lista foi exibida na área de texto. Pressione Ctrl+C para copiar.');
        });
    });
})();
//#endregion




