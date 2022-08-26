/**
 * bind() 最简单的用法是创建一个函数，不论怎么调用，这个函数都有同样的 this 值
 */
Function.prototype.myBind = function (thisArg, ...argArray) {
  //1.绑定this
  let fn = this;
  //边界判断:1.对thisArg转为对象类型(防止它传入的是非对象类型)2.判断null、undefined(自动替换为指向全局对象:window)
  thisArg = thisArg ? Object(thisArg) : window;
  return function proxyFn(...args) {
    //2.调用需要被执行的函数
    thisArg.fn = fn;
    let finalArgs = [...argArray, ...args];
    let result = thisArg.fn(...finalArgs);
    //3.删除属性
    delete thisArg.fn();
    //4.返回结果
    return result;
  };
};
function add(num1, num2) {
  return num1 + num2;
}
console.log("系统调用:" + add.bind({})(123, 456));
console.log("编写call函数调用:" + add.myBind({})(123, 456));
