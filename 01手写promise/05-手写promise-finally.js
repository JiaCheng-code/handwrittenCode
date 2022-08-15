const PROMISE_STATE_PENDING = "pending";
const PROMISE_STATE_FULFILLED = "fulfilled";
const PROMISE_STATE_REJECTED = "rejected";
/**
 * 工具函数
 * 处理try..catch重复代码过多的问题
 * @param execFn function 执行函数
 * @param value string 执行函数的入参
 * @param resolve promise
 */
function execFunctionWithCatchError(execFn,value,resolve,reject){
  try {
    const result = execFn(value)
    resolve(result)
  }catch(err){
    reject(err)
  }
}

class ZPromise {
  constructor(executor) {
    // 通过状态实现resolve和reject的调用情况
    this.status = PROMISE_STATE_PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledFns = [];
    this.onRejectedFns = [];
    const resolve = (value) => {
      if (this.status === PROMISE_STATE_PENDING) {
        /**
         * 微队列:开启异步操作
         */
        queueMicrotask(() => {
          /**
           * 解决resolve和reject同时存在出现调用冲突的问题
           * 状态不为padding不会进来
           */
          if (this.status !== PROMISE_STATE_PENDING) return;
          this.status = PROMISE_STATE_FULFILLED;
          this.value = value;
          console.log("resolve被调用");
          this.onFulfilledFns.forEach((fn) => {
            fn();
          });
        });
      }
    };
    const reject = (reason) => {
      if (this.status === PROMISE_STATE_PENDING) {
        queueMicrotask(() => {
           /**
           * 解决resolve和reject同时存在出现调用冲突的问题
           * 状态不为padding不会进来
           */
          if (this.status !== PROMISE_STATE_PENDING) return;
          this.status = PROMISE_STATE_REJECTED;
          this.reason = reason;

          console.log("reject被调用");
          this.onRejectedFns.forEach((fn) => {
            fn();
          });
        });
      }
    };
    /**
     * 执行resolve，reject两个函数的入参
     */
    try{
      executor(resolve, reject);
    }catch(err){
      reject(err)
    }
  }
  then(onFulfilled, onRejected) {
    // catch通过throw抛出
    const defaultOnRejected =  err=>{throw err}
    onRejected = onRejected || defaultOnRejected

    const defaultOnFulfilled = value =>{throw value}
    onFulfilled = onFulfilled || defaultOnFulfilled

    return new ZPromise((resolve, reject) => {
      //如果调用的时候状态已经确认了直接进行调用，用于实现多个then不连续调用
      if (this.status === PROMISE_STATE_FULFILLED && onFulfilled) {
        execFunctionWithCatchError(onFulfilled,this.value,resolve,reject)
      }
      if (this.status === PROMISE_STATE_REJECTED && onRejected) {
        execFunctionWithCatchError(onRejected,this.reason,resolve,reject)
      }
      // 将成功回调和失败回调放入数组
      //padding状态的时候加入数组
      if (this.status === PROMISE_STATE_PENDING) {
         // 避免onFulfilled为空
        if (onFulfilled) {
            this.onFulfilledFns.push(()=>{
                execFunctionWithCatchError(onFulfilled,this.value,resolve,reject)
            });
        }
        // 避免onRejected为空
        if(onRejected){
            this.onRejectedFns.push(()=>{
                execFunctionWithCatchError(onRejected,this.reason,resolve,reject)
            });
        }
      }
    });
  }
  catch(onRejected){
    return this.then(undefined,onRejected)
  }
  /**
   * 传入一个函数，然后不管then是resolve状态还是reject状态都执行这个函数
   */
  finally(onFinally){
    this.then(()=>{
      onFinally()
    },()=>{
      onFinally()
    })
  }
}
const promise = new ZPromise((resolve, reject) => {
  // throw new Error('123')
  resolve(111);
  reject(222);
});

promise.then((res)=>{
  console.log('res1',res);
  return "aaa"
}).then((res)=>{
  console.log("res2",res);
}).catch((err)=>{
  console.log("err",err);
}).finally(()=>{
  console.log("finally");
})
