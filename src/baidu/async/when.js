/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.async;
///import baidu.async._isDeferred;
///import baidu.async.Deferred;
/**
 * 保证onSuccess或onFail可以按序执行. 若第一个参数为deferred,则deferred完成后执行.否则立即执行onSuccess,并传入第一个参数.
 * @param {baidu.async.Deferred|*} deferredOrValue deferred实例或任意值.
 * @param {Function} onSuccess 成功时的回调函数.若第一个参数不是Deferred实例,则立即执行此方法.
 * @param {Function} onFail 失败时的回调函数.
 * @remark
 * 示例一:异步调用: baidu.async.when(asyncLoad(), onSuccess, onFail).then(nextSuccess, nextFail);
 * 示例二:同步异步不确定的调用: baidu.async.when(syncOrNot(), onSuccess, onFail).then(nextSuccess, nextFail);
 * 示例三:同步接异步的调用: baidu.async.when(sync(), onSuccess, onFail).then(asyncSuccess, asyncFail).then(afterAllSuccess, afterAllFail);
 * @return {baidu.async.Deferred} deferred.
 */
baidu.async.when = function(deferredOrValue, onSuccess, onFail) {
    if (baidu.async._isDeferred(deferredOrValue)) {
        deferredOrValue.then(onSuccess, onFail);
        return deferredOrValue;
    }
    var deferred = new baidu.async.Deferred();
    deferred.then(onSuccess, onFail).success(deferredOrValue);
    return deferred;
};
