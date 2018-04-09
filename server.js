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

var portfoliosSchema = new mongoose.Schema({
    id: Number,
    symbol: String,
    user: Number,
    owned: Number
});

var Portfolio = mongoose.model('Portfolio', portfoliosSchema);

var usersSchema = new mongoose.Schema({
    _id: Number,
    id: Number,
    first_name: String,
    last_name: String,
    email: String,
    salt: String,
    password: String
});

var User = mongoose.model('User', usersSchema);

var app = express();

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

app.route('/users/:email/:password')
    .get(function (req, resp) {
        
              
                  User.find( {email: req.params.email}, { salt: 1, password: 1},
                    function(err, data){
                                  {
                     if(err){
                          resp.json({ message: 'Unable to connect to users' });
                     }
                     else {

                    var saltedHash = crypto.createHash('md5').update(req.params.password + data[0].salt).digest('hex');
                    
                    console.log("Compared pass: " + data[0].password);
                    console.log("Salted hash: " + saltedHash);
                    queryChecker(saltedHash);
  
                     }
                    }
         
                    
        });
               function queryChecker(saltedHash){
                   User.find( {password: saltedHash}, { id: 1, first_name: 1, last_name: 1}, 
                        function(err, data)
                        {
                           if(err){
                                 resp.json({ message: 'Wrong password' });
                            }
                            else {
                                resp.json(data);
                                console.log(data);
                            }
                            });
               }
    });
    
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
        let startDay = new Date(2017,req.params.month,1).toISOString();
        let endDay = new Date(2017,req.params.month+1,0).toISOString();
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
 

app.get('/portfolio/percentage/:user', function (req,resp)
  {
  var parsedUser = parseInt(req.params.user);
      
    // use mongoose to retrieve all books from Mongo
  Portfolio.aggregate([
      { $match: {user: parsedUser} }, 
      { $group: { _id:"$symbol", total:{$sum: "$owned"}} }]
      ).exec( function(err, data) {
  if (err) {
  resp.json({ message: 'Unable to connect to portfolios' });

  } else {

    var totalS = 0; 
        for (let x in data){
            totalS += data[x].total;
        }
        var y =0;
    for (let x in data){
        
        data[x].total = (data[x].total/totalS);
         y +=data[x].total ;
    }
      resp.json(data);
    }
  }); 
 
  }
);



// Use express to listen to port
var port = process.env.PORT || 8080;
app.listen(port, function () {
 console.log("Server running at port = " + port);
});