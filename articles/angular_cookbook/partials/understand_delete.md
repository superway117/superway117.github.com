##理解delete

delete是一个操作符,用来删除对象的属性(或者删除数组里面一个元素，数组只是一个比较特殊的对象而已).     
delete操作并不会直接去释放内存（内存释放**只能**间接的通过删除引用关系来实现）

**语法**    

	delete expression
这里expression执行完必须是一个对象的属性. 例如.
    
    delete variableName //variableName必须是一个隐式声明的全局变量.
    delete objectExpression.property
    delete objectExpression["property"]
    delete objectExpression[index]
    delete property // 只有在with语句块内才合法.
如果 expression 的计算结果不是一个对象的属性引用,那么,delete不会起任何作用.    

**参数**    
*objectName*        
对象名.    
*property*   
需要删除的属性.    
*index*    
需要删除的数组索引.     

**返回值**    

在strict mode下,如果属性是当前对象自己的属性(非prototype继承的)并且是non-configurable的,执行delete会抛出一个异常;非stric mode, 返回false.    
其他情况都返回true,即便实际没有删除属性.  
   
	myobj = {
	  h: 4,
	  k: 5
	};
	
	delete x;       // returns true  (x is a property of the global object and can be deleted)   

**关于non-configurable**       
在javascript中,针对对象的属性,存在着属性描述符的概念,、属性描述符可以用来定义属性的读写函数(setter-getter),定义属性是否是writeable(writable),**是否可以删除(configurable)**,是否可以被枚举到(enumerable)等等.     
javascript提供了函数[Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)来定义修改属性以及属性描述符.    

本文提到的non-configurable也就是属性描述符configurable为false的情况，这个时候属性描述符表示该属性是不可以被delete的, 很多文章也把这个属性称为donotDelete属性.    

基本上了解了non-configurable这个概念,我们就可以解释为什么很多情况我们的删除是无效的.     

**预定义的对象不能被删除**    
预定义的对象,比如 Object, Array, Math等等,他们都是global object的一个属性,且configurable描述符是false,所以他们是不能被删除的.  

	delete Math.PI; // returns false (delete doesn't affect certain predefined properties) 
	 
**定义的变量和函数不能被删除**    
前面scope chain章节里,我们提到如果在global环境里面定义的变量或者函数会被javascript engine认为是global object的属性.如果在函数里面,则被认为是activation object的属性. 不论是哪种情况,属性的configurable都是被设置成false的,所以是不能被删除的.

	var GLOBAL_OBJECT = this;

	/* create global property via variable declaration; property's configurable is false */
    var y = 43;    
    delete y;     

这里需要注意的是通过var申明的才算变量. 比如直接 x=5, 他被直接认为是global object的属性,但是configurable是true的,所以.
	
    var GLOBAL_OBJECT = this;

	/* create global property via variable declaration; property's configurable is false */
	var foo = 1;
	
	/* create global property via undeclared assignment; property's configurable is true */
	bar = 2;
	
	delete foo; // false
	typeof foo; // "number"
	
	delete bar; // true
	typeof bar; // "undefined"


另外,我们还需要记住的是虽然delete返回成功,但是属性不一定真的被删除.
    
**删除通过prototype继承的属性返回true,但是删除无效**     
一个对象通过prototype从父类那边继承了一个属性,去删除这个属性的时候,返回的是true,但是实际上,这个删除没有任何实际的作用.

	function Foo(){}
	Foo.prototype.bar = 42;
	var foo = new Foo();
	delete foo.bar;           // returns true, but with no effect, since bar is an inherited property
	console.log(foo.bar);           // alerts 42, property still inherited
	delete Foo.prototype.bar; // deletes property on prototype
	console.log(foo.bar);           // alerts "undefined", property no longer inherited


**删除数组里面的元素**    
我们知道数组也是对象,数组的内部实际就是把index当做key来实现.比如.

	var arr = ["a","b"]
相当于

	var arr = {}
    arr["1"]="a";
    arr["2"]="b";
这个时候要去删除其中index=3的元素,也就是相当于删除obj["3"]，看下面例子.

	var trees = ["redwood","bay","cedar","oak","maple"];
	
	delete trees[3];
	if (3 in trees) {
	    // this does not get executed
	}
属性"3"被删掉了,不过删除数组需要注意的是他的length并没有变.也就是说上面的例子,执行delete trees[3]后tree3.length和删除之前是一样的,这一点有点难理解,在mozilla的javasript文档里面也没有找到解释,但是不妨先记住它.

**关于eval函数**  
eval函数里面定义的变量是作为global object或者activation object的属性存在的（可以参考scope chain章节）,这里单独把他提出来,是因为eval里面定义的变量,他们的属性的configurable是true,也就是说这里定义的变量是可以被删除的.

	eval('var foo = 1;');
    foo; // 1
    delete foo; // true
    typeof foo; // "undefined"
定义在函数里面也一样.
	
    (function(){

	    eval('var foo = 1;');
	    foo; // 1
	    delete foo; // true
	    typeof foo; // "undefined"

    })();

**firebug的执行结果怎么不对?**  
先看下面的代码,在firebug里面执行的结果.
 
    var sum = function(a, b) {return a + b;}
    var add = sum;
    delete sum  //return true
    typeof sum;  // "undefined"

结果是firebug里面定义的变量是可以删除的, 如果正常应该是返回false的.这里就是因为firebug的执行是通过eval来实现的.所以才会出现这样的结果.    

参考文章
>[kangax: understanding-delete](http://perfectionkills.com/understanding-delete/)    
>[Mozilla: delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete)    
>[MSDN delete Operator (JavaScript) ](http://msdn.microsoft.com/en-us/library/2b2z052x%28VS.85%29.aspx)   
>[Mozilla: Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)    
>[Mozilla: JS_GetPropertyAttributes](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference/JS_GetPropertyAttributes)    