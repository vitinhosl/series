// Client ID:
// 445e47c8a170c34

// Client secret:
// 5ff791b6b2badc085742450ac4d2a29f610eeeb5

const axios = require('axios');
const FormData = require('form-data');
const clipboardy = require('clipboardy');

// Seu Client ID do Imgur
const IMGUR_CLIENT_ID = '445e47c8a170c34';

// Defina seus grupos com nomes e listas de URLs
const groups = [
  {
    name: "NOME DA TABELA DAS THUMBS",
    urls: [
      "LINK DAS THUMBS POR TABELAS"
    ]
  }

];

async function uploadImageFromUrl(imageUrl, attempt = 1) {
  const MAX_ATTEMPTS = 5; // Número máximo de tentativas
  try {
    // Baixa a imagem como array buffer
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = imageResponse.data;
    
    // Converte o buffer para base64 (Imgur aceita upload via base64)
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
      // Calcula o tempo de espera: backoff exponencial (por exemplo, 2^attempt * 1000 ms)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.warn(`Erro 429 recebido para ${imageUrl}. Tentativa ${attempt} de ${MAX_ATTEMPTS}. Aguardando ${waitTime}ms...`);
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
  
  // Processa cada grupo individualmente
  for (const group of groups) {
    finalOutput += `${group.name}\n`;
    const uploadedLinks = [];
    for (const url of group.urls) {
      console.log(`Processando: ${url}`);
      const imgLink = await uploadImageFromUrl(url);
      if (imgLink) {
        console.log(`Upload realizado: ${imgLink}`);
        // Adiciona as aspas para identificar cada link (opcional)
        uploadedLinks.push(`"${imgLink}"`);
      }
    }
    // Junta os links do grupo separados por vírgula e quebra de linha
    finalOutput += uploadedLinks.join(",\n") + "\n\n";
  }
  
  // Copia a string final para a área de transferência
  clipboardy.writeSync(finalOutput);
  console.log("\nTodos os links foram copiados para a área de transferência:");
  console.log(finalOutput);
}

processGroups();
