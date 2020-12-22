const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const admin = require("firebase-admin");
const app = express();

const serviceAccount = require("./filmaffinity-api-firebase-adminsdk-hfsxr-99032fbdcb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://filmaffinity-api.firebaseio.com"
});

const db = admin.firestore();

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});

require('./routes')(app);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is up a port ${port}!`);
});
