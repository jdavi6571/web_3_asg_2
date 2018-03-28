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

// tell node to use json and HTTP header features in body-parser
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));


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






// Use express to listen to port
let port = 8080;
app.listen(port, function () {
 console.log("Server running at port= " + port);
});