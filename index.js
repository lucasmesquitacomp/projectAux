
var express = require('express');
var http = require('http');
var MongoNative = require('mongo-native');
var app = express();


app.set('views', './');

app.use(express.static('./'));

function atualizaBanco (resp) {
		var arrayRet = '';

 	    resp.on('data', function (chunk) {
 	    	arrayRet += chunk;
  		});

  		resp.on('end', function () {
  			arrayRet = JSON.parse(arrayRet);
  			res.json(arrayRet);
  		})
		
		resp.on('error', function(e) {
  	  		console.log("Got error: " + e.message);
		})		
	}


app.get('/', function(req, res) {
;
	res.render('index.html');

});
app.get('/getData', function(req, res){
	http.get("http://sistema.instakioski.com.br/bling.php", atualizaBanco); 
	console.log('haha')	
});

MongoNative.connect('mongodb://localhost/envia').then(function (db){
	global.db = db;
	app.listen(5000);
})


