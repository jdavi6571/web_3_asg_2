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

var portfoliosSchema = new mongoose.Schema({
    id: Number,
    symbol: String,
    user: Number,
    owned: Number
});

var Portfolio = mongoose.model('Portfolio', portfoliosSchema);

var app = express();

// tell node to use json and HTTP header features in body-parser
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));

app.route('/portfolio/user/:user')
    .get(function (req,resp) {
        Portfolio.find( {user: req.params.user} , {id: 1, symbol:1, user: 1, owned: 1}, 
         function(err,data){
        if(err){
            resp.json({ message: 'Unable to connect to users' });
        }
        else
        {
            console.log(req.params.user);
            resp.json(data);
        }
    });
});
 

app.route('/portfolio/user/percentage/:user')
  .get(function (req, resp) {
        let l_userID = parseInt(req.params.user);
        Portfolio.aggregate([ 

            { $group: { 
                _id: "$user", 
                totalOwned: { $sum: "$owned" } 
                      } 
            },
            { $group: {
                _id: "$symbol",
                totalPercent: { $divide: [ "$owned", "totalOwned" ] }
                     }   
            },
            { $match: {_id: l_userID} 
            },
            { $project: {
                "_id":1, "totalPercent": 1
            }
            }
            ], 
    function(err,data){
        if(err){
            resp.json({ message: 'Unable to connect to users' });
        }
        else
        {
            console.log(req.params.user);
            resp.json(data);
        }
    });
});

// Use express to listen to port
var port = process.env.PORT || 8080;
app.listen(port, function () {
 console.log("Server running at port = " + port);
});