const puppeteer = require('puppeteer');
const admin = require("firebase-admin");
const filmaffinityScrapper = require("./filmaffinity-scraper");

const serviceAccount = require("./filmaffinity-api-firebase-adminsdk-hfsxr-99032fbdcb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://filmaffinity-api.firebaseio.com"
});

const config = {
  db: admin.firestore(),
  headless: true,
  view: {
    width: 1024,
    height: 2500
  },
  language: 'es'
}

const reviewsRef = config.db.collection(`reviews-${config.language}`);

async function scrappingFilmaffinty (id) {
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    browserContext: "default",
  });

  const page = await browser.newPage();
  await page.setViewport({ width: config.view.width, height: config.view.height });

  const url = `https://www.filmaffinity.com/${config.language}/film${id}.html`;

  let browserLoad = await page.goto(url);

  console.log(browserLoad.status());

  if (browserLoad.status() !== 404) {
    await page.goto(url);
    await page.waitForSelector('button.sc-ifAKCX', { timeout: 0 });
    await page.click('button.sc-ifAKCX.ljEJIv');
    const review = await filmaffinityScrapper.init(page, browser);
    await reviewsRef.doc(`${id}`).set({ id, ...review, url });
    console.log(`==> ${id} == ${review.title} | OK <==`);
  } else {
    console.log(`==> ${id} | KO <==`);
  }

  await browser.close();
}

(async () => {

  for (let id = 741504; id < 800000; id++) {
    await scrappingFilmaffinty(id);
  }

  console.log('==> Carga completa <==');

  process.exit(1);

})();
