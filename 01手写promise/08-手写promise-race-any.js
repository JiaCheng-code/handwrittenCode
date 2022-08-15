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
          this.onFulfilledFns.forEach((fn) => {
            fn(this.value);
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

          this.onRejectedFns.forEach((fn) => {
            fn(this.reason);
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
  /**
   * then中第一个resolve传入undefined来避免执行resolve的方法，传入onRejected来执行reject方法
   */
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
  static resolve(value){
    return new ZPromise((resolve)=>{resolve(value)})
  }
  static reject(reason){
    return new ZPromise((reject)=>{reject(reason)})
  }
  static all(promises){
    // 问题关键，什么时候执行resolve，什么时候执行reject
    return new ZPromise((resolve,reject)=>{
      const values = []
      promises.forEach((promise)=>{
        promise.then((res)=>{
          values.push(res)
          if(values.length === promises.length){
            resolve(values)
          }
        },(err)=>{
          reject(err)
        })
      })
    })
  }
  /**
   * 返回所有promise的状态（状态和value）
   * @param promises Array true 传入参与竞赛的promise对象
   * @return ZPromise
   */
  static allSettled(promises){
    return new ZPromise((resolve)=>{
      const results = []
      promises.forEach((promise)=>{
        promise.then(res=>{
          results.push({
            status:PROMISE_STATE_FULFILLED,
            value:res
          })
          if(results.length===promises.length) resolve(results)
        },err=>{
          results.push({
            status:PROMISE_STATE_REJECTED,
            value:err
          })
          if(results.length===promises.length) resolve(results)
        })
      })
      
    })
  }
  /**
   * 竞赛：谁先进入执行谁 只要求有一个结果
   * @param promises Array true 传入参与竞赛的promise对象
   * @return ZPromise
   */
  static race(promises){
    return new ZPromise((resolve,reject)=>{
      promises.forEach(promise=>{
        /**
         * 进入就执行
         */
        promise.then(res=>{
          resolve(res)
        },err=>{
          reject(err)
        })
      })
    })
  }
  /**
   * 该方法用于获取首个兑现的 promise 的值。只要有一个 promise 兑现了，那么此方法就会提前结束，而不会继续等待其他的 promise 全部敲定。
   * 请求一：resolve 必须等到有一个成功的结果
   * 请求二：reject 所有的都失败了抛出AggregateError错误 errors里面查看抛出的所有错误
   * @return promise
   */
  static any(promises){
    return new ZPromise((resolve,reject)=>{
      const reasons = []
      promises.forEach((promise)=>{
        promise.then(res=>{
          resolve(res)
        },err=>{
          reasons.push(err)
          if(reasons.length === promises.length) reject(new AggregateError(reasons))
        })
      })
    })
  }
}
const p1 = new ZPromise((resolve,reject)=>{
  reject(2222)

})
const p2 = new ZPromise((resolve,reject)=>{
  reject(2222)
})
const p3 = new ZPromise((resolve,reject)=>{
  setTimeout(()=>{
    reject(2222)

  },3000)
})
ZPromise.any([p1,p2,p3]).then((res)=>{
  console.log(res);
}).catch((err)=>{
  console.log(err.errors);
})

