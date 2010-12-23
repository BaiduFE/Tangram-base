/*
 * Tangram
 * Copyright 2009 Baidu, Inc. All rights reserved.
 * 
 * path: baidu/sio/_removeScriptTag.js
 * author: berg
 * thanks: kexin, xuejian
 * version: 1.0.0
 * date: 20100527
 */

///import baidu.sio;

/**
 * 删除script的属性，再删除script标签，以解决修复内存泄漏的问题
 *
 * 
 * @param {object}          scr               script节点
 */
baidu.sio._removeScriptTag = function(scr){
    if (scr.clearAttributes) {
        scr.clearAttributes();
    } else {
        for (var attr in scr) {
            if (scr.hasOwnProperty(attr)) {
                delete scr[attr];
            }
        }
    }
    if(scr && scr.parentNode){
        scr.parentNode.removeChild(scr);
    }
    scr = null;
};
