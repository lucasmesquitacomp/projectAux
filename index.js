
var express = require('express');
var http = require('http');
var MongoNative = require('mongo-native');
var bodyParser = require('body-parser');
var app = express();


app.set('views', './');

app.use(express.static('./'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.get('/', function(req, res) {
	res.render('index.html');

});
app.get('/refreshData', function(req, res){
	http.get("http://sistema.instakioski.com.br/bling.php", function (resp) {
		var data = '';
		var pedidos = db.collection('pedidos');
 	    resp.on('data', function (chunk) {
 	    	data += chunk;
  		});

  		resp.on('end', function () {
  			data = JSON.parse(data);
  			data = data.retorno.notasfiscais;
  			data.forEach(function (item) {
  				


  				pedidos.findAndModify({numeroPedidoLoja : item.notafiscal.numeroPedidoLoja},
  				,
  				{ $setOnInsert: { banco: "mongo" }},
  				{new: true, upsert: true} // insert the document if it does not exist
				)


  			//	pedidos.update({numeroPedidoLoja : item.notafiscal.numeroPedidoLoja}, item.notafiscal,{upsert:true})	
  			})
  			res.end();
  		})
		
		})
		.on('error', function(e) {
  	  		console.log("Got error: " + e.message);
		});
});

app.get('/getData', function(req, res){

	var pedidos = db.collection('pedidos');
	pedidos.find()
	.then(function (data){
		res.json(data);	
	})
	
})

app.post('/getFilterData',function (req,res){
		var pedidos = db.collection('pedidos');
		var filt = req.body.filter;
		if(filt==="Todos"){
		pedidos.find()
			.then(function (data){
				res.json(data);	
			})
		}
		else{
			pedidos.find({situacao : filt})
			.then(function (data){
				res.json(data);
			})
		}

});
app.post('/updateData', function (req,res){
	var pedidos = db.collection('pedidos')
	var data = req.body;
	console.log(data);
	data.forEach(function (item) {
  		
		console.log(item);
  		pedidos.update({numeroPedidoLoja : item.notafiscal.numeroPedidoLoja}, item.notafiscal,{upsert:true})	
  	})
  	res.end();
})




MongoNative.connect('mongodb://localhost/envia').then(function (db){
	global.db = db;
	app.listen(5000);
})


