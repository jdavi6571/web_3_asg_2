var crypto = require('crypto');
var md5 = require('md5');
var mongoose = require('mongoose');
var express = require('express');
var parser = require('body-parser');

mongoose.connect('mongodb://localhost:27017/funwebdev');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connections error'));
db.once('open', function callback() {
    console.log("connected to mongo");
});

var pricesSchema = new mongoose.Schema({
    _id: Number,
    date: Date,
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



app.route('/stocks/:symbol/:month')
    .get(function (req, resp) {
        
        Price.find( {name: req.params.symbol, date: {"$gte": new Date(2017,req.params.month, 0 ),
        "$lt": new Date(2017, req.params.month, 30) }} , { date: 1, open: 1, high: 1,
    low: 1,  close: 1, volume: 1, name: 1}, 
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
let port = 5000;
app.listen(port, function () {
 console.log("Server running at port= " + port);
});