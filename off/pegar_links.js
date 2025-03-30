//F12 - CONSOLE (PEGAR EMBEDS) - FIXADO JÁ
https://ok.ru/profile/565366943319/video
https://ok.ru/profile/576088845785/video
https://ok.ru/profile/589793268027/video VITORIA MIRANDA 

//DIGITAR ALLOW PARA PODER Clipboard

//NOVO
const videos = [...document.querySelectorAll('a[href*="/video/"]')];
const idsAndTitles = new Map(); // Usamos um Map para evitar duplicatas

videos.forEach(v => {
    const id = v.href.match(/\/video\/(\d+)/)?.[1];
    if (!id) return;

    let title = v.textContent.trim() || v.getAttribute('title') || "Sem título";

    // Se já existe esse ID, verifica se o novo título é mais informativo
    if (idsAndTitles.has(id)) {
        const existingTitle = idsAndTitles.get(id);
        if (existingTitle === "Sem título" && title !== "Sem título") {
            idsAndTitles.set(id, title);
        }
    } else {
        idsAndTitles.set(id, title);
    }
});

const idsAndTitlesArray = Array.from(idsAndTitles.entries());
// const idsAndTitlesArray = Array.from(idsAndTitles.entries().reverse()); // Ordem reversa

idsAndTitlesArray.forEach(([id, title], index) => {
    const number = String(index + 1).padStart(3, '0');
    // console.log(`{ title: "${number}", thumb: "", url: "https://ok.ru/videoembed/${id}", alternative: [] }, title: "${title}",`);
    console.log(`url: "https://ok.ru/videoembed/${id}", title: "${title}",`);
});