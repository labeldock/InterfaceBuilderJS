(function(){
	var data = [
		{data:12},
		{data:24},
		{data:44}
	];
	
	ib.directive("[role-space]",function(element,dataset,attr){
		console.log("role space",element,dataset,attr);
	})
	
}());