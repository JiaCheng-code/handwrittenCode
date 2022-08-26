/**
 *
 * @param {*} thisArg
 * @param  {...any} res 多个参数如:res1,res2,res3... 利用剩余参数来接收
 * apply() 方法调用一个具有给定 this 值的函数，以及以一个数组（或一个类数组对象）的形式提供的参数。
 * apply()和call()类似 就是 call() 方法接受的是一个参数列表，而 apply() 方法接受的是一个包含多个参数的数组。
 */
Function.prototype.myApply = function (thisArg, argArray) {
  //1.绑定this
  let fn = this;
  //边界判断:1.对thisArg转为对象类型(防止它传入的是非对象类型)2.判断null、undefined(自动替换为指向全局对象:window)
  thisArg = thisArg ? Object(thisArg) : window;
  //额外参数判断
  //2.通过绑定的this调用需要被执行的函数
  thisArg.fn = fn;
  //判断argArray是否有值
  argArray = argArray || [];
  let result = thisArg.fn(...argArray);
  //3.删除属性
  delete thisArg.fn;

  //4.返回结果
  return result;
};
function add(num1, num2) {
  return num1 + num2;
}
console.log("系统调用:" + add.apply({}, [123, 456]));
console.log("编写call函数调用:" + add.myApply({}, [123, 456]));
