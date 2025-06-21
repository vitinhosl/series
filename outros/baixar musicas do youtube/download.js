const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const replace = false;
const musicPath = 'musicas';

const ytdlpPath = path.join(__dirname, 'yt-dlp.exe');
const musicasDir = path.join(__dirname, musicPath);

const videoURLs = [
  'https://www.youtube.com/PLAYLIST'
];

if (!fs.existsSync(musicasDir)) {
  fs.mkdirSync(musicasDir);
}

videoURLs.forEach((videoURL) => {
  // Monta o nome final com base no título do vídeo
  const outputTemplate = path.join(musicPath, '%(title)s.%(ext)s');

  // Verifica se o arquivo já existe, se sim e replace for false, pula
  const tempName = path.join(musicasDir, '%(title)s.mp3');
  if (fs.existsSync(tempName) && !replace) {
    console.log(`Arquivo ${tempName} já existe, pulando download.`);
    return;
  }

  // Inicia o processo de download
  const downloadProcess = spawn(ytdlpPath, [
    videoURL,
    '--cookies', 'cookies.txt',
    '-x',
    '--audio-format', 'mp3',
    '-o', outputTemplate
  ]);

  downloadProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  downloadProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  downloadProcess.on('close', (code) => {
    if (code === 0) {
      console.log(`Download de ${videoURL} finalizado!`);
    } else {
      console.error(`Erro no yt-dlp para ${videoURL}. Código: ${code}`);
    }
  });
});
