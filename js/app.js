( function(){
	var app = angular.module('app',[]);

	function PedidosFactory($http,$q){
		var Pedidos = {
			endpoint:'sistema.instakioski.com.br/magentoapi2/envia.php'
		};	
			
		Pedidos.sendData = function (nPedido, rastr){
			
			return $http({
				url: Pedidos.endpoint,
				method:'GET',
				params:{
	  			pedido : nPedido,
	  			rastreio: rastr
	  		}
			}).then(function (status){
	  		return status.data;
	  	})
		}
		Pedidos.refreshData = function(){
			return $http.get('/refreshData')
		.then(function (searchRes){
			return searchRes.data;
		})
		}
		Pedidos.updateData = function(data){
			
			return $http.post('/updateData',data)
		.then(function (res){
			
		})
		}
		Pedidos.getFiltData = function (filter){
			
			return $http.post('/getFilterData',filter)
		.then(function (res){
			
			return res.data;
		})
		}

	return Pedidos;
	}
	

	
		
		app.factory('Pedidos', PedidosFactory);
			

		app.controller('PedidoController',function (Pedidos,$http){
			var self = this;
			self.pedidos = [];
			self.pedidosFilter = [];
			self.selectedAll = false;
			
			this.filters = [
	     	   	{filter: "Pendente" },
	      		{filter: "Emitida DANFE" },
	      		{filter: "Cancelada" },
	      		{filter: "Enviado" },
	      		{filter: "Todos" }
    		]

			this.refreshData = function(){
				Pedidos.refreshData();
			};
			this.getFilterData = function(filter){
				
				Pedidos.getFiltData(filter).then(function (data){
				
					self.pedidosFilter = data;
				})

			}
			this.selectAll = function(){
				if (self.selectedAll) {
		            self.selectedAll = true;
		        } else {
		            self.selectedAll = false;
		        }
		        angular.forEach(self.pedidosFilter, function (item) {
		            item.Selected = self.selectedAll;
		        });

    		};
			this.sendSelected = function(){
			
				angular.forEach(self.pedidosFilter, function (item) {
		            
		            if(item.Selected){ 
		        			 Pedidos.sendData(item.numeroPedidoLoja,item.codigosRastreamento.codigoRastreamento)  	
									.then(function(){
						 				 	console.log('tess');
						 				 	item.situacao = "Enviado"
									 });
			         		
			         		item.situacao = "Enviado";
			         		delete item.Selected;
									delete item._id;
			         	   	//sistema.instakioski.com.br/magentoapi2/envia.php?id=pedido&rastreio=
			      	 		Pedidos.updateData(item);
			      	 		console.log(item);
			      	 } 
		    })
		        
		        
			};
			
		})
		
})();