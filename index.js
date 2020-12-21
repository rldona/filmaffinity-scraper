const puppeteer = require('puppeteer');
const admin = require("firebase-admin");

const serviceAccount = require("./filmaffinity-api-firebase-adminsdk-hfsxr-99032fbdcb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://filmaffinity-api.firebaseio.com"
});

const db = admin.firestore();

// TODO: cambiar las variables con film y poner 'media' en su lugar (para que sea agnótico al tipo: movies, shows, documentary, etc)

async function scrappingFilmaffinty (id) {
  let config = {
    headless: true,
    viewDeminsions: {
      width: 1024,
      height: 1800
    },
    filmId: id
  }

  const urlFilm = `https://www.filmaffinity.com/es/film${config.filmId}.html`;

  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport : { 'width' : config.viewDeminsions.width, 'height' : config.viewDeminsions.height }
  });

  const page = await browser.newPage();

  await page.setViewport({ width: config.viewDeminsions.width, height: config.viewDeminsions.height});
  await page.goto(urlFilm);

  try {
    await page.waitForSelector('button.sc-ifAKCX', { timeout: 5000 });
    console.log(`==> ${config.filmId} | Found !!<==`);
    db.collection('filmaffinity-id-list').doc(`${config.filmId}`).set({ id: config.filmId, url: urlFilm });
  } catch (e) {
    if (config.filmId % 100 === 0) {
      console.log(`==> ${config.filmId} | KO <==`);
    }
  }

  await browser.close();
}

(async () => {

  // hasta  5000 ==> KO
  // hasta 10000 ==> KO
  // hasta 15000 ==> KO
  // hasta 17000 ==> KO
  // hasta 18000 ==> KO
  // hasta 30700 ==> KO
  // hasta 32700 ==> KO

  const initScraping = 32700;

  // Busca 10M de posible películas, series, documentales, etc
  for (let i = initScraping; i < 10000000; i++) {
    await scrappingFilmaffinty(i);
  }

  // await scrappingFilmaffinty(134556);

})();
