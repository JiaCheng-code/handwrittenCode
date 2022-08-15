const PROMISE_STATE_FULFILLED = "fulfilled"
const PROMISE_STATE_PENDING = "pending"
const PROMISE_STATE_REJECTED = "rejected"
class ZPromise{
    constructor(executor){
        this.status = PROMISE_STATE_PENDING
        this.value = undefined
        this.reason = undefined
        const resolve = (value)=>{
            if(this.status === PROMISE_STATE_PENDING){
                this.status = PROMISE_STATE_FULFILLED
                this.value = value
                console.log(value);
            }
        }
        const reject = (reason)=>{
            if(this.status === PROMISE_STATE_PENDING){
                this.status = PROMISE_STATE_REJECTED
                this.reason = reason
                console.log(reason);
            }
        }
        executor(resolve,reject)
    }
}
const promise = new ZPromise((resolve,reject)=>{
    // resolve(111)
    reject(222)
})