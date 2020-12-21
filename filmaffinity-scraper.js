const puppeteer = require('puppeteer');

exports.init = async (page, url) => {
  const URL_PAGE = url;

  // go to Filmaffinity page
  await page.goto(URL_PAGE);

  await page.waitForSelector('button.sc-ifAKCX')
  await page.click('button.sc-ifAKCX.ljEJIv');

  await page.waitForSelector('#header-top #top-search-input')
  await page.click('#header-top #top-search-input')

  await page.$eval('#header-top #top-search-input', (el, searchTerm) => el.value = searchTerm, searchTerm);
  await page.click('#header-top #button-search')

  await page.waitForSelector('#title-result > .z-search > .se-it:nth-child(2) > .fa-shadow-nb > .movie-card > .mc-info-container > .mc-title > a')
  await page.click('#title-result > .z-search > .se-it:nth-child(2) > .fa-shadow-nb > .movie-card > .mc-info-container > .mc-title > a')

  await page.waitForSelector('.movie-disclaimer');

  const result = await page.evaluate(() => {

    console.log(document);

    const movieTitle = document.querySelector('h1 span') ? document.querySelector('h1 span').textContent : '';
    const reviewDescription = document.querySelector('[itemprop="description"]') ? document.querySelector('[itemprop="description"]').textContent : '';
    const reviewImage = document.querySelector('[itemprop="image"]') ? document.querySelector('[itemprop="image"]').outerHTML.split(' ')[4].replace('src="', '').replace('"', '') : '';
    const ratingAvergae = document.querySelector('#movie-rat-avg') ? document.querySelector('#movie-rat-avg').textContent.split('').filter(word => word !== ' ' && word !== '\n' && word !== ',').toString() : '0';
    const ratingCount = document.querySelector('#movie-count-rat > span') ? document.querySelector('#movie-count-rat > span').textContent : '0';

    const professionalReviewList = document.querySelectorAll('#pro-reviews li') || [];

    let reviewList = [];

    professionalReviewList.forEach(review => {
      let reviewBody = review.querySelector('[itemprop="reviewBody"]');
      let reviewAuthor = review.querySelector('.pro-crit-med');
      let reviewEvaluation = review.querySelector('.pro-crit-med > i');

      if (reviewBody && reviewAuthor) {
        reviewList.push({
          body: reviewBody.textContent,
          author: reviewAuthor.textContent,
          evaluation: reviewEvaluation.outerHTML.split(' ')[5].replace('"', '')
        });
      }
    });

    return {
      title: movieTitle,
      sinopsis: reviewDescription,
      thumbnail: reviewImage,
      ratingAvergae: ratingAvergae,
      ratingCount: ratingCount,
      reviewList
    }
  });

  await browser.close();

  return result;
}
