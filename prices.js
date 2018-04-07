var crypto = require('crypto');
var md5 = require('md5');
var mongoose = require('mongoose');
var express = require('express');
var parser = require('body-parser');

mongoose.connect('mongodb://test_user:password@ds014118.mlab.com:14118/web_3_asg_2_mdb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connections error'));
db.once('open', function callback() {
    console.log("connected to mongo");
});

var pricesSchema = new mongoose.Schema({
    _id: Number,
    date: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number,
    name: String
});

var Price = mongoose.model('Price', pricesSchema);

var app = express();

// tell node to use json and HTTP header features in body-parser
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

app.route('/prices/:symbol')
    .get(function (req,resp) {
        Price.find( {name: req.params.symbol} , {date: 1}, 
         function(err,data){
        if(err){
            resp.json({ message: 'Unable to connect to users' });
        }
        else
        {
            resp.json(data);
        }
    });
  });
  
app.route('/prices/info/:symbol')
    .get(function (req,resp) {
        Price.find({name: req.params.symbol}).
            select('date open high low close volume').sort({"date": -1}).limit(1).exec(
         function(err,data){
        if(err){
            resp.json({ message: 'Unable to connect to users' });
        }
        else
        {
            resp.json(data);
        }
    });
  });

app.route('/prices/stocks/:symbol/:month')
    .get(function (req, resp) {
        let startDay = new Date(2017,req.params.month,1);
        let endDay = new Date(2017,req.params.month+1,0);
        Price.find( {name: req.params.symbol, date: {"$gte":startDay,"$lte": endDay }} 
        , { date: 1, open: 1, high: 1,
    low: 1,  close: 1, volume: 1, name: 1}, 
    function(err,data){
        if(err){
            resp.json({ message: 'Unable to connect to users' });
        }
        else
        {
            console.log(startDay + "  /             End Day: " + endDay  )
            resp.json(data);
        }
    });
});


app.route('/prices/stocks/information/:symbol/:date')
    .get(function (req, resp) {
        
        Price.find( {name: req.params.symbol, date: req.params.date}, 
            {open: 1, high: 1,
                low: 1,  close: 1, volume: 1}, 
    function(err,data){
        if(err){
            resp.json({ message: 'Unable to connect to users' });
        }
        else
        {
            console.log(req.params.month);
            resp.json(data);
        }
        });
});

app.route('/prices/stocks/average/close/:symbol')
    .get(function (req, resp) {
        Price.aggregate([ 
            { $match: { name: req.params.symbol } } , 
            { $group: { 
                _id: {$substr: ['$date',5,2]}, 
                avgClose: { $avg: "$close" } 
                      } 
            },
            {  $sort: { "_id": 1, "avgClose": 1 } } ], 
    function(err,data){
        if(err){
            resp.json({ message: 'Unable to connect to users' });
        }
        else
        {
            resp.json(data);
        }
    });
});


// Use express to listen to port
var port = process.env.PORT || 8080;
app.listen(port, function () {
 console.log("Server running at port = " + port);
});