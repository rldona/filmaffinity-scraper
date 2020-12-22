const puppeteer = require('puppeteer');

exports.init = async (page, browser) => {
  const result = await page.evaluate(() => {
    // title

    const movieTitle = document.querySelector('[itemprop="name"]') ? document.querySelector('[itemprop="name"]').textContent : '';

    // year

    const reviewYear = document.querySelector('[itemprop="datePublished"]') ? document.querySelector('[itemprop="datePublished"]').textContent : '';

    // duration

    const reviewDuration = document.querySelector('[itemprop="duration"]') ? document.querySelector('[itemprop="duration"]').textContent.split(' ')[0] : '';

    // directors

    let reviewDirectors = [];

    const reviewDirectorsList = document.querySelectorAll('.directors > .credits > .nb > a') || [];

    reviewDirectorsList.forEach(directors => {
      let directorItem = directors.querySelector('span').textContent;
      reviewDirectors.push(directorItem);
    });

    // credits

    let reviewCredits = [];

    const reviewCreditList = document.querySelectorAll('.nb') || [];

    reviewCreditList.forEach(review => {
      let creditItem = review.querySelector('span').textContent;
      reviewCredits.push(creditItem);
    });


    // casting

    let reviewCasting = [];

    const reviewCastingList = document.querySelectorAll('.card-cast > .credits > .nb > a') || [];

    reviewCastingList.forEach(casting => {
      let castingItem = casting.querySelector('span').textContent;
      reviewCasting.push(castingItem);
    });

    // producer

    let reviewProducer = [];

    const reviewProducerList = document.querySelectorAll('.card-producer > .credits > .nb') || [];

    reviewProducerList.forEach(producer => {
      let producerItem = producer.querySelector('span').textContent;
      reviewProducer.push(producerItem);
    });


    // genres

    let reviewGenres = [];

    const reviewGenresList = document.querySelectorAll('.card-genres span') || [];

    reviewGenresList.forEach(genre => {
      reviewGenres.push(genre.textContent);
    });

    // sinopsis

    const reviewDescription = document.querySelector('[itemprop="description"]') ? document.querySelector('[itemprop="description"]').textContent : '-';

    // thumbnail

    const reviewImage = document.querySelector('[itemprop="image"]') ? document.querySelector('[itemprop="image"]').outerHTML.split(' ')[4].replace('src="', '').replace('"', '') : '-';

    // rating average

    const ratingAverage = document.querySelector('#movie-rat-avg') ? document.querySelector('#movie-rat-avg').textContent.split('').filter(word => word !== ' ' && word !== '\n' && word !== ',').toString() : '-';

    // rating count

    const ratingCount = document.querySelector('#movie-count-rat > span') ? document.querySelector('#movie-count-rat > span').textContent : '-';

    // professional review list

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

    // credits configuration

    reviewCredits.shift();

    // TODO: hay que eliminar los generos que se cuelan al final
    reviewCredits = reviewCredits.filter(val => {
      return reviewCasting.indexOf(val) == -1;
    });

    // large thumbnail

    const reviewLargeThumbnail = reviewImage.replace("mmed", "large");

    return {
      title: movieTitle,
      duration: reviewDuration,
      year: reviewYear,
      directors: reviewDirectors,
      credits: reviewCredits,
      casting: reviewCasting,
      producer: reviewProducer,
      genres: reviewGenres,
      sinopsis: reviewDescription,
      thumbnailMedium: reviewImage,
      thumbnailLarge: reviewLargeThumbnail,
      ratingAverage: ratingAverage,
      ratingCount: ratingCount,
      reviewList
    }
  });

  // country

  result.country = await page.$eval('#country-img > img', span => span.getAttribute('title'));

  return result;
}
