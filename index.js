const puppeteer = require('puppeteer');
const admin = require("firebase-admin");
const getProxies = require("get-free-https-proxy");

const filmaffinityScrapper = require("./filmaffinity-scraper");

const serviceAccount = require("./filmaffinity-api-firebase-adminsdk-hfsxr-99032fbdcb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://filmaffinity-api.firebaseio.com"
});

const config = {
  db: admin.firestore(),
  headless: false,
  view: {
    width: 1024,
    height: 2500
  },
  language: 'es',
  range: {
    start: parseInt(process.argv[2]),
    end: parseInt(process.argv[3])
  }
}

const reviewsRef = config.db.collection(`reviews-${config.language}`);

async function scrappingFilmaffinty (proxy, url) {
  const browser = await puppeteer.launch({
    headless: config.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--proxy-server=${proxy.host}:${proxy.port}`
    ]
  });

  console.log(proxy);

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  await page.setViewport({ width: config.view.width, height: config.view.height });

  ////

  // Scrapping only HTML ulta fast ==> 429 error

  await page.setRequestInterception(true);

  page.on('request', (request) => {
      if (request.resourceType() === 'document') {
          request.continue();
      } else {
          request.abort();
      }
  });

  ////

  let review = null;

  let browserLoad = await page.goto(url, { waitUntil: 'load', timeout: 0 });

  console.log(browserLoad.status());

  if (browserLoad.status() === 200) {
    review = await filmaffinityScrapper.init(page, browser);
  }

  await browser.close();

  return {
    data: review,
    status: browserLoad.status()
  };
}

(async () => {

  // DigitalOcean (Doplets 5€)
  // AWS Free

  let url;
  let review;
  let id = config.range.start;

  // get proxy list
  const proxies = await getProxies();

  while (id < config.range.end) {
    url = `https://www.filmaffinity.com/${config.language}/film${id}.html`;

    const randomProxy = proxies[Math.floor(Math.random() * (proxies.length - 0 + 1)) + 0];

    // TODO: sustituir por el fetch/await de URL de la function Firebase y pasar id
    review = await scrappingFilmaffinty(randomProxy, url);

    if (review.status === 429) {
      // Reintentar con el mismo id y con una IP difernete desde la function
      // TODO: sustituir por el fetch/await de URL de la function Firebase y pasar id
      review = await scrappingFilmaffinty(url);
    }

    if (review.status === 404) {
      console.log(`==> ${id} | KO <==`);
      id++;
    }

    if (review.status === 200) {
      console.log(`==> ${id} == ${review.data.title} <==`);
      await reviewsRef.doc(`${id}`).set({ id, ...review, url });
      id++;
    }
  }

  console.log('==> Carga completa <==');

  process.exit(1);

})();
