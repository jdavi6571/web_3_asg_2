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

var companiesSchema = new mongoose.Schema({
    _id: Number,
    symbol: String,
    name: String,
    sector: String,
    subindustry: String,
    address: String,
    date_added: Date,
    CIK: Number,
    frequency: Number
});

var Company = mongoose.model('Company', companiesSchema);

var app = express();

// tell node to use json and HTTP header features in body-parser
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));



app.route('/companies/stocks/:symbol')
    .get(function (req, resp) {
        
        
        
                  Company.find( {symbol: req.params.symbol}, { _id: 1, symbol: 1, name: 1,
                  sector: 1, subindustry: 1, address: 1, date_added: 1, CIK: 1, frequency: 1},
                    function(err, data){
                                  {
                     if(err){
                          resp.json({ message: 'Unable to connect to users' });
                     }
                     else {
                  resp.json(data);
  
                     }
                    }
         
                    
        });
    });


app.route('/companies/all')
    .get(function (req, resp) {
        
        Company.find({}, {symbol: 1, name: 1},function(err, data) {
            {
                if(err){
                    resp.json({ message: 'Unable to connect to users' });
                    
                }
                else {
                    resp.json(data);
                }
            }
        });
    });


// Use express to listen to port
var port = process.env.PORT || 8080;
app.listen(port, function () {
 console.log("Server running at port = " + port);
});