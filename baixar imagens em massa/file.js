const fs = require('fs');
const axios = require('axios');

async function downloadFiles(indice) {
  const url = `https://web.whatsapp.com/emoji/v1/16/0/1/sprite/w/50/${indice}.webp`;
  const caminhoArquivo = `emoji_${indice}.webp`;
  
  try {
    // Faz a requisição e configura a resposta como stream
    const resposta = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    // Cria uma stream de escrita para salvar o arquivo
    const escritor = fs.createWriteStream(caminhoArquivo);
    
    // Encaminha os dados para o arquivo
    resposta.data.pipe(escritor);
    
    return new Promise((resolve, reject) => {
      escritor.on('finish', () => {
        console.log(`Imagem ${indice} baixada com sucesso.`);
        resolve();
      });
      escritor.on('error', (erro) => {
        console.error(`Erro ao salvar a imagem ${indice}:`, erro);
        reject(erro);
      });
    });
    
  } catch (erro) {
    console.error(`Erro ao baixar a imagem ${indice} de ${url}:`, erro);
  }
}

async function downloadAllFiles() {
  for (let i = 0; i <= 147; i++) {
    await downloadFiles(i);
  }
}

downloadAllFiles();
