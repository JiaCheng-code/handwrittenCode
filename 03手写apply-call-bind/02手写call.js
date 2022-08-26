/**
 *
 * @param {*} thisArg
 * @param  {...any} res 多个参数如:res1,res2,res3... 利用剩余参数来接收
 * call() 方法使用一个指定的 this 值和单独给出的一个或多个参数来调用一个函数
 */
Function.prototype.myCall = function (thisArg, ...res) {
  //1.绑定this
  let fn = this;
  //边界判断:1.对thisArg转为对象类型(防止它传入的是非对象类型)2.判断null、undefined(自动替换为指向全局对象:window)
  thisArg = thisArg ? Object(thisArg) : window;
  //额外参数判断
  //2.调用需要被执行的函数
  thisArg.fn = fn;
  let result = thisArg.fn(...res);
  //3.删除属性
  delete thisArg.fn;

  //4.返回结果
  return result;
};
function add(num1, num2) {
  return num1 + num2;
}
console.log("系统调用:" + add.call({}, 123, 456));
console.log("编写call函数调用:" + add.myCall({}, 123, 456));
