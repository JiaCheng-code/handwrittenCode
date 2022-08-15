const PROMISE_STATE_FULFILLED = "fulfilled"
const PROMISE_STATE_PENDING = "pending"
const PROMISE_STATE_REJECTED = "rejected"
class ZPromise{
    constructor(executor){
        this.status = PROMISE_STATE_PENDING
        this.value = undefined
        this.reason = undefined
        const resolve = (value)=>{
            queueMicrotask(()=>{
                if(this.status === PROMISE_STATE_PENDING){
                    this.status = PROMISE_STATE_FULFILLED
                    this.value = value
                    this.onFulfilled(this.value)
                }
            })
        }
        const reject = (reason)=>{
            queueMicrotask(()=>{
                if(this.status === PROMISE_STATE_PENDING){
                    this.status = PROMISE_STATE_REJECTED
                    this.reason = reason
                    this.onRejected(this.reason)
                }
            })
        }
        executor(resolve,reject)
    }
    then(onFulfilled,onRejected){
        this.onFulfilled = onFulfilled
        this.onRejected = onRejected
    }
}
const promise = new ZPromise((resolve,reject)=>{
    resolve(111)
    reject(222)
})
promise.then(res=>{
    console.log('res',res);
},err=>{
    console.log('err',err);
})