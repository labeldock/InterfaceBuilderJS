ib && ib.EXTEND(function(IB,CFIS,CFAS,TODO){
	
	// addEventListener polyfill by https://gist.github.com/jonathantneal/3748027
	!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
		WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
			var target = this;

			registry.unshift([target, type, listener, function (event) {
				event.currentTarget = target;
				event.preventDefault = function () { event.returnValue = false };
				event.stopPropagation = function () { event.cancelBubble = true };
				event.target = event.srcElement || target;

				listener.call(target, event);
			}]);

			this.attachEvent("on" + type, registry[0][3]);
		};

		WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
			for (var index = 0, register; register = registry[index]; ++index) {
				if (register[0] == this && register[1] == type && register[2] == listener) {
					return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
				}
			}
		};

		WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
			return this.fireEvent("on" + eventObject.type, eventObject);
		};
	})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
	
	IB.ENV = (function(){
		var info = {};
		
		info.online = navigator ? navigator.onLine : false;
		
		//support LocalStorage
		info.supportLocalStorage = window ? ('localStorage' in window) ? true : false : false;
		info.localStorage = window.localStorage;
		
		//support SessionStorage
		info.supportSessionStorage = window ? ('sessionStorage' in window) ? true : false : false;
		info.sessionStorage = window.sessionStorage;
		
		//storage hack
		info.supportStorage = info.supportLocalStorage || info.supportSessionStorage;
		info.storage = info.localStorage || info.sessionStorage;
		
		//support ComputedStyle
		info.supportComputedStyle  =  window ? ('getComputedStyle' in window) ? true : false : false;
	
		var lab3Prefix = function(s){
			if( s.match(/^Webkit/) ) return "-webkit-";
			if( s.match(/^Moz/) )    return "-moz-";
			if( s.match(/^O/) )      return "-o-";
			if( s.match(/^ms/) )     return "-ms-";
			return "";
		};
	
		var supportPrefix = {};
	
		info.getCSSName = function(cssName){
			if(typeof cssName !== "string"){
				return cssName+"";
			}
			cssName.trim();
			for(var prefix in supportPrefix) {
				if( cssName.indexOf(prefix) === 0 ) {
					var sp = supportPrefix[prefix];
					if( sp.length ) return sp+cssName;
				}
			}
			return cssName;
		};
	
		var tester = document.createElement('div');
	
		//transform
		support = false;
		"transform WebkitTransform MozTransform OTransform msTransform".replace(/\S+/g,function(s){ if(s in tester.style){
			support = true;	
			supportPrefix["transform"] = lab3Prefix(s);
		}});
		info.supportTransform = support;
	
		//transition
		support = false;
		"transition WebkitTransition MozTransition OTransition msTransition".replace(/\S+/g,function(s){ if(s in tester.style){
			support = true;
			supportPrefix["transition"] = lab3Prefix(s);
		}});
		info.supportTransition = support;
	
		//getUserMedia
		info.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		info.supportGetUserMedia = !!info.getUserMedia;
	
		//ie8 fix nodelist slice
		info.supportNodeListSlice = (function(){try{Array.prototype.slice.call(NodeList);return true;}catch(e){return false;}}());
	
		//matches
		info.querySelectorAllName =
			('querySelectorAll'       in document) ? 'querySelectorAll' :
			('webkitQuerySelectorAll' in document) ? 'webkitQuerySelectorAll' :
			('msQuerySelectorAll'     in document) ? 'msQuerySelectorAll' :
			('mozQuerySelectorAll'    in document) ? 'mozQuerySelectorAll' :
			('oQuerySelectorAll'      in document) ? 'oQuerySelectorAll' : false;
		info.supportQuerySelectorAll = !!info.querySelectorAllName;
		info.supportStandardQuerySelectorAll = (info.querySelectorAllName === 'querySelectorAll');
		
		//matches
		info.matchesSelectorName = 
			('matches' in tester)               ? 'matches' :
			('webkitMatchesSelector' in tester) ? 'webkitMatchesSelector' :
			('msMatchesSelector'     in tester) ? 'msMatchesSelector' :
			('mozMatchesSelector'    in tester) ? 'mozMatchesSelector' :
			('oMatchesSelector'      in tester) ? 'oMatchesSelector' : false;
		
		info.supportMatches = !!info.matchesSelectorName;
		info.supportStandardMatches = (info.matchesSelectorName === 'matches');
		
		return info;
	}());
	
	var QUERY_SELECTOR_NAME = IB.ENV.querySelectorAllName;
	IB.QUERY_SELECTOR_ENGINE = IB.ENV.supportQuerySelectorAll && IB.ENV.supportNodeListSlice ? 
	function(node,selector){
		try {
			return Array.prototype.slice.call(
				(node||document)[QUERY_SELECTOR_NAME](
					selector.replace(/\[[\w\-\_]+\=[^\'\"][^\]]+\]/g, function(s){ 
						return s.replace(/\=.+\]$/,function(s){ 
							return '=\"' + s.substr(1,s.length-2) + '\"]'; 
						}) 
					})
				)
			);
		} catch(e) {
			console.error("IB::QUERY_SELECTOR_ENGINE error",node,selector);
			if(IB.DEBUGER === true)debugger;
		}
	
	}:
	function(node,selector){
		try {
			var nodeList = (node||document)[QUERY_SELECTOR_NAME](
				selector.replace(/\[[\w\-\_]+\=[^\'\"][^\]]+\]/g, function(s){ 
					return s.replace(/\=.+\]$/,function(s){ 
						return '=\"' + s.substr(1,s.length-2) + '\"]'; 
					}) 
				})
			);
		} catch(e) {
			console.error("IB::QUERY_SELECTOR_ENGINE error",node,selector);
			if(IB.DEBUGER === true)debugger;
		}
		var result = [];
		for(var i=0,l=nodeList.length;i<l;i++){
			nodeList[i] && result.push(nodeList[i]);
		} 
		return result;
	};
	//if natvie query selector in browser then alternative engine include
	if(!IB.QUERY_SELECTOR_ENGINE){
		if(typeof Sizzle === "function"){
			console.info("nody is sizzle selector engine detected");
			IB.QUERY_SELECTOR_ENGINE = function(node,selector){
				return Sizzle(selector,node);
			}
			IB.QUERY_SELECTOR_ENGINE_ID = "sizzle";
		} else if(typeof jQuery === "function") {
			console.info("nody is jquery selector engine detected");
			IB.QUERY_SELECTOR_ENGINE = function(node,selector){
				return jQuery(selector,node).toArray();
			}
			IB.QUERY_SELECTOR_ENGINE_ID = "jquery";
		}
	} else {
		IB.QUERY_SELECTOR_ENGINE_ID = "browser";
	}
	if(!IB.QUERY_SELECTOR_ENGINE){
		IB.QUERY_SELECTOR_ENGINE_ID = null;
		throw new Error("IB::ENV::IMPORTANT!! - querySelectorEngine is not detected");
	}
	var MATCHES_SELECTOR_NAME = IB.ENV.matchesSelectorName;
	IB.MATCHES_SELECTOR_ENGINE = IB.ENV.supportMatches && function(node,selector){ 
		//selectText fix
		return node[MATCHES_SELECTOR_NAME](
			selector.replace(/\[[\w\-\_]+\=[^\'\"][^\]]+\]/g, function(s){ 
				return s.replace(/\=.+\]$/,function(s){ 
					return '=\"' + s.substr(1,s.length-2) + '\"]'; 
				}) 
			})
		); 
	}; 
	//if natvie matches selector in browser then alternative engine include
	if(!IB.MATCHES_SELECTOR_ENGINE){
		if(typeof Sizzle === "function"){
			IB.MATCHES_SELECTOR_ENGINE = function(node,selector){
				return Sizzle.matchesSelector(node,selector);
			}
			IB.MATCHES_SELECTOR_ENGINE_ID = "sizzle";
		} else if(typeof jQuery === "function") {
			IB.MATCHES_SELECTOR_ENGINE = function(node,selector){
				return jQuery(node).is(selector);
			}
			IB.MATCHES_SELECTOR_ENGINE_ID = "jquery";
		}
	} else {
		IB.MATCHES_SELECTOR_ENGINE_ID = "browser";
	}
	if(!IB.MATCHES_SELECTOR_ENGINE){
		IB.MATCHES_SELECTOR_ENGINE_ID = null;
		throw new Error("IB::ENV::IMPORTANT!! - matchesSelectorEngine is not detected");
	}
	
	IB.ACTUAL_QUERY_SELECTOR = function(query,root){
		//querySelectorSupport
		if(typeof query !== "string" || (query.trim().length == 0)) return [];
		root = ((typeof root === "undefined")?document:CFIS.ELEMENT(root)?root:document);
		if(root == document) {
			return IB.QUERY_SELECTOR_ENGINE(root,query);
		} else {
			if(IB.MATCHES_SELECTOR_ENGINE(root,query))
			return [root].concat(Array.prototype.slice.call(IB.QUERY_SELECTOR_ENGINE(root,query)));
			return IB.QUERY_SELECTOR_ENGINE(root,query);
		}
	};
	
	
	// TODO :self replace and CFAS
	TODO.UNIQUE = function(){
		var value  = [],result = [];
		for(var ai=0,li=arguments.length;ai<li;ai++){
			var mvArray = IB.toArray(arguments[ai]);
			for(var i=0,l=mvArray.length;i<l;i++){
				var unique = true;
				for(var i2=0,l2=result.length;i2<l2;i2++){
					if(mvArray[i] == result[i2]){
						unique = false;
						break;
					}
				}
				if(unique==true) result.push(mvArray[i]);
			}
		}
		return result;
	};
	
	IB.METHOD({
		"query":IB.ACTUAL_QUERY_SELECTOR,
		"matches":function(node,selectText){
			if(!CFIS.ELEMENT(node)) return false;
			if((typeof selectText === "undefined") || selectText == "*" || selectText == "") return true;
			return IB.MATCHES_SELECTOR_ENGINE(node,selectText);
		},
		"findLite":function(find){
			if( typeof find === 'string' ){
				// [string,null]
				return IB.ACTUAL_QUERY_SELECTOR(find);
			} else if(CFIS.ELEMENT(find)){
				// [node]
				return [find];
			}  else if(CFIS.ARRAY(find)) {
				// [array]
				var fc = [];
				for(var i=0,l=find.length;i<l;i++) { 
					if( typeof find[i] === 'string' ) {
						// [array][string]
						var fs = IB.ACTUAL_QUERY_SELECTOR(find[i]);
						if(fs.length) fc = fc.concat( fs );
					} else if(CFIS.ELEMENT(find[i])) {
						// [array][node]
						fc.push(find[i]);
					} else if(CFIS.ARRAY(find[i])){
						var fa = IB.findLite(find[i]);
						if(fa.length) fc = fc.concat( fa );
					}
				}
				return TODO.UNIQUE(fc);
			}
			return [];
		},
		"attr":function(node,v1,v2){
			if(!CFIS.ELEMENT(node)) { console.error("IB.attr은 element만 가능합니다. => 들어온값" + N.tos(node)); return null; }
			if(arguments.length === 1) {
				return IB.inject(node.attributes,function(inj,attr){
					inj[attr.name] = node.getAttribute(attr.name);
				});
			} else if(typeof v1 === "object") {
				for(var k in v1) node.setAttribute(k,v1[k]);
			} else if(typeof v1 === "string"){
				var readMode   = typeof v2 === "undefined";
				var lowerKey = v1.toLowerCase();
				switch(lowerKey){
					case "readonly":
						if("readOnly" in node){
							if(readMode){
								return node.readOnly;
							} else {
								node.readOnly = v2;
								return node;
							}
						} 
						break;
					case "disabled": case "checked":
						if(lowerKey in node){
							if(readMode){
								return node[lowerKey];
							} else {
								node[lowerKey] = v2;
								return node;
							}
						}
						break;
				}
				if(readMode){
					var result = (node.getAttribute && node.getAttribute(v1)) || null;
			        if( !result ) {
			            var attrs = node.attributes;
			            if(!CFIS.USELESS(attrs)){
			            	var length = attrs.length;
			            	for(var i = 0; i < length; i++)
								if(attrs[i].nodeName === v1) {
									result = attrs[i].value;
									if(typeof result === "undefined") result = attrs[i].nodeValue;
								} 
			            }
			        }
			        return result;
				} else {
					node.setAttribute(v1,v2);
				}
			}
			return node;
		},
		//get css style tag info
		"trace":function(target,detail){
			var t = IB.findLite(target)[0];
			if( t ){
				var tag = t.tagName.toLowerCase();
				var tid = tclass = tname = tattr = tvalue = '';
				IB.forEach(IB.attr(t),function(value,sign){
					switch(sign){
						case "id"   : 
							var id = t.getAttribute(sign); 
							id.length && (tid='#'+id) ; 
							break;
						case "class": 
							tclass = t.getAttribute(sign).trim().replace(/\s\s/g,' ').split(' ').join('.'); 
							if(tclass) tclass = "." + tclass;
							break;
						case "name" : tname  = "[name="+t.getAttribute(sign)+"]"; break;
						case "value": break;
						default     :
							if(detail == true) {
								attrValue = t.getAttribute(sign);
								tattr += ( (attrValue == '' || attrValue == null) ? ("["+sign+"]") : ("["+sign+"="+attrValue+"]") );
							}
						break; 
					}
				});
				if(detail == true) {
					if(!/table|tbody|thead|tfoot|ul|ol/.test(tag)) {
						var tv = N.node.value(t);
						if(typeof tv !== undefined || tv !== null ) if(typeof tv === 'string' && tv.length !== 0) tvalue = '::'+tv;
						if(typeof tvalue === 'string') tvalue = tvalue.trim();
					}
				}
				return tag+tid+tclass+tname+tattr+tvalue;
			} else {
				console.warn("IB.trace::target is not element or selector // target =>",target);
			}
		},
		"findByOnePlace":function(findse,rootNode){
			if(typeof findse === 'string') return IB.ACTUAL_QUERY_SELECTOR(findse,rootNode);
			if( CFIS.ELEMENT(findse) ) {
				var fs = IB.ACTUAL_QUERY_SELECTOR(IB.trace(findse),rootNode);
				for(var i=0,l=fs.length;i<l;i++) if(findse === fs[i]) return [findse];
			}
			if( CFIS.ARRAY(findse) ) {
				var result = [];
				for(var i=0,l=findse.length;i<l;i++) {
					var fd = IB.findByOnePlace(findse[i],rootNode);
					if( fd.length ) result = result.concat(fd);
				}				
				return TODO.UNIQUE(result);
			}
			return [];
		},
		"findBySeveralPlaces":function(find,root){
			if(arguments.length === 1 || typeof root === 'undefined' || root === null || root === window.document ) return IB.findLite(find);
			// find root
			var targetRoots = IB.findLite(root);
			if(targetRoots.length === 0) {
				return IB.findLite(find);
			}
			//
			var findes = CFAS.ARRAY(find);
			var result = [];
			for(var i=0,l=targetRoots.length;i<l;i++) {
				for(var fi=0,fl=findes.length;fi<fl;fi++) {
					var fdr = IB.findByOnePlace(findes[fi],targetRoots[i]);
					if( fdr.length ) result = result.concat(fdr);
				}
			}
			return TODO.UNIQUE(result);
		},
		//최적화 분기하여 샐랙터를 실행시킴
		"find" : function(find,root,eq){
			return (typeof root === "number") ? IB.findLite(find)[root] :
			(typeof eq === "number") ? IB.findBySeveralPlaces(find,root)[eq] : IB.findBySeveralPlaces(find,root);
		},
		"search":function(find,root,eq){
			var root   = IB.find(root);
			var findes = IB.find(find,root);
			if(!root.length) return findes;
			return IB.matches(root,find) ? root.concat(findes) : findes;
		}
	});
	
	var IBWEB_MODULE = {
		"":{
			$$directives:{}
		}
	};
	
	IB.METHOD({
		directive:function(directiveName,controller){
			if(typeof directiveName === "string" && typeof controller === "function"){
				IBWEB_MODULE[""].$$directives[directiveName] = controller;
			}
		},
		bootstrap:function(root){
			var rootEl = IB.findLite(root);
			IB.each(IB.find("[ib-app]"),function(appElement){
				if(!appElement.__ibapp__) {
					var application = IBWEB_MODULE[appElement.getAttribute("ib-app")];
					if(application){
						IB.forEach(application.$$directives,function(directive,selector){
							var selectElements = IB.find(selector,rootEl.length?rootEl:(void 0));
							IB.each(selectElements,function(directiveElement){
								if(!directiveElement.hasOwnProperty("__ibdirective__")){
									var elementAttribute = {};
									IB.forEach(directiveElement.attributes,function(attribute,key){
										if(!isNaN(+key) && attribute && attribute.name){
											elementAttribute[attribute.name] = attribute.value;
										}
									});
									directiveElement.__ibdirective__ = directive(directiveElement,directiveElement.dataset,elementAttribute);
								}
							});
						});
					}
				}
			});
		}
	});
	
	// Mozilla, Opera, Webkit 
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", function () {
			document.removeEventListener("DOMContentLoaded", arguments.callee, false);
			IB.bootstrap();
		}, false);
	};
});