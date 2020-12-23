const admin = require("firebase-admin");

const db = admin.firestore();

////// Catalogo de consultas //////

// listado de años descendente
// .orderBy('review.year', 'desc')
// .orderBy('review.year', 'asc')

// búsqueda por un término
// .where('review.title', '==', 'Caos en la ciudad (TV)')

module.exports = function(app) {

  app.get('/ping', (req, res) => {
    res.json('pong');
  });

  //
  // /reviews
  //
  app.get('/reviews', async (req, res) => {
    const query = req.query.q;

    db.collection('reviews')
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
  // /reviews
  //
  app.get('/review/:id', async (req, res) => {
    const id = req.params.id;
    db.collection('reviews').doc(`${id}`).get().then(doc => {
      res.json(doc.data());
    })
  });

  //
  // /search?q=query
  //
  app.get('/search', async (req, res) => {
    const query = req.query.q;

    db.collection('reviews')
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
