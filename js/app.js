( function(){
	var app = angular.module('app',[]);

	function PedidosFactory($http,$q){
		var Pedidos = {
			endpoint:'http://sistema.instakioski.com.br/magentoapi2/envia.php'
		};	
			
		Pedidos.sendData = function (pedido){
			
			return $http.post('/sendData', pedido).then(function (status){
	  		return status.data;
	  	})
		}
		Pedidos.refreshData = function(){
			return $http.get('/refreshData')
		.then(function (searchRes){

			return searchRes.data;
		})
		}
		Pedidos.searchData = function (ind){
			return $http.get('/searchData?index='+ind)
		.then(function (res){
			return res.data;
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
			self.pedidosFilter = [];
			self.selectedAll = false;
			self.statusFilters = [
				{filter : "Enviado"},
				{filter : "Nao Enviado"}
			]
			self.filters = [];

			this.refreshData = function(){
				Pedidos.refreshData().then(function(filts){
					self.filters = filts;
				});

			};
			this.getFilterData = function(filter){
				
				Pedidos.getFiltData(filter).then(function (data){
					self.pedidosFilter = data;
			});
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

    	this.searchData = function (ind){
    		Pedidos.searchData(ind).then(function (data){
    			self.pedidosFilter = data;
    		})	
    	}	
			this.sendSelected = function(){
				if(confirm("Tens certeza que quer continuar?")){
						Pedidos.sendData(self.pedidosFilter).then(function (data){
						self.pedidosFilter = data;
						});		        
					};
				}
		})
		
})();