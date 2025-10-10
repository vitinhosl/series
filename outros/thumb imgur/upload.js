// Client ID:
// 445e47c8a170c34

// Client secret:
// 5ff791b6b2badc085742450ac4d2a29f610eeeb5

const axios = require('axios');
const FormData = require('form-data');
const clipboardy = require('clipboardy');

const IMGUR_CLIENT_ID = '445e47c8a170c34';

const groups = [
  {
    name: "NOME DA TABELA DAS THUMBS",
    urls: [
      "LINK DAS THUMBS POR TABELAS"
    ]
  },
];

async function uploadImageFromUrl(imageUrl, attempt = 1) {
  const MAX_ATTEMPTS = 3; // Aumentei pra 3
  try {
    if (!imageUrl || imageUrl === 'undefined') {
      console.log('URL inválida pulada.');
      return null;
    }

    // Baixa a imagem como array buffer
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = imageResponse.data;
    
    // Converte o buffer para base64
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Prepara os dados para o upload
    const formData = new FormData();
    formData.append('image', base64Image);
    formData.append('type', 'base64');

    // Envia a imagem para o Imgur
    const response = await axios.post('https://api.imgur.com/3/upload', formData, {
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        ...formData.getHeaders()
      }
    });

    return response.data.data.link;
  } catch (error) {
    if (error.response && error.response.status === 429 && attempt < MAX_ATTEMPTS) {
      // Tenta ler o tempo de reset do header (em segundos)
      let waitTime = Math.pow(2, attempt) * 2000; // Backoff maior: 4s, 8s, 16s
      if (error.response.headers['x-ratelimit-reset']) {
        const resetTime = parseInt(error.response.headers['x-ratelimit-reset']) * 1000;
        const now = Date.now();
        waitTime = Math.max(waitTime, resetTime - now);
      }
      console.warn(`Erro 429 para ${imageUrl}. Tentativa ${attempt} de ${MAX_ATTEMPTS}. Aguardando ${Math.round(waitTime / 1000)}s...`);
      await delay(waitTime);
      return uploadImageFromUrl(imageUrl, attempt + 1);
    } else {
      console.error(`Erro ao fazer upload da imagem ${imageUrl}:`, error.response ? error.response.data : error.message);
      return null;
    }
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processGroups() {
  let finalOutput = "";
  let allUploadedLinks = [];
  
  for (const group of groups) {
    finalOutput += `${group.name}\n`;
    const groupLinks = [];
    for (const url of group.urls) {
      console.log(`Processando: ${url}`);
      const imgLink = await uploadImageFromUrl(url);
      if (imgLink) {
        console.log(`Upload realizado: ${imgLink}`);
        groupLinks.push(`"${imgLink}"`);
        allUploadedLinks.push(`"${imgLink}"`);
      }

      if (imgLink) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(`Erro 429 recebido para ${imageUrl}. Tentativa ${attempt} de ${MAX_ATTEMPTS}. Aguardando ${waitTime}ms...`);
        await delay(waitTime);
      }
    }

    if (groupLinks.length > 0) {
      const partialGroup = groupLinks.join(",\n");
      finalOutput += partialGroup + "\n\n";
      console.log(`\n--- PARCIAL ${group.name} ---\n${partialGroup}\n---\n`);
      clipboardy.writeSync(finalOutput);
      console.log('Output parcial copiado pro clipboard!');
    }
  }
  
  const totalOutput = allUploadedLinks.join(",\n");
  clipboardy.writeSync(totalOutput);
  console.log("\n--- FINAL TOTAL ---\n" + totalOutput + "\n---\nCopiado pro clipboard!");
}

processGroups();