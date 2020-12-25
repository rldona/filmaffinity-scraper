const puppeteer = require('puppeteer');

exports.init = async (page, browser) => {
  const result = await page.evaluate(() => {
    // title
    // TODO: remove el último carcter en blanco y si tuiera
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

    let reviewGenres = [];

    const reviewGenresList = document.querySelectorAll('.card-genres span') || [];

    reviewGenresList.forEach(genre => {
      reviewGenres.push(genre.textContent);
    });

    let genre = null;

    if (reviewGenres.length === 0) {
      reviewGenres = [];
    } else {
      genre = reviewGenres[0];
    }

    // sinopsis
    const reviewDescription = document.querySelector('[itemprop="description"]') ? document.querySelector('[itemprop="description"]').textContent : '';

    // thumbnail
    const reviewImage = document.querySelector('[itemprop="image"]') ? document.querySelector('[itemprop="image"]').outerHTML.split(' ')[4].replace('src="', '').replace('"', '') : '';

    // rating average
    const ratingAverage = document.querySelector('#movie-rat-avg') ? document.querySelector('#movie-rat-avg').getAttribute('content') : '';

    // rating count
    const ratingCount = document.querySelector('#movie-count-rat > span') ? document.querySelector('#movie-count-rat > span').textContent : '';

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

    reviewList = reviewList.length > 0 ? reviewList : [];

    if (reviewCredits.length > 0 && reviewCasting.length > 0) {
      // credits configuration
      reviewCredits.shift();

      // TODO: hay que eliminar los generos que se cuelan al final
      reviewCredits = reviewCredits.filter(val => {
        return reviewCasting.indexOf(val) == -1;
      });
    }

    return {
      title: movieTitle,
      duration: reviewDuration,
      year: reviewYear,
      directors: reviewDirectors,
      credits: reviewCredits,
      casting: reviewCasting,
      producer: reviewProducer,
      genre: genre,
      genres: reviewGenres,
      sinopsis: reviewDescription,
      thumbnail_medium: reviewImage,
      rating_average: ratingAverage,
      rating_count: ratingCount,
      professional_register: profesionalReviewsCounter,
      professional_reviews: reviewList,
    }
  });

  result.country = await page.$eval('#country-img > img', span => span.getAttribute('title')) || null;
  result.title = result.title !== '' ? result.title : null;
  result.duration = result.duration !== '' ? parseInt(result.duration) : null;
  result.year = result.year !== '' ? parseInt(result.year) : null;
  result.directors = result.directors.length > 0 ? result.directors : null;
  result.credits = result.credits.length > 0 ? result.credits : null;
  result.casting = result.casting.length > 0 ? result.casting : null;
  result.producer = result.producer.length > 0 ? result.producer : null;
  result.genre = result.genre !== '' ? result.genre : null;
  result.genres = result.genres.length > 0 ? result.genres : null;
  result.sinopsis = result.sinopsis !== '' ? result.sinopsis.replace('(FILMAFFINITY)', '') : null;
  result.thumbnail_medium = result.thumbnail_medium !== '' ? result.thumbnail_medium : null;
  result.thumbnail_large = result.thumbnail_medium ? result.thumbnail_medium.replace("mmed", "large") : null;
  result.rating_average = result.rating_average !== '' ? parseFloat(result.rating_average) : null;
  result.rating_count = result.rating_count ? parseInt(result.rating_count) : null;
  result.professional_reviews = result.professional_reviews.length > 0 ? result.professional_reviews : null;

  return result;
}
