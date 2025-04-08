//F12 - CONSOLE (PEGAR EMBEDS) - FIXADO JÁ
//https://ok.ru/profile/565366943319/video
//https://ok.ru/profile/576088845785/video
//https://ok.ru/profile/589793268027/video VITORIA MIRANDA 

//DIGITAR ALLOW PARA PODER COPIAR

//#region GERA EMBEDS PRONTAS PRA VIDEOS + THUMBS + CAIXA DE SELEÇÃO
const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '10px';
container.style.right = '10px';
container.style.zIndex = '9999';
container.style.background = 'white';
container.style.padding = '10px';
container.style.border = '1px solid #ccc';
container.style.borderRadius = '5px';

// Criar o botão
const button = document.createElement('button');
button.textContent = 'Gerar e Copiar Lista de Vídeos';
button.style.padding = '5px 10px';
button.style.marginBottom = '10px';

// Criar a área de texto (para fallback)
const textarea = document.createElement('textarea');
textarea.style.width = '300px';
textarea.style.height = '200px';
textarea.style.display = 'none'; // Esconder inicialmente

// Adicionar elementos ao container
container.appendChild(button);
container.appendChild(textarea);
document.body.appendChild(container);

// Função para gerar a lista e copiar
button.addEventListener('click', () => {
    const videos = [...document.querySelectorAll('a[href*="/video/"]')];
    const idsAndTitles = new Map(); // Usamos um Map para evitar duplicatas

    videos.forEach(v => {
        const id = v.href.match(/\/video\/(\d+)/)?.[1];
        if (!id) return;

        // Obter o título
        let title = v.textContent.trim() || v.getAttribute('title') || "Sem título";

        // Procurar a thumbnail (src da tag <img>) dentro do card
        let thumb = "";
        const parent = v.closest('.video-card'); // Encontrar o elemento pai com a classe 'video-card'
        const img = parent?.querySelector('.video-card_img'); // Selecionar a imagem com a classe 'video-card_img'
        if (img && img.src) {
            thumb = img.src; // Pegar o src da imagem (a thumbnail)
        }

        // Procurar o tempo do vídeo (dentro de .video-card_duration)
        let duration = "";
        const durationElement = parent?.querySelector('.video-card_duration');
        if (durationElement) {
            duration = durationElement.textContent.trim(); // Pegar o texto, ex.: "59:54"
        }

        // Se já existe esse ID, verifica se o novo título é mais informativo
        if (idsAndTitles.has(id)) {
            const existing = idsAndTitles.get(id);
            if (existing.title === "Sem título" && title !== "Sem título") {
                idsAndTitles.set(id, { title, thumb, duration });
            }
        } else {
            idsAndTitles.set(id, { title, thumb, duration });
        }
    });

    const idsAndTitlesArray = Array.from(idsAndTitles.entries());
    // const idsAndTitlesArray = Array.from(idsAndTitles.entries()).reverse();

    // Acumular todas as saídas em uma única string
    let output = "";
    idsAndTitlesArray.forEach(([id, { title, thumb, duration }], index) => {
        const number = String(index + 1).padStart(3, '0');
        output += `[EPISÓDIO: "${title}"] - { title: "${number}", duration: "${duration || 'Duração não encontrada'}", thumb: "${thumb || 'Thumbnail não encontrada'}", url: "https://ok.ru/videoembed/${id}", alternative: []},\n`;
    });

    // Tentar copiar para a área de transferência
    navigator.clipboard.writeText(output).then(() => {
        // alert("Lista copiada para a área de transferência!");
        textarea.style.display = 'block';
        textarea.value = output;
    }).catch(err => {
        console.error("Erro ao copiar para a área de transferência:", err);
        // Fallback: exibir a saída na área de texto
        textarea.style.display = 'block';
        textarea.value = output;
        alert("Erro ao copiar. A lista foi exibida em uma área de texto abaixo do botão.");
    });
});
//#endregion

//region ANIMESBR.TV
(function() {
    //#region CRIA CONTAINER COM BOTÃO E ÁREA DE TEXTO
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.zIndex = '9999';
    container.style.background = 'white';
    container.style.padding = '10px';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '5px';
  
    // Botão para gerar a lista
    const button = document.createElement('button');
    button.textContent = 'Gerar e Copiar Lista de Episódios';
    button.style.padding = '5px 10px';
    button.style.marginBottom = '10px';
  
    // Área de texto para fallback (caso a cópia falhe)
    const textarea = document.createElement('textarea');
    textarea.style.width = '300px';
    textarea.style.height = '200px';
    textarea.style.display = 'none';
  
    // Adiciona os elementos no container
    container.appendChild(button);
    container.appendChild(textarea);
    document.body.appendChild(container);
    //#endregion
  
    button.addEventListener('click', () => {
      //#region EXTRAÇÃO DE DADOS
      // Nome da série: pega o conteúdo do <h1> dentro do elemento com a classe "data"
      const seriesName = document.querySelector(".data h1")?.innerText.trim() || "";
  
      // Array de thumbs para os botões (pode ser alterado conforme necessário)
      const thumbButtons = ["https://animesbr.tv/wp-content/uploads/2025/01/vTCjCkwHn3bfqVLdQjZke3c8w7l-200x300.jpg"];
  
      // Seleciona os episódios da lista (.episodios li)
      const episodeElements = document.querySelectorAll(".episodios li");
      const episodes = [];
  
      episodeElements.forEach((li, index) => {
        // Obtém o link e título do episódio
        const titleAnchor = li.querySelector(".episodiotitle a");
        const titleText = titleAnchor?.innerText.trim() || `Episódio ${index + 1}`;
        const url = titleAnchor?.href || "";
        
        // Obtém a thumbnail do episódio (a imagem presente no <img>)
        const img = li.querySelector("img");
        const thumb = img?.src || "";
  
        // Como a duração não consta na página, define um valor padrão
        const duration = "Duração não encontrada";
  
        // Formata o título para o padrão "Episódio 001"
        const formattedTitle = `Episódio ${String(index + 1).padStart(3, '0')}`;
  
        episodes.push({
          title: formattedTitle,
          duration: duration,
          thumb: thumb,
          url: url,
          alternative: [""]
        });
      });
      //#endregion
  
      //#region CONSTRUÇÃO DO OBJETO JSON
      const outputObject = {
        name: seriesName,
        thumb_page: "",
        thumb_buttons: thumbButtons,
        badge: "",
        enabled: true,
        season: [
          {
            name: "",
            thumb_season: "",
            movies: false,
            episodes: episodes
          }
        ]
      };
  
      const output = JSON.stringify(outputObject, null, 2);
      //#endregion
  
      //#region CÓPIA PARA ÁREA DE TRANSFERÊNCIA E FEEDBACK
      navigator.clipboard.writeText(output).then(() => {
        textarea.style.display = 'block';
        textarea.value = output;
      }).catch(err => {
        console.error("Erro ao copiar para a área de transferência:", err);
        textarea.style.display = 'block';
        textarea.value = output;
        alert("Erro ao copiar. A lista foi exibida na área de texto abaixo do botão.");
      });
      //#endregion
    });
  })();
//#endregion  

