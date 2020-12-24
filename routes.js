const admin = require("firebase-admin");

const db = admin.firestore();

////// Catalogo de consultas //////

// listado de años descendente
// .orderBy('review.year', 'desc')
// .orderBy('review.year', 'asc')

// búsqueda por un término
// .where('review.title', '==', 'Caos en la ciudad (TV)')

// .where('genre', '==', 'Serie de TV')
// .where('genre', '!=', 'Serie de TV')

module.exports = function(app) {

  ////////////
  // MOVIES //
  ////////////

  //
  // /movies
  //
  app.get('/movies', async (req, res) => {
    const query = req.query.q;
    const language = req.params.language;

    db.collection(`reviews-${language}`)
      .where('genre', '!=', ['Serie de TV'])
      .limit(10)
      .get()
      .then((snapshot) => {
        let reviewList = [];
        snapshot.forEach((doc) => {
          if (doc.data().genres[0] !== 'Serie de TV') {
            reviewList.push(doc.data());
          }
        });
        res.json(reviewList);
      })
      .catch((err) => {
        console.log('Error getting documents', err);
      });
  });

  //
  // /movie/{movie_id}
  //
  app.get('/movie/:id', async (req, res) => {
    const id = req.params.id;
    const language = req.params.language;

    db.collection(`reviews-${language}`).doc(`${id}`).get().then(doc => {
      if (!doc.exists) res.json({});
      res.json(doc.data());
    })
  });

  //
  // /movie/{movie_id}/reviews
  //
  app.get('/movie/:id/reviews', async (req, res) => {
    const id = req.params.id;
    const language = req.params.language;

    db.collection(`reviews-${language}`).doc(`${id}`).get().then(doc => {
      if (!doc.exists) res.json({});
      res.json({
        id: doc.data().id,
        reviews: doc.data().review_list
      });
    })
  });

  ////////////
  //   TV   //
  ////////////

  app.get('/tv', async (req, res) => {
    const query = req.query.q;
    const language = req.params.language;

    db.collection(`reviews-${language}`)
      .where('genre', '==', ['Serie de TV'])
      .limit(10)
      .get()
      .then((snapshot) => {
        let reviewList = [];
        snapshot.forEach((doc) => {
          reviewList.push(doc.data());
        });
        res.json(reviewList);
      })
      .catch((err) => {
        console.log('Error getting documents', err);
      });
  });

  app.get('/tv/:id', async (req, res) => {
    const id = req.params.id;
    const language = req.params.language;

    db.collection(`reviews-${language}`).doc(`${id}`).get().then(doc => {
      if (!doc.exists) res.json({});
      res.json(doc.data());
    })
  });

    //
  // /movie/{movie_id}/reviews
  //
  app.get('/tv/:id/reviews', async (req, res) => {
    const id = req.params.id;
    const language = req.params.language;

    db.collection(`reviews-${language}`).doc(`${id}`).get().then(doc => {
      if (!doc.exists) res.json({});
      res.json({
        id: doc.data().id,
        reviews: doc.data().review_list
      });
    })
  });

  /////////////
  // GENERAL //
  /////////////

  //
  // /search?q=query
  //
  app.get('/search', async (req, res) => {
    const query = req.query.q;
    const language = req.params.language;

    db.collection(`reviews-${language}`)
      .where('title', '==', query)
      .limit(10)
      .get()
      .then((snapshot) => {
        let reviewList = [];
        snapshot.forEach((doc) => {
          reviewList.push(doc.data());
        });
        res.json(reviewList);
      })
      .catch((err) => {
        console.log('Error getting documents', err);
      });
  });

  //
  // Pagitation
  //
  app.get('/media', async (req,res) => {
    const type   = req.query.type || 'movies';
    const filter = req.query.filter || 'title';
    const limit  = parseInt(req.query.limit) || 50;
    const page   = parseInt(req.query.page) || 0;

    let mediaList = [];

    if (page === 0) {
      db.collection(type)
        .orderBy(filter)
        .limit(limit)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            mediaList.push(doc.data());
          });
          res.json(mediaList);
        })
        .catch((err) => {
          console.log('Error getting documents', err);
        });
    } else {
      const max      = limit * page;
      const first    = db.collection(type).orderBy(filter).limit(max);
      const snapshot = await first.get();

      let last = snapshot.docs[snapshot.docs.length - 1];

      db.collection(type)
        .orderBy(filter)
        .limit(limit)
        .startAfter(last)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            mediaList.push(doc.data());
          });
          res.json(mediaList);
        })
        .catch((err) => {
          console.log('Error getting documents', err);
        });
    }

  });

}
