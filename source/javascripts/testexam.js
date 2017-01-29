(function(){
	
	
	ib.directive("[role-space]",function(element,dataset,attr){
		var $element = $(element);
		
		var data = [
			{value:0,size:2},
			{value:3,size:2},
			{value:6,size:2}
		];
		
		
		var linearSpace = ib.space([0,10],[0,$element.width()]);
		
		ib.each(data,function(datum){
			var $li = $("<li/>");
			$element.append($li);
		});
		
		var update = function(){
			$element.children().each(function(index){
				var datum = data[index];
				var $li = $(this);
				$li.text(datum.value + " : " + datum.size);
				linearSpace.block([datum.value,datum.size]).call(function(range){
					$li.css({
						left:range.start + "px",
						width:range.size + "px"
					});
				});
			});
		};
		
		var ic = 0, it = setInterval(function(){
			ib.each(data,function(datum){	
				datum.value += 1*(ib.versus()?-1:1);
				datum.size += 1*(ib.versus()?-.5:.5);
			});
			
			update();
			
			if((ic++) > 5) {
				clearInterval(it);
			}
		},1000);
		
		update();
	});
	
	ib.directive("[role-space2d]",function(element,dataset,attr){
		var $element = $(element);
		
		var data = [
			{x:0,y:0,width:1,height:1},
			{x:3,y:3,width:1,height:1},
			{x:6,y:6,width:1,height:1}
		];
		
		var xySpace = ib.space(
			{
				x:[0,10],
				y:[0,10]
			},
			{
				x:[0,$element.width()],
				y:[0,$element.height()]
			}
		);
		
		
		ib.each(data,function(datum){
			var $li = $("<li/>");
			$element.append($li);
		});
		
		var update = function(){
			$element.children().each(function(index){
				var datum = data[index];
				
				var $li = $(this);
				$li.text([datum.x,datum.width,datum.y,datum.height]+"");
				
				xySpace.block({
					x:[datum.x,datum.width],
					y:[datum.y,datum.height]
				}).call(function(range){
					$li.css({
						left: range.x.start + "px",
						width: range.x.size + "px",
						top: range.y.start + "px",
						height: range.y.size + "px"
					});
				});
				
			});
		};
		
		var ic = 0, it = setInterval(function(){
			ib.each(data,function(datum){	
				datum.x += 1*(ib.versus()?-1:1);
				datum.y += 1*(ib.versus()?-.5:.5);
			});
			
			update();
			
			if((ic++) > 5){
				clearInterval(it);
			}
		},1000);
		
		update();
		
	});
	
}());