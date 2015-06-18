( function(){
	var app = angular.module('app',[]);

	function PedidosFactory($http,$q){
		var Pedidos = {};	
		
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
			console.log(filter);
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
					console.log(data);
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
				angular.forEach(self.pedidos, function (item) {
		            if(item.Selected){ 
		            	
						$http({
						    url: sistema.instakioski.com.br/magentoapi2/envia.php, 
						    method: "GET",
						    params: {pedido : item.numeroPedidoLoja,rastreio: item.codigosRastreamento.codigosRastreamento}
						 }).then(function(){
						 	console.log('hehe');
						 	item.situacao = "Enviado"
						 });
			           	//sistema.instakioski.com.br/magentoapi2/envia.php?id=pedido&rastreio=
			        };
		        })
		        
		        Pedidos.updateData(self.pedidosFilter)
		        
			};
			
		})
		
})();