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

  app.get('/reviews', async (req, res) => {
    let reviewList = [];

    db.collection('filmaffinity-media-list')
      .where('review.title', '==', 'Caos en la ciudad (TV)')
      .limit(100)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          reviewList.push(doc.data().review.year);
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
