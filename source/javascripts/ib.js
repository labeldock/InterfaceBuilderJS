(function(window){
	
	var IB = window.ib = function(select){ return (new InterfaceDefine(select)); };
	IB.version = "0.0.4";
	
	var CFBREAKER = {$:"this is enum breaker"};
	
	var CFIS = {
		VENDER:function(o){ return (typeof o === "object" && o !== null ) ? ("jquery" in o) ? true : false : false; },
		ARRAY:function(a){ return a instanceof Array; },
		DATA:function(a){ return (typeof a === "object" && a !== null ) ? (((a instanceof Array || a instanceof NodeList || a instanceof HTMLCollection || CFIS.VENDER(a) || ( !isNaN(a.length) && isNaN(a.nodeType))) && !(a instanceof Window) ) ? true : false) : false; },
		DATUM:function(d){ return (typeof d === "object" && !CFIS.DATA(d)); },
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
		INT:function(v){ return ~~v; },
		FLOAT:function(v){ return v*1; },
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
	
	IB.CALLFOR = function(f,v){
		if(typeof f === "function") return f.apply(this,Array.prototype.slice.call(arguments,1));
		return v;
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
	
	IB.CLASS = function(func,proto){
		if(proto) func.prototype = proto;
		if(!func.prototype) func.prototype = {};
		func.prototype.constructor = func;
		func.new = function(){ return new (Function.prototype.bind.apply(func,[func].concat(Array.prototype.slice.call(arguments)))); };
		return func;
	};
	
	//default
	IB.METHOD({
		"break":CFBREAKER,
		"props":CFAS.PROPS,
		"clone":function(target,d){
			if(d == true) {
				if(CFIS.DATA(target)) {
					if(!CFIS.DATA(d)) { d = [] };
					for (var i=0,l=target.length;i<l;i++) d.push( ((typeof target[i] === "object" && target[i] !== null ) ? ib.clone(target[i]) : target[i]) )
						return d;
				} else {
					if(d == true) { d = {} };
					for (var p in target) (typeof target[p] === "object" && target[p] !== null && d[p]) ? ib.clone(target[p],d[p]) : d[p] = target[p];
					return d;
				}
			
			}
			switch(typeof target){
				case "undefined": case "function": case "boolean": case "number": case "string": return target; break;
				case "object":
					if(target === null) return target;
					if(target instanceof Date){
						var r=new Date();r.setTime(target.getTime());return r;
					}
					if(CFIS.DATA(target)){
						var r=[]; for(var i=0,length=target.length;i<length;i++)r.push(target[i]); return r;
					} 
					if(CFIS.ELEMENT(target) == true){
						return target;
					}
					var r={};
					for(var k in target){
						if(target.hasOwnProperty(k))r[k]=target[k];
					}
					return r;
					break;
				default : console.error("ib.clone::copy failed : target => ",target); return target; break;
			}
		},
		"findKeys":function(obj,value){
			var result = [];
	        if(CFIS.DATA(obj)){
	        	for(var i=0,l=obj.length;i<l;i++) if(typeof value === "function" ? value(obj[i],i) : obj[i]===value) result.push(i);
	        } 
	        if(CFIS.DATUM(obj)){
	        	for(var key in obj) if(typeof value === "function" ? value(obj[key],key) : obj[key]===value) result.push(key);
	        }
			return result;
		},
		"removeValue":function(obj,value){
			var detect = true;

			while(detect) {
				var key = IB.findKeys(obj,value)[0];
				if(typeof key === "undefined"){
					detect = false;
				} else {
					if(CFIS.ARRAY(obj)){
						obj.splice(key,1);
					} else {
						delete obj[key];
					}
				}
			}
			
			return obj;
		},
	    "toArray":function(data,option){
	        if(typeof data === "undefined" || data === null || data === NaN ){
	            return [];
	        }
	        if(CFIS.DATA(data)){
	            return Array.prototype.slice.call(data);
	        }
	        if(typeof data === "object" && typeof data.toArray === "function"){
	            return data.toArray();
	        }
	        if(typeof data === "string", typeof option === "string"){
	            return data.split(option);
	        }
	        return [data];
	    },
	    "asArray":function(data,option){
	    	return CFIS.DATA(data) ? data : IB.toArray(data,option);
	    },
		"concat":function(data,appends){
			var data = IB.asArray(data);
			return IB.each(appends,function(value){ data.push(value); }), data;
		},
		"select":function(target,path){
	        switch(typeof path){
				case "number":
					path += "";
				case "string":
					if(path.indexOf("[") == 0){
						return eval("target"+path);
					} else {
						return eval("target."+path);
					}
	            case "function":
	                return path.call(this,target);
	            case "undefined":
	            default:
	                return target;
	                break;
	        }
		},
		"filter":function(data,func){
			for(var i=0,keys = Object.keys(data),l=keys.length;i<l;i++){
				var value = data[keys[i]];
				var result = func(value,keys[i]);
				if(result == false) Array.prototype.splice.call(data,i,1),i--,l--;
			}
			return data;
		},
		"any":function(od,fm){
			var tr=false,fm=(typeof fm === 'function')?fm:function(v){return v === fm;},fv=undefined;
			IB.each(od,function(v,i){ if(i==0)fv=v; if(fm(v,i,fv) === true) { tr = true; return false; } });
			return tr;
		},
		"all":function(od,fm){
			var tr=true,fm=(typeof fm === 'function')?fm:function(v){return v === fm;},fv=undefined;
			IB.each(od,function(v,i){ if(i==0)fv=v; if(fm(v,i,fv) === false) return tr = false; });
			return tr;
		},
		"clear":function(data,concat){
			if(CFIS.ARRAY(data)){
				Array.prototype.splice.call(data,0,data.length);
				typeof concat !== undefined && IB.concat(data,concat);
			} else if(typeof data == "object") {
				for(var key in data) delete data[key];
			}
			return data;
		},
		"insert":function(data,v,a){
			Array.prototype.splice.call(data,typeof a === "number"?a:0,0,v);
			return data;
		},
		"sort":function(data,filter){
			if(data.length == 0){
				return data;
			}

			var result = [data[0]];

			for(var i=1,l=data.length;i<l;i++){
				for(var ri=0,rl=result.length;ri<rl;ri++){
					if(filter(data[i],result[ri]) === true){
						IB.insert(result,data[i],ri);
						break;
					}
					if((ri + 1) === result.length){
						result.push(data[i]);
					}
				}
			}

			IB.clear(data);

			for(var i=0,l=result.length;i<l;data.push(result[i]),i++);

			return data;
		},
		"sortBy":function(sortData,byData,pair){
			var result = [];
        
			for(var bi=0,byd=byData,bl=byd.length;bi<bl;bi++){
				for(var si=0,sod=sortData,sl=sod.length;si<sl;si++){
					if(pair(sod[si],byd[bi]) === true){
						result[bi] = sod.splice(si,1)[0];
						si--;
						sl--;
						break;
					}
				}
			}
        
			IB.clear(sortData);
			for(var i=0,l=result.length;i<l;sortData[i] = result[i],i++);
        
			return sortData;
		},
		"compact":function(data,removeWithEmpty){
			if(typeof data === "object"){
				if(CFIS.ARRAY(data)){
					IB.filter(data,function(value){
						if(removeWithEmpty == true && CFIS.USELESS(value)){
							return false;
						} else if (value === undefined || value === null){
							return false;
						}
						return true;
					})
				} else {
					IB.forEach(data,function(value,key){
						if(removeWithEmpty == true && CFIS.USELESS(value)){
							delete data[key];
						} else if(value === undefined || value === null){
							delete data[key];
						}
					});
				}
			}
			return data;
		},
		"nestedEach":(function(){
			var DROPDOWN_PROC = function(node,nestedKey,proc,parentReturn,depth){
				++depth;
				var nodeIndex = 0;
				IB.forEach(node,function(data,forKey){
					if(CFIS.ARRAY(data)){
						data.length && DROPDOWN_PROC(data,nestedKey,proc,parentReturn,depth);
					} else{
						if((CFIS.ARRAY(node) && CFIS.DATUM(data)) || (CFIS.DATUM(data) && forKey == nestedKey)){
							var destChilds = [];
							nestedKey === Object && IB.each(Object.keys(data),function(ok){ CFIS.ARRAY(data[ok]) && destChilds.push(data[ok]); });
							typeof data[nestedKey] === "object" && destChilds.push(data[nestedKey]);

							var procReturn = proc(data,parentReturn,depth,nodeIndex++);

							IB.each(destChilds,function(dest){
								DROPDOWN_PROC(dest,nestedKey,proc,procReturn,depth);
							});
						}
					}
				});
			};
			return function(node,nestedKey,proc,startParam){
	            if(CFIS.DATUM(node) && !CFIS.ARRAY(node)) {
	                var destChilds = [];
	                nestedKey === Object && IB.each(Object.nestedKeys(node),function(ok){ CFIS.ARRAY(node[ok]) && destChilds.push(node[ok]); });
	                typeof node[nestedKey] === "object" && destChilds.push(node[nestedKey]);
	                startParam = proc(node,startParam,0);
	                IB.each(destChilds,function(dest){ DROPDOWN_PROC(dest,nestedKey,proc,startParam,0); });
	            } else {
	                DROPDOWN_PROC(node,nestedKey,proc,startParam,-1);
	            }
	            return node;
			}
		}()),
		"move":function(data,oldIndex,newIndex){
			if(oldIndex !== newIndex && CFIS.ARRAY(data) && typeof oldIndex === "number" && typeof newIndex === "number" && oldIndex >= 0 && oldIndex < data.length){
				Array.prototype.splice.call(data,newIndex > data.length ? data.length : newIndex,0,Array.prototype.splice.call(data,oldIndex,1)[0]);
			}
			return data;
		},
	    "keys":function(){
	        var result = {}, args = Array.prototype.slice.call(arguments);
	        for(var ak in args) for(var ok in args[ak]) result[ok] = 1;
	        return Object.keys(result);
	    },
		"max":function(obj,getf){
			if(typeof obj !== "object") return (void 0);
			for(var r=getf?getf(obj[0]):obj[0],i=1,d=obj,l=d.length,di=(void 0);i<l;di=getf?getf(d[i]):d[i],r=r>di?r:di,i++);
			return r;
		},
		"min":function(obj,getf){
			if(typeof obj !== "object") return (void 0);
			for(var r=getf?getf(obj[0]):obj[0],i=1,d=obj,l=d.length,di=(void 0);i<l;di=getf?getf(d[i]):d[i],r=r<di?r:di,i++);
			return r;
		},
		"turn":function(i,p,ts){
			if(i < 0) { var abs = Math.abs(i/ts); i = p-(abs>p?abs%p:abs); }; 
			ts=ts?ts:1;i=Math.floor(i/ts);
			return (p > i)?i:i%p;
		},
		"index":function(data,value){
			var index = -1;
			IB.each(data,typeof value === "function"?
				function(v,i){ 
					if(value(v,i)===true) {
						index = i;
						return CFBREAKER;
					}
				}:
				function(v,i){
					if(v === value){
						index = i;
						return CFBREAKER;
					}
				}
			);
			return index;
		},
		"toggle":function(ta,cv,set){
			var index = IB.index(ta,function(arg){ return arg == cv; }) + 1;
			if(arguments.length > 2) for(var i=0,l=ta.length;i<l;i++) if( ta[i] == set ) return ta[i];
			index = ta.length == index ? 0 : index;
			return ta[index];
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
		},
		"limit":function(i,m,s){
			if(typeof m !== "number") return i;
			if(typeof s !== "number") s = 0;
			if(i > m) return m;
			if(i < s) return s;
			return i;
		},
		//확률적으로 flag가 나옵니다. 0~1 true 가 나올 확률
		"versus":function(probabilityOfTrue){
			if(typeof probabilityOfTrue !== 'number') probabilityOfTrue = 0.5;
			return !!probabilityOfTrue && Math.random() <= probabilityOfTrue;
		},
		//무작위로 뽑아낸다 //2: 길이만큼
		"attract":function(v,length){
			v = IB.toArray(v);
			if(typeof length === "undefined") return v[Math.floor(Math.random() * v.length)];
			if(length > v.length) length = v.length;
			var r = [];
			for(var i=0,l=length;i<l;i++){
				var vi = Math.floor(Math.random() * v.length);
				r.push(v[vi]);
				v.splice(vi,1);
			}
			return r;
		},
		//데이터를 섞는다
		"shuffle":function(v){
			//+ Jonas Raoni Soares Silva
			//@ http://jsfromhell.com/array/shuffle [rev. #1]
			v = IB.toArray(v);
			for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
			return v;
		}
	});
	
	IB.DUAL({
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
			if(typeof d === "object" && !CFIS.DATA(d)) for(var k in d) if( f(d[k],k) === CFBREAKER ) return d;
			else f(d,(void 0));
			return d;
		},
		"forMap":function(d,f,c){
			if(typeof d === "object" && !CFIS.DATA(d)) for(var k in d) if( (c=f(d[k],k)) === CFBREAKER ) return d; else d[k] = c;
			else return f(d,(void 0));
			return d;
		},
		"times":function(l,f){
			for(var c,d=[],i=0,l=(typeof l==="number" && l>=0)?l:0;i<l;i++) if( (c=f(i)) === CFBREAKER ) break; else (d.push(c));
			return d;
		}
	});
	
	
    (function(FN,REMOVE_VALUE,REDUCE,SELECT,CLONE,FOR_MAP){
        
        var Block = function(posSize){
            this.$space   = (void 0)
			this.$posSize = posSize;
        };
        
        Block.prototype = {
			getBlockValue:function(){ return typeof this.$posSize === "function" ? this.$posSize() : this.$posSize; },
            domainValue:function(){ return FOR_MAP(CLONE(this.getBlockValue()),function(posSize){return posSize[0];}); },
            domainSize :function(){ return FOR_MAP(CLONE(this.getBlockValue()),function(posSize){return posSize[1];}); },
            conflicts:function(otherBlocks,selector){
                return REDUCE(otherBlocks,function(red,block){
                    var selectBlock = SELECT(block,selector);
					var thisPosSize = this.getBlockValue();
                    if(selectBlock instanceof Block){
                        if((selectBlock === this) || (selectBlock.$space != this.$space)) return red;
                        if(selectBlock.$posSize[0] < thisPosSize[0] && (selectBlock.$posSize[0] + selectBlock.$posSize[1]) <= thisPosSize[0]) return red;
                        if(selectBlock.$posSize[0] > thisPosSize[0] && (thisPosSize[0]  + thisPosSize[1])  <= selectBlock.$posSize[0]) return red;
                        red.push(block);
                    }
                    return red;
                }.bind(this),[]);
            },
            rangeStart:function(){ return this.$space.domainRange(FOR_MAP(CLONE(this.getBlockValue()),function(posSize){ return posSize[0]; })); },
            rangeSize:function(){ return this.$space.domainRangeSize(FOR_MAP(CLONE(this.getBlockValue()),function(posSize){ return posSize[1]; })); },
			rangeMap:function(){
				var rangeStart = this.rangeStart();
				var rangeSize  = this.rangeSize();
				return FOR_MAP(rangeStart,function($start,sel){ 
					var $size = sel ? rangeSize[sel] : rangeSize;
					return {
						start:$start,
						size:$size,
						end:$start+$size
					};
				});
			},
            rangeEnd:function(){ return this.rangeMap(this.rangeMap(),function(map){ return map.end; }); },
            call:function(f){ typeof f === "function" && f.call(this,this.rangeMap()); }
        };
        
        var Space = function(domain,range){
			this.domain(domain);
			this.range(range);
            this.$niceRange = true;
        };
        
        Space.prototype = {
			domain:function(domain){
				this.$domain = domain;
			},
			range:function(range){
				this.$range = range;
			},
            domainRangeSize:function(v){
				return FOR_MAP(CLONE(this.$domain),function($domain,sel){
					var $range = sel ? this.$range[sel] : this.$range;
					return ((sel ? v[sel] : v) / ($domain[1] - $domain[0])) * ($range[1] - $range[0]);
				}.bind(this));
            },
            domainRange:function(v){
				return FOR_MAP(CLONE(this.$domain),function($domain,sel){
					var $range = sel ? this.$range[sel] : this.$range;
	                var dSize = $domain[1] - $domain[0];
	                var sSize = $range[1] - $range[0];
	                var dRate = ((sel ? v[sel] : v) - $domain[0]) / dSize;
	                var calc  = $range[0] + sSize * dRate;
					
	                return this.$niceRange ? Math.round(calc) : calc;
				}.bind(this));
            },
            block:function(posSize){
                var block = new Block(posSize);
				block.$space = this;
                return block;
            }
        };
    
        FN.space = (function(){
            return function(domain,range){
                return new Space(domain,range);
            };
        }());
        
        FN.block = (function(){
            return function(posSize){
                return new Block(posSize);
            };
        }());
		
    }(IB,IB.removeValue,IB.reduce,IB.select,IB.clone,IB.forMap));
	
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