( function(){
	var app = angular.module('app',[]);

	function PedidosFactory($http,$q){
		var Pedidos = {};	
		
		Pedidos.getData = function(){
			return $http.get('/getData')
		.then(function (searchRes){
			
			return searchRes.data;

		})
		}
		
	return Pedidos;
	}
	

	
		
		app.factory('Pedidos', PedidosFactory);
			

		app.controller('PedidoController',function (Pedidos,$http){
			var self = this;
			self.pedidos = [];
			self.selectedAll = false;
			this.refreshData = function(){
				Pedidos.getData().then(function (data){
					self.pedidos = data.retorno.notasfiscais;
				})
			};
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
						    params: {pedido : item.notafiscal.numeroPedidoLoja,rastreio: item.notafiscal.codigosRastreamento.codigosRastreamento}
						 });
			           	//sistema.instakioski.com.br/magentoapi2/envia.php?id=pedido&rastreio=
			        };
		        });
			};
			
		})
		
})();