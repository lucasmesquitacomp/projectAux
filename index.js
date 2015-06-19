
var express = require('express');
var http = require('http');
var MongoNative = require('mongo-native');
var bodyParser = require('body-parser');
var Q = require('q');
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
	  			pedidos.findAndModify({
	  				numeroPedidoLoja: item.notafiscal.numeroPedidoLoja
	  			},null
	  			,{$setOnInsert:item.notafiscal}		
	  			, {
	  				new: true,
	  				upsert: true
	  			}) // insert the document if it does not exist
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
				data.sort(function(obj1, obj2) {
					// Ascending: first age less than the previous
					return obj2.numeroPedidoLoja - obj1.numeroPedidoLoja;
				});
				res.json(data);	
			})
		}
		else{
			pedidos.find({situacao : filt})
			.then(function (data){
				data.sort(function(obj1, obj2) {
					// Ascending: first age less than the previous
					return obj2.numeroPedidoLoja - obj1.numeroPedidoLoja;
				});
				res.json(data);
			})
		}

});
app.post('/updateData', function (req,res){
	var pedidos = db.collection('pedidos')
	var data = req.body;
	pedidos.update({numeroPedidoLoja : data.numeroPedidoLoja}, data)
	.then(function(result){
		res.json(result);
	}, function (err) {
		console.log(err)
		res.status(400).end()
	});
	
  	
})

MongoNative.connect('mongodb://localhost/sistemaEnvio').then(function (db){
	global.db = db;
	app.listen(9999);
})


