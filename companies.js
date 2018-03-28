var express = require('express');
var app = express();

app.route('/test')
    .get(function(req,res){
        res.send("Test Worked");
    });

// Use express to listen to port
var port = process.env.PORT || 8080;

app.listen(port, function () {
 console.log("Server running at port = " + port);
});