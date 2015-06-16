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

		Pedidos.getData = function (filt){
			return $http.get('/getData',{
				params:{
	  				filter : filt  	
				}
			})
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
	      		{filter: "Cancelada" }
    		]

			this.refreshData = function(){
				Pedidos.refreshData();
			};
			this.getData = function(){
				Pedidos.getData().then(function (data){
					
					self.pedidos = data;
				})
			}
			this.getFilterData = function(filter){
				
				Pedidos.getData(filter).then(function (data){
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
		        angular.forEach(self.pedidos, function (item) {
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
						 });
			           	//sistema.instakioski.com.br/magentoapi2/envia.php?id=pedido&rastreio=
			        };
		        });
			};
			
		})
		
})();