const puppeteer = require('puppeteer');

exports.init = async (page, browser) => {
  const result = await page.evaluate(() => {
    // title
    // TODO: remove el último carcter en blanco y si tuiera
    const movieTitle = document.querySelector('[itemprop="name"]') ? document.querySelector('[itemprop="name"]').textContent : null;

    // year
    const reviewYear = document.querySelector('[itemprop="datePublished"]') ? document.querySelector('[itemprop="datePublished"]').textContent : null;

    // duration
    const reviewDuration = document.querySelector('[itemprop="duration"]') ? document.querySelector('[itemprop="duration"]').textContent.split(' ')[0] : null;

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

    let reviewGenres = [];

    const reviewGenresList = document.querySelectorAll('.card-genres span') || [];

    reviewGenresList.forEach(genre => {
      reviewGenres.push(genre.textContent);
    });

    const genre = reviewGenres[0] || null;

    // sinopsis
    const reviewDescription = document.querySelector('[itemprop="description"]') ? document.querySelector('[itemprop="description"]').textContent : null;

    // thumbnail
    const reviewImage = document.querySelector('[itemprop="image"]') ? document.querySelector('[itemprop="image"]').outerHTML.split(' ')[4].replace('src="', '').replace('"', '') : null;

    // rating average
    const ratingAverage = document.querySelector('#movie-rat-avg') ? parseFloat(document.querySelector('#movie-rat-avg').textContent.split('').filter(word => word !== ' ' && word !== '\n' && word !== ',').toString().replace(',', '.')) : null;

    // rating count
    const ratingCount = document.querySelector('#movie-count-rat > span') ? document.querySelector('#movie-count-rat > span').textContent : null;

    let profesionalReviewsCounter;

    // profesionalReviewsCounter
    if (document.querySelector('.total-abs') !== null) {
      const professionalReviewCount222 = document.querySelector('.total-abs').textContent;

      let countTotalReviews = [];

      const countTotalReviewsList = document.querySelectorAll('.legend-wrapper .leg') || [];

      countTotalReviewsList.forEach(genre => {
        countTotalReviews.push(genre.textContent);
      });

      profesionalReviewsCounter = {
        positive: parseInt(countTotalReviews[0]),
        neutral: parseInt(countTotalReviews[1]),
        negative: parseInt(countTotalReviews[2]),
        total: parseInt(professionalReviewCount222.toString().replace(/\s/g, ''))
      }
    } else {
      profesionalReviewsCounter = null;
    }

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
      duration: parseInt(reviewDuration),
      year: parseInt(reviewYear),
      directors: reviewDirectors,
      credits: reviewCredits,
      casting: reviewCasting,
      producer: reviewProducer,
      genre: genre,
      genres: reviewGenres,
      sinopsis: reviewDescription,
      thumbnail_medium: reviewImage,
      thumbnail_large: reviewLargeThumbnail,
      rating_average: ratingAverage,
      rating_count: parseInt(ratingCount),
      professional_register: profesionalReviewsCounter,
      professional_reviews: reviewList,
    }
  });

  // country
  result.country = await page.$eval('#country-img > img', span => span.getAttribute('title'));

  return result;
}
