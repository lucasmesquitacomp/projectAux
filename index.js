
var express = require('express');
var http = require('http');
var MongoNative = require('mongo-native');
var bodyParser = require('body-parser');
var Q = require('q');


	//Auth variables
	var passport = require('passport');
	var LocalStrategy = require('passport-local').Strategy;
	var mongodb = require('mongodb');
	var mongoose = require('mongoose');
	var bcrypt = require('bcrypt');
	var SALT_WORK_FACTOR = 10;
		//Auth express variables
		var morgan = require('morgan');
		var cookieParser = require('cookie-parser');
		var methodOverride = require('method-override');
		var session = require('express-session');
	//Auth connection
	mongoose.connect('localhost','pedidos');
	var dbm = mongoose.connection;
	dbm.on('error', console.error.bind(console, 'connection error:'));
	dbm.once('open', function callback(){
		console.log('Mongoose user Data');
	});

	//Auth Mongoose Schema
	var userSchema = mongoose.Schema({
		username: {type: String, require: true, unique:true},
		email: { type: String, required: true, unique: true},
		password: {type: String, required: true},
	});

	//Auth Encription
	userSchema.pre('save', function(next){
		var user = this;
		if(!user.isModified('password')) return next();

		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
			if(err) return next(err);

			bcrypt.hash(user.password, salt, function(err, hash){
				if(err) return next(err);
				user.password = hash;
				next();
			});
		});
	});

	//Auth Connect 

	userSchema.methods.comparePassword = function(candidatePassword, cb){
		bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
			if(err) return cb (err);
			cb(null, isMatch);
		});
	};

	//Auth add user(temporrario = alimentar);

	var User = mongoose.model('User', userSchema);
	var user = new User({username: 'altum', email: 'altum@altum.com',password:'altum#123'});
	user.save(function(err){
		if(err){
			console.log(err);
		}else{
			console.log('user: '+ username +'salvo');
		};
	});

	//Auth Passport config
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function (err, user){
			done(err, user);
		});
	});

	passport.use(new LocalStrategy(function(username, password, done){
		User.findOne({username: username},function (err, user){
			if(err){ 
				return done(err);
			}
			if(!user){
				return done(null, false,{message: "Usuário:"+ username+" não cadastrado"});
			}
			user.comparePassword(password, function(err,isMatch){
				if(err) return done(err);
				if(isMatch){
					return done(null, user);
				} else{
					return done(null, false, {message:'Invalid password'});
				}
			});
		});
	}));


//Auth Functions
function updateItem(item){
	var pedidos = db.collection('pedidos');
	delete item._id;
	console.log(item);
	pedidos.update({numeroPedidoLoja : item.numeroPedidoLoja}, item)

}
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}
//page configure
var app = express();
var router = express.Router();

	app.use(express.static('./'))

	app.set('views',__dirname + '/views');
	
	app.use(express.static(__dirname + '/../../public'));
	app.set('view engine', 'ejs');
	app.engine('ejs', require('ejs-locals'));
	app.use(morgan());
	app.use(cookieParser());
	app.use(bodyParser());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended:true}));	
	app.use(methodOverride());
	app.use(session({secret: 'altum tecnologia'}));

//passport
	app.use(passport.initialize());
	app.use(passport.session());
	
app.get('/',ensureAuthenticated, function(req, res) {
	res.render('index',{user: req.user});
});
app.get('/login',function( req, res){
	res.render('login',{user: req.user, message: req.session.messages});
})

//auth post
app.post('/login', function(req, res, next){
	passport.authenticate('local', function(err, user, info){
		if(err) {
			return next(err);
		}
		if (!user){
			req.session.messages = [info.message];
			return res.redirect('/login');
		}
			req.logIn(user, function(err){
				if (err) { return next(err); }
				return res.redirect('/');
			});
	})(req, res, next);
});

app.get('/logout', function(req , res){
	req.logout();
	res.redirect('/');
})

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

app.post('/sendData', function(req, res){

	var data = req.body;
		data.forEach(function (item){
			var dados='';
			if(item.Selected){
				qstring = 'http://sistema.instakioski.com.br/magentoapi2/envia.php?id='+item.numeroPedidoLoja+"&rastreio="+item.codigosRastreamento.codigoRastreamento;
  
  			var req = http.get(qstring, function(response){
    			console.log(response.statusCode);
    			
    			response.on('data',function (chunk){
    				dados+=chunk;
    			});

    			response.on('end', function(){
    				console.log('teste')
    				item.situacao = "Enviado";
    				delete item.Selected;
						updateItem(item);
    			});
    			
    		});
    		req.on('error', function(e){
    				delete item.Selected;
 						console.log('Got error: ' + e.message);
    			});
    		
			}
			
		})
	res.json(data);
})

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
					
					return obj2.numeroPedidoLoja - obj1.numeroPedidoLoja;
				});
				res.json(data);	
			})
		}
		else{
			pedidos.find({situacao : filt})
			.then(function (data){
				data.sort(function(obj1, obj2) {
					
					return obj2.numeroPedidoLoja - obj1.numeroPedidoLoja;
				});
				res.json(data);
			})
		}
});

app.post('/auth', passport.authenticate('local'));


MongoNative.connect('mongodb://localhost/sistemaEnvio').then(function (db){
	global.db = db;
	app.listen(9000);
})


