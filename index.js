
var express = require('express');
var http = require('http');
var MongoNative = require('mongo-native');
var app = express();


app.set('views', './');

app.use(express.static('./'));

function atualizaBanco (resp) {
		var data = '';

 	    resp.on('data', function (chunk) {
 	    	data += chunk;
  		});

  		resp.on('end', function () {
  			data = JSON.parse(data);
  		})
		
		.on('error', function(e) {
  	  		console.log("Got error: " + e.message);
		})		
	}


app.get('/', function(req, res) {
	http
	.get("http://sistema.instakioski.com.br/bling.php", atualizaBanco) 
	.then(function (){res.render('index.html')};

});
app.get('/getData', function(req, res){
	http.get("http://sistema.instakioski.com.br/bling.php", function(resp) {
		var data = '';

 	    resp.on('data', function (chunk) {
 	    	data += chunk;
  		});

  		resp.on('end', function () {
  			data = JSON.parse(data);
  			res.json(data);
  		})
		
		})
		.on('error', function(e) {
  	  		console.log("Got error: " + e.message);
		});
});

MongoNative.connect('mongodb://localhost/envia').then(function (db){
	global.db = db;
	app.listen(5000);
})


