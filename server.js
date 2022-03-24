const res = require('express/lib/response');
var express = require('express');
const path = require('path');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
// Variables d'environnement
var connectionString = process.env.CONNECTION_STRING;
var mode = process.env.NODE_ENV;
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/frontend/dist/frontend'));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
var db = {};

app.get('/*', function (request, response) {
    response.sendFile(path.join(__dirname + '/frontend/dist/frontend/index.html'));
});


MongoClient.connect(connectionString, { useUnifiedTopology: true }).then(client => {
    console.log('Connected to ' + mode + ' database ');
    db = client.db('sample_restaurants');
    var restaurantsCollection = db.collection('restaurants');
});

// app.get('/', (req, res) => {
//     //  res.send('Hello world');
//     //  res.sendFile(__dirname+'/index.html');
//     db.collection('restaurants').find().toArray().then(results => {
//         res.render('index.ejs', { quotes: results });
//         console.log(results);
//     }).catch(error => console.error(error));

// });

app.post('/restaurants', (req, res) => {
    db.collection('restaurants').insertOne(req.body).then(result => {
        res.redirect('/');
        console.log(result);
    }).catch(error => { console.log(error) });
    // console.log('insertion fait');
    // console.log(req.body);
});

app.put('/restaurants', (req, res) => {

    db.collection('restaurants').findOneAndUpdate(
        { name: req.body.name },
        {
            $set:
            {
                name: req.body.namenode,
                quote: req.body.quote
            }
        },
        {
            upsert: true
        }

    ).then(result => { res.redirect('/'); console.log(req.body.name); })
        .catch(error => console.error(error))
});

app.delete('/restaurants', (req, res) => {
    console.log(req.body.name);
    db.collection('restaurants').deleteOne(
        { name: req.body.name }

    )
        .then(result => {
            if (result.deletedCount === 0) {
                //return res.json('No quote to delete');

                console.log("No restaurant to delete");
            }
            else {
                console.log("deleted quote");
            }
            res.redirect('/');
        })
        .catch(error => console.error(error))
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function loadserver() {
    console.log('Mode: ' + mode);
    console.log(`Launching the app ${process.env.APP_NAME}`);
    console.log('Listening on port: ' + port);
    console.log('Connecting to ' + mode + ' database...');
});