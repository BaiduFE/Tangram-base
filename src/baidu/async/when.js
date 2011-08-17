/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.async;
///import baidu.async._isDeferred;
///import baidu.async.Deferred;
/**
 * 保证onResolve或onReject可以按序执行. 若第一个参数为deferred,则deferred完成后执行.否则立即执行onResolve,并传入第一个参数.
 * @grammar baidu.async.when(deferredOrValue, onResolve, onReject)
 * @param {baidu.async.Deferred|*} deferredOrValue deferred实例或任意值.
 * @param {Function} onResolve 成功时的回调函数.若第一个参数不是Deferred实例,则立即执行此方法.
 * @param {Function} onReject 失败时的回调函数.
 * @version 1.3.9 
 * @remark
 * 示例一:异步调用: baidu.async.when(asyncLoad(), onResolve, onReject).then(nextSuccess, nextFail);
 * 示例二:同步异步不确定的调用: baidu.async.when(syncOrNot(), onResolve, onReject).then(nextSuccess, nextFail);
 * 示例三:同步接异步的调用: baidu.async.when(sync(), onResolve, onReject).then(asyncSuccess, asyncFail).then(afterAllSuccess, afterAllFail);
 * @return {baidu.async.Deferred} deferred.
 */
baidu.async.when = function(deferredOrValue, onResolve, onReject) {
    if (baidu.async._isDeferred(deferredOrValue)) {
        deferredOrValue.then(onResolve, onReject);
        return deferredOrValue;
    }
    var deferred = new baidu.async.Deferred();
    deferred.then(onResolve, onReject).resolve(deferredOrValue);
    return deferred;
};
