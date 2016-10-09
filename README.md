# IntefaceBuild js
의 영향과 액션을 통한 모델을 효율적인 값 변화를 위해 


## 영향받은것들
객체지향이란 단순 매서드와 데이터의 묶음이다 라는 말과 프로미스 패턴

## feature
- Pre-defined action pattern
- Enumerator are always self replace 

## Design goal
render the element


## Code design


### function style
```javascript

var data = [1,2,3];
ib.map([1,2,3],function(v){ return b+1; });

data;
//=> [2, 3, 4]

```


###  build style

```javascript

var plusOne = ib().map(function(v){ return v+1; }).build();

plusOne([1,2,3]);
//=> [2,3,4];

```

```javascript

var totalObject = {};
var totalObjectPlusAction = ib(totalObject)
                            .map(function(v){ return v+1; })
                            .inst(function(data){ this.result = 0; ib.each(data,function(v){ this.result += v; return data;  }.bind(this)) })
                            .build();

totalObjectPlusAction([1,2,3]);
//=> [2, 3, 4]

totalObject;
//=> {result: 9}

```

```javascript

var a={name:"a"},b={name:"b"},c={name:"c"};

var plusOneAction = ib(a)
                    .map(function(v){ return v+1; })
                    .inst(function(data){ this.result = data; return this; })
                    .build();

plusOneAction([1,2,3]);
//=> {name: "a", result: [2, 3, 4]}

plusOneAction.bind(b)([2,3,4]);
//=> {name: "b", result: [3, 4, 5]}

plusOneAction.bind(c)([3,4,5]);
//=> {name: "c", result: [4, 5, 6]}

plusOneAction([4,5,6]);
a;
//=> {name: "a", result: [5, 6, 7]}

```