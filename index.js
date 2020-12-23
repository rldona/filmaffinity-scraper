const puppeteer = require('puppeteer');
const admin = require("firebase-admin");
const filmaffinityScrapper = require("./filmaffinity-scraper");

const serviceAccount = require("./filmaffinity-api-firebase-adminsdk-hfsxr-99032fbdcb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://filmaffinity-api.firebaseio.com"
});

// TODO: cambiar las variables con film y poner 'media' en su lugar (para que sea agnótico al tipo: movies, shows, documentary, etc)

async function scrappingFilmaffinty (id) {
  const db = admin.firestore();

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

  let reviewsRef = db.collection('reviews');

  try {
    await page.waitForSelector('button.sc-ifAKCX', { timeout: 300 });
    await page.click('button.sc-ifAKCX.ljEJIv');
    const review = await filmaffinityScrapper.init(page, browser);
    reviewsRef.doc(`${config.filmId}`).set({ id: config.filmId, ...review, url: urlFilm });
    console.log(`==> ${config.filmId} == ${review.title} | OK <==`);
  } catch (e) {
    console.log(`==> ${config.filmId} | KO <==`);
  }

  await browser.close();
}

(async () => {

  for (let i = 853177; i < 900000; i++) {
    await scrappingFilmaffinty(i);
  }

  console.log('==> Carga completa <==');

  process.exit();

})();
