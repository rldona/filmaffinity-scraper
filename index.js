const puppeteer = require('puppeteer');
const admin = require("firebase-admin");
const filmaffinityScrapper = require("./filmaffinity-scraper");

const serviceAccount = require("./filmaffinity-api-firebase-adminsdk-hfsxr-99032fbdcb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://filmaffinity-api.firebaseio.com"
});

async function scrappingFilmaffinty (id) {
  const config = {
    db: admin.firestore(),
    headless: true,
    view: {
      width: 1024,
      height: 2500
    },
    language: 'es'
  }

  const urlFilm = `https://www.filmaffinity.com/${config.language}/film${id}.html`;

  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport : { 'width' : config.view.width, 'height' : config.view.height }
  });

  const page = await browser.newPage();

  await page.setViewport({ width: config.view.width, height: config.view.height});
  await page.goto(urlFilm);

  const reviewsRef = config.db.collection(`reviews-${config.language}`);

  // try {

  let error404 = await page.goto(urlFilm);

  if (error404.status() !== 404) {
    await page.waitForSelector('button.sc-ifAKCX', { timeout: 500 });
    await page.click('button.sc-ifAKCX.ljEJIv');
    const review = await filmaffinityScrapper.init(page, browser);
    reviewsRef.doc(`${id}`).set({ id: id, ...review, url: urlFilm });
    console.log(`==> ${id} == ${review.title} | OK <==`);
    console.log(review);
  } else {
    console.log(`==> ${id} | KO <==`);
  }

  // } catch (e) {
  //   console.log(`==> ${id} | KO <==`);
  // }

  await browser.close();
}

(async () => {

  for (let i = 719298; i < 800000; i++) {
    await scrappingFilmaffinty(i);
  }

  console.log('==> Carga completa <==');

  process.exit();

})();
