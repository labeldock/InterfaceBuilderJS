(function(window){
	
	var IB = window.ib = function(select){ return (new InterfaceDefine(select)); };
	IB.version = "0.0.2";
	
	var CFBREAKER = {$:"this is enum breaker"};
	
	var CFIS = {
		VENDER:function(o){ return (typeof o === "object" && o !== null ) ? ("jquery" in o) ? true : false : false; },
		DATA:function(a){ return (typeof a === "object" && a !== null ) ? (((a instanceof Array || a instanceof NodeList || a instanceof HTMLCollection || CFIS.VENDER(a) || ( !isNaN(a.length) && isNaN(a.nodeType))) && !(a instanceof Window) ) ? true : false) : false; }.bind(),
		ARRAY:function(a){ return a instanceof Array; }.bind(),
		ELEMENT:function(a){ if(a == null) return false; if(typeof a === "object") if(a.nodeType == 1) return true; return false; },
		NODE:function(a){ if(a == null) return false; if(typeof a === "object") if(typeof a.nodeType == "number") return true; return false; },
		USELESS:function(o){ 
			if (typeof o === "undefined")return true;
			if (typeof o === "string")return o.trim().length < 1 ? true : false;
			if (typeof o === "object"){
				if(o instanceof RegExp) return false;
				if(CFIS.ELEMENT(o)) return false;
				if(o == null ) return true;
				if(CFIS.DATA(o)) {
					o = o.length;
				} else {
					var count = 0; for (var prop in o) { count = 1; break; } o = count;
				}
			}
			if (typeof o === "number")return o < 1 ? true : false;
			if (typeof o === "function")return false;
			if (typeof o === "boolean")return !o;
			console.warn("CFIS.USELESS::unknown type",o);
			return true;
		},
		USEABLE:function(o){
			return !CFIS.USELESS(o);
		}
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
		}.bind(),
		PROPS:function(k,v){
			if(typeof k === "object") return k;
			if(typeof k === "string" || typeof k === "number") return {k:v};
			return {};
		}
	};
	
	//minor version method
	var TODO = {};
	
	var IBProcesser = function(process){
		return function(){
			var newque = Array.prototype.slice.call(this.$que);
			var ibargs = Array.prototype.slice.call(arguments);
			
			newque.push(function(callback){
				var select = this.$select;
				var args = Array.prototype.slice.call(ibargs);
				args.unshift(callback);
				
				return process.apply(select,args);
			});
			
			return new InterfaceDefine(this.$select,newque);
		};
	};
	
	var IBPrototype = {
		dist:IBProcesser(function(d,f){
			return f.call(this,d,this.$select);
		}),
		build:function(){
			var Inteface = this, f = function(c){
				for(var i=0,q=Inteface.$que,l=q.length;i<l;i++) c = q[i].call(Inteface,c);
				return c;
			}.bind();
			
			f.bind = function(bindSelect){
				return (new InterfaceDefine(bindSelect,Inteface.$que)).build();
			};
			
			return f;
		}
	};
	
	IB.METHOD = function(k,v){
		var props = CFAS.PROPS(k,v);
		for(var key in props) ib[key] = props[key];
		return props;
	};
	
	IB.PROCESS = function(k,v){
		var props = CFAS.PROPS(k,v);
		for(var key in props) if(typeof props[key] === "function") IBPrototype[key] = IBProcesser(props[key]);
		return props;
	};
	
	IB.DUAL = function(k,v){
		return IB.PROCESS(IB.METHOD(k,v));
	};
	
	 
	
	//default
	IB.METHOD({
		"break":CFBREAKER,
		"props":CFAS.PROPS,
		"max":function(obj){
			if(typeof obj !== "object") return (void 0);
			for(var r=obj[0],i=1,d=obj,l=d.length;i<l;r=r>d[i]?r:d[i],i++);
			return r;
		},
		"min":function(obj){
			if(typeof obj !== "object") return (void 0);
			for(var r=obj[0],i=1,d=obj,l=d.length;i<l;r=r<d[i]?r:d[i],i++);
			return r;
		},
		"turn":function(i,p,ts){
			if(i < 0) { var abs = Math.abs(i/ts); i = p-(abs>p?abs%p:abs); }; 
			ts=ts?ts:1;i=Math.floor(i/ts);
			return (p > i)?i:i%p;
		},
		"range":function(value,step,last){
		    var r=[],start,end,reverse;
		    if(typeof value === "number"){ end = value; start = 0; }
		    if(typeof value === "object"){ start = value[0]; end = value[1];
		 	   if(typeof last !== "boolean"){ last = true; }
		    }
		    if(typeof start !== "number" || typeof end !== "number"){
		        if(typeof start !== "number" && typeof end !== "number") return r;
		        if(typeof start === "number") return r.push(start),r;
		        if(typeof end   === "number") return r.push(end)  ,r;
		    }
		    if(start > end){ reverse = end; end = start; start = reverse; reverse = true; }
		    end=parseFloat(end),end=isNaN(end)?0:end;
		    start=parseFloat(start),start=isNaN(start)?0:start;
		    step=parseFloat(step),step=isNaN(step)||step==0?1:step;
		    if(step <= 0){ return console.warn("range::not support minus step"),r;};
		    if(last==true) for(var i=start,l=end;i<=l;i=i+step) r.push(i); else for(var i=start,l=end;i<l;i=i+step) r.push(i);
		    return reverse ? r.reverse() : r;
		},
		"matrix":function(start,end,step){
		    var scales=[];
		    var maxLength = IB.max([start.length,end.length]);
		    var selectLengthes = IB.times(maxLength,function(scaleIndex){
		        var range = IB.range([start[scaleIndex],end[scaleIndex]])
		        scales.push(range);
		        return range.length;
		    });

		    var result = IB.times(IB.reduce(selectLengthes,function(redu,value){
		        return redu * value;
		    },1),function(){ return new Array(maxLength); });
        	
		    var turnSize = 1;
        
		    IB.each(scales,function(scaleCase,scaleIndex){
		        var scaleCaseLength = scaleCase.length;
		        IB.times(result.length,function(time){
		            result[time][scaleIndex] = scaleCase[ib.turn(time,scaleCaseLength,turnSize)];
		        });
		        turnSize = turnSize * scaleCaseLength;
		    });
        
		    return result;
		}
	});
	
	IB.DUAL({
		"each":function(d,f){
			for(var i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( f(d[i],i) === CFBREAKER ) break;
			return d;
		},
		"each":function(d,f){
			for(var i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( f(d[i],i) === CFBREAKER ) break;
			return d;
		},
		"map":function(d,f){
			for(var c,i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( (c=f(d[i],i)) === CFBREAKER ) break; else (d[i]=c);
			return d;
		},
		"inject":function(d,f,r){
			for(var c,r=(typeof r === "object")?r:{},i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( (c=f(r,d[i],i)) === CFBREAKER ) break; else r=c;
			return r;
		},
		"reduce":function(d,f,r){
			for(var c,i=0,d=CFAS.DATA(d),l=d.length;i<l;i++) if( (c=f(r,d[i],i)) == CFBREAKER ) break; else r=c;
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
		},
		"times":function(l,f){
			for(var c,d=[],i=0,l=(typeof l==="number" && l>=0)?l:0;i<l;i++) if( (c=f(i)) === CFBREAKER ) break; else (d.push(c));
			return d;
		}
	});
	
	IB.EXTEND = function(block){
		if(typeof block === "function") block.call(IB,IB,CFIS,CFAS,TODO);
	};
	
	var InterfaceDefine = window.InterfaceDefine = (function(){
		var InterfaceDefine = function(select,que){
			this.$select = select;
			this.$que = CFAS.DATA(que);
		};
		
		InterfaceDefine.prototype = IBPrototype;
		
		return InterfaceDefine;
	}());
	
}(window));