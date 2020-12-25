const puppeteer = require('puppeteer');

exports.init = async (page, browser) => {
  const result = await page.evaluate(async () => {
    const movieTitle = document.querySelector('[itemprop="name"]') ? document.querySelector('[itemprop="name"]').textContent : '';
    const reviewYear = document.querySelector('[itemprop="datePublished"]') ? document.querySelector('[itemprop="datePublished"]').textContent : '';
    const reviewDuration = document.querySelector('[itemprop="duration"]') ? document.querySelector('[itemprop="duration"]').textContent : '';
    const reviewDescription = document.querySelector('[itemprop="description"]') ? document.querySelector('[itemprop="description"]').textContent : '';
    const reviewImage = document.querySelector('[itemprop="image"]') ? document.querySelector('[itemprop="image"]').outerHTML.split(' ')[4].replace('src="', '').replace('"', '') : '';
    const ratingAverage = document.querySelector('#movie-rat-avg') ? document.querySelector('#movie-rat-avg').getAttribute('content') : '';
    const ratingCount = document.querySelector('#movie-count-rat > span') ? document.querySelector('#movie-count-rat > span').textContent : '';

    const createList = async (docList) => {
      let list = [];
      docList.forEach(docs => {
        if (docs.querySelector('span')) {
          let docItem = docs.querySelector('span').textContent;
          list.push(docItem);
        }
      });
      return list;
    }

    const reviewDirectors = await createList(document.querySelectorAll('.directors > .credits > .nb > a'));
    const reviewCredits = await createList(document.querySelectorAll('.nb'));
    const reviewCasting = await createList(document.querySelectorAll('.card-cast > .credits > .nb > a'));
    const reviewProducer = await createList(document.querySelectorAll('.card-producer > .credits > .nb'));

    let reviewGenres = [];

    const reviewGenresList = document.querySelectorAll('.card-genres span');

    if (reviewGenresList && reviewGenresList.length > 0) {
      reviewGenresList.forEach(genre => {
        reviewGenres.push(genre.textContent);
      });
    }

    let genre = null;

    if (reviewGenres.length === 0) {
      reviewGenres = [];
    } else {
      genre = reviewGenres[0];
    }

    ////

    let profesionalReviewsCounter;

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

    ////

    const professionalReviewList = document.querySelectorAll('#pro-reviews li');

    let reviewList = [];

    if (professionalReviewList.length > 0) {
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
    }

    ////

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
      professional_reviews: reviewList
    }
  });

  if (result.credits.length > 0 && result.casting.length > 0) {
    // credits configuration
    result.credits.shift();

    // TODO: hay que eliminar los generos que se cuelan al final
    result.credits = result.credits.filter(val => {
      return result.casting.indexOf(val) == -1;
    });

    result.credits = result.credits.filter(val => {
      return result.producer.indexOf(val) == -1;
    });
  }

  const hasCountryImg = await page.$('#country-img > img');

  result.title = result.title !== '' ? result.title : null;
  result.duration = result.duration !== '' ? parseInt(result.duration.split(' ')[0]) : null;
  result.year = result.year !== '' ? parseInt(result.year) : null;
  result.country = hasCountryImg ? await page.$eval('#country-img > img', span => span.getAttribute('title')) : null;
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
