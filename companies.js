var express = require('express');
var app = express();

// Use express to listen to port
var port = process.env.PORT || 8080;

app.route('/test')
    .get(function(req,res){
        res.send("Test Worked");
    });



app.listen(port, function () {
 console.log("Server running at port = " + port);
});