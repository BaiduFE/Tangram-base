/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 */

///import baidu.async;
///import baidu.object.extend;
/**
 * 用于支持异步处理, 使同步异步的调用风格统一.
 * @class
 * @grammar new baidu.async.Deferred()
 * @remark
 * 示例: 
    function someAsync(){
        var deferred = new baidu.async.Deferred();
        setTimeout(function(){
            afterSomeOperation();
            if(someReason){
                deferred.success(someValue);
            } else {
                deferred.fail(someError);
            }
        },100);
        return deferred;
    }
    //用类似同步的方式调用异步操作.
    someAsync().then(onSuccess, onFail);
    //onSuccess或onFail可以确保在正确的时间点执行.

 * @author rocy
 */
baidu.async.Deferred = function(){
    var me = this;
    baidu.extend(me,{
        _fired : 0,
        _firing : 0,
        _cancelled : 0,
        _successChain : [],
        _failChain : [],
        _result : [],
        _isError : 0
    });

    function fire(){
        if(me._cancelled || me._firing){
            return;
        }
        me._firing = 1;
        var chain = me._isError ? me._failChain : me._successChain,
            result = me._result[ me._isError ? 1 : 0];
        // 此处使用while而非for循环,是为了避免firing时插入新函数.
        while(chain[0]) {
            //所有函数仅调用一次.
            //TODO: 支持传入 this 和 arguments, 而不是仅仅一个值.
            try {
                chain.shift().call(me, result);
            } catch (error) {
                throw error;
            } finally {
                me._fired = 1;
                me._firing = 0;
            }
        }
    }
    

    /**
     * 调用onSuccess链.使用给定的value作为函数参数.
     * @param {*} value 成功结果.
     * @return {baidu.async.Deferred} this.
     */
    me.success = function(value){
        me._result[0] = value;
        fire();
        return me;
    };

    /**
     * 调用onFail链. 使用给定的error作为函数参数.
     * @param {Error} error 失败原因.
     * @return {baidu.async.Deferred} this.
     */
    me.fail = function(error){
        me._result[1] = error;
        me._isError = 1;
        fire();
        return me;
    };

    /**
     * 添加onSuccess和onFail方法到各自的链上. 如果该deferred已触发,则立即执行.
     * @param {Function} onSuccess 该deferred成功时的回调函数.第一个形参为成功时结果.
     * @param {Function} onFail 该deferred失败时的回调函数.第一个形参为失败时结果.
     * @return {baidu.async.Deferred} this.
     */
    me.then = function(onSuccess, onFail){
        me._successChain.push(onSuccess);
        me._failChain.push(onFail);
        if(me._fired){
            fire();
        }
        return me;
    };

    /**
     * 中断该deferred, 使其失效.
     */
    me.cancel = function(){
        me._cancelled = 1;
    };
};