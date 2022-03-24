var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const res = require('express/lib/response');
var MongoClient = require('mongodb').MongoClient;
var connectionString = 'mongodb+srv://<username>:<password>@cluster0.mlnc0.mongodb.net/sample_restaurants?retryWrites=true&w=majority';
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.set('view engine','ejs');
var db = {};


MongoClient.connect(connectionString,{useUnifiedTopology: true}).then(client => {
    console.log('Connected to Database');
    db = client.db('star-wars-quotes');
    var quotesCollection = db.collection('quotes');
    });

app.get('/',(req,res)=>
{
//  res.send('Hello world');
//  res.sendFile(__dirname+'/index.html');
 db.collection('quotes').find().toArray().then(results =>
    {
        res.render('index.ejs',{quotes : results});
        console.log(results);
    }).catch(error=> console.error(error));
    
});

app.post('/quotes', (req, res) => {
        db.collection('quotes').insertOne(req.body).then(result=>
            {
                res.redirect('/');
                console.log(result);
            }).catch(error=>{console.log(error)});
        // console.log('insertion fait');
        // console.log(req.body);
    });

app.put('/quotes', (req, res) => {
    
    db.collection('quotes').findOneAndUpdate(
        {name: req.body.name},
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
        
    ).then(result=>{  res.redirect('/'); console.log(req.body.name);})
    .catch(error=> console.error(error))
});

app.delete('/quotes',(req,res)=>
{
    console.log(req.body.name);
    db.collection('quotes').deleteOne(
        {name: req.body.name}
        
    )
    .then(result=>{
    if(result.deletedCount ===0){
        //return res.json('No quote to delete');
        
        console.log("No quote to delete");
    }
    else
    {
        console.log("deleted quote");
    }
    res.redirect('/');
})
    .catch(error=> console.error(error))
});

app.listen(3000,function loadserver()
{
    console.log('listening on 3000');
});