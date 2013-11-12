function outerFn(i,j)
{
    var x = i + j;
    var y = i + j;
    return function innerFn(x)
    {

        var txt =  i + x;

        return function innerFn1(){
            var i = txt;
            return y;
        };
    }
}



var func1 = outerFn(5,6);
var func2 = outerFn(10,20);

var func1_1 = func1(10);
var func2_1 = func2(10);


console.log(func1_1());
console.log(func2_1());
