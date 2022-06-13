const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');


const admin = require("firebase-admin");
require('dotenv').config()
console.log(process.env.DB_PASS)

const serviceAccount = require("./configs/burj-al-arab-2cffd-firebase-adminsdk-gqt8k-6bf1f6f4ef.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const app = express()
app.use(cors());
app.use(bodyParser.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmxdm.mongodb.net/burjAllArab?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const bookings = client.db("burjAllArab").collection("bookings");
  // console.log("'Db connected successfully");
app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result =>{
        res.send(result.acknowledged)
    })
    console.log(newBooking);
})


app.get('/bookings', (req, res) => {
  const bearer = req.headers.authorization;
  if(bearer && bearer.startsWith('Bearer ')){
    const idToken = bearer.split(' ')[1];
  admin.auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      let tokenEmail = decodedToken.email;
      let queryEmail = req.query.email;
      console.log(tokenEmail, queryEmail);
      if (tokenEmail == queryEmail){
        bookings.find({email: queryEmail})
        .toArray((err, documents) => {
          res.send(documents);
        })
      }
      else {
        res.status(401).send('Un-authorised Acces')
      }
    })
    .catch((error) => {
      res.status(401).send('Un-authorised Access')
    });

  }
   else {
    res.status(401).send('Un-authorised Access')
   }
})

});

app.get('/', (req, res) => {
  res.send("Md. Ariful Islam");
})

app.listen(4000)
