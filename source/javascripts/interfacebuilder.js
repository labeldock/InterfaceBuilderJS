(function(window){
	
	var IB = window.ib = function(select){ return (new InterfaceDefine(select)); };
	IB.version = "0.0.1";
	
	var CFBREAKER = {$:"this is enum breaker"};
	
	var CFIS = {
		DATA:function(a){ return (typeof a === "object" && a !== null ) ? (((a instanceof Array || a instanceof NodeList || a instanceof HTMLCollection || CORE.TYPEOF.VENDER(a) || ( !isNaN(a.length) && isNaN(a.nodeType))) && !(a instanceof Window) ) ? true : false) : false; }.bind(),
		ARRAY:function(a){ return a instanceof Array; }.bind(),
	};
	
	var CFAS = {
		MIRROR:function(){
			if(CFIS.ARRAY(v)) return new Array(v);
			return v;
		},
		DATA:function(v){
			if(CFIS.ARRAY(v)) return v;
			
			if( CFIS.DATA(v) ) { 
				if("toArray" in v){ 
					return Array.prototype.slice.apply(v.toArray()); 
				} else {
					var mvArray = [];
					for(var i=0,l=v.length;i<l;i++) mvArray.push(v[i]); 
					return mvArray;
				} 
			}
			
			if(v||v==0) return [v];
			
			return [];
		}.bind()
	};
	
	var IBFunction = {
		"break":CFBREAKER,
		"each":function(d,f){
			for(var i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( f(d[i],i) === CFBREAKER ) break;
			return d;
		},
		"each":function(d,f){
			for(var i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( f(d[i],i) === CFBREAKER ) break;
			return d;
		},
		"map":function(d,f){
			var c;
			for(var i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( (c=f(d[i],i)) === CFBREAKER ) break; else (d[i]=c);
			return d;
		},
		"inject":function(d,f){
			var c;
			for(var i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( (c=f(d[i],i)) === CFBREAKER ) break; else (d[i]=c);
			return d;
		},
		"reduce":function(d,f){
			var c,r;
			for(var i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( (c=f(d,d[i],i)) == CFBREAKER ) break; else r=c;
			return r;
		},
		"forEach":function(d,f){
			for(var k in d) if( f(d[k],k) === CFBREAKER ) return d;
			return d;
		},
		"forMap":function(d,f){
			var c;
			for(var k in d) if( (c=f(d[k],k)) === CFBREAKER ) return d; else d[k] = c;
			return d;
		}
	};
	
	var IBProcess = function(process){
		return function(){
			var select = this.$select;
			var que    = Array.prototype.slice.call(this.$q);
			var ibargs = Array.prototype.slice.call(arguments);
			
			que.push(function(callback){
				var args = Array.prototype.slice.call(ibargs);
				args.unshift(callback);
				return process.apply(select,args);
			});
			
			return new InterfaceDefine(select,que);
		};
	};
	
	var IBPrototype = {
		inst:IBProcess(function(d,f){
			return f.call(this,d);
		}),
		build:function(){
			var Inteface = this;
			return function(c){
				for(var i=0,q=Inteface.$q,l=q.length;i<l;i++) c = q[i](c);
				return c;
			}.bind();
		}
	};
	
	for(var key in IBFunction) {
		ib[key] = IBFunction[key];
		if(typeof IBFunction[key] === "function"){
			IBPrototype[key] = IBProcess(IBFunction[key]);
		}
	}
	
	var InterfaceDefine = window.InterfaceDefine = (function(){
		var InterfaceDefine = function(select,que){
			this.$select = select;
			this.$q = CFAS.DATA(que);
		};
		
		InterfaceDefine.prototype = IBPrototype;
		
		return InterfaceDefine;
	}());
	
}(window));