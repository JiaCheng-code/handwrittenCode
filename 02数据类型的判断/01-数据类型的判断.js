/**
 * @description: typeof可以正确识别Undefined/Boolean/Number/String/Synbol/Function等类型的数据，但是对于其他的都会认为是object。比如Null，Date等，所以通过typeof来判断数据类型会不准确。但是可以使用Object.prototype.toString
 * @param {*} obj
 * @return {*}
 */
function typeOf(obj){
    let res = Object.prototype.toString.call(obj).split(' ')[1]
    //substring:字符串截取 toLowerCase:大写转小写
    res = res.substring(0,res.length-1).toLowerCase()
    return res
}
const res = typeOf("{}")
console.log(res);