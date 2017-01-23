(function(){
	
	
	ib.directive("[role-space]",function(element,dataset,attr){
		var $element = $(element);
		
		var data = [
			{value:0,size:10},
			{value:24,size:10},
			{value:40,size:10}
		];
		
		var space = ib.space([0,50],[0,$element.width()]);
		
		ib.each(data,function(datum){
			var $li = $("<li/>");
			$element.append($li);
		});
		
		var update = function(){
			$element.children().each(function(index){
				var datum = data[index];
				var $li = $(this);
				$li.text(datum.value + " : " + datum.size);
				space.block(datum.value,datum.size).call(function(){
					$li.css({
						left:this.rangeStart(),
						width:this.rangeSize() + "px"
					});
				});
			});
		};
		
		setInterval(function(){
			ib.each(data,function(datum){	
				datum.value += 1*(ib.versus()?-1:1);
				datum.size += 1*(ib.versus()?-1:1);
			});
			
			update();
		},250);
	});
	
}());